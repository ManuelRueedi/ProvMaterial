import { and, eq, gte, lt, lte, asc, desc, sql, inArray } from "drizzle-orm";
import {
  ConfigSchema,
  type Ampacity,
  type Connector,
  type Config,
  type ArticleSearchResponse,
} from "@/composables/articles/types";
import { articles } from "~~/server/database/schema";

export default defineEventHandler(async (event) => {
  requireUserSession(event);

  const body = (await readBody(event)) as Config;

  ConfigSchema.parse(body);

  const ampMap: Record<Ampacity, number> = {
    "≤13A": 13,
    "16A": 16,
    "32A": 32,
    "63A": 63,
    "≥125A": 125,
  };

  const type = body.type;

  let searchQuery;
  const inStorage = eq(articles.locationId, articles.storageLocationId);

  if (body.ampacity !== null) {
    const amps = ampMap[body.ampacity];
    /* ---------- base WHERE for type & ampacity range ---------- */
    searchQuery =
      amps === 13
        ? and(eq(articles.type, type), lte(articles.ampacity, amps))
        : amps === 125
          ? and(eq(articles.type, type), gte(articles.ampacity, amps))
          : and(eq(articles.type, type), eq(articles.ampacity, amps));
  } else {
    /* ---------- base WHERE for type ---------- */
    searchQuery = eq(articles.type, type);
  }

  if (body.connector !== null) {
    const connector = body.connector;
    searchQuery = and(searchQuery, eq(articles.connector, connector));
  }

  // sockets
  const jp = (k: string) => (/^[\w]+$/.test(k) ? `$.${k}` : `$."${k}"`);
  const socketsSQL = (s: typeof body.sockets) =>
    Object.entries(s).map(
      ([c, n]) =>
        sql`CAST(json_extract(${articles.outputs}, ${jp(c)}) AS INTEGER) >= ${n}`,
    );

  if (body.sockets && Object.keys(body.sockets).length > 0) {
    // Convert Partial<Record<Connector, number>> to Record<Connector, number>
    const sockets = Object.fromEntries(
      Object.entries(body.sockets).filter(([_, v]) => v !== undefined),
    ) as Record<Connector, number>;

    searchQuery = and(searchQuery, ...socketsSQL(sockets));
  }

  if (body.tags.length) {
    const clauses = body.tags.map(
      (tag) => sql`
      EXISTS (
        SELECT 1
        FROM   json_each(${articles.tags})
        WHERE  json_each.value = ${tag}
      )
    `,
    );

    // require every tag to be present
    searchQuery = and(searchQuery, ...clauses);
  }

  const drizzle = useDrizzle();

  /* ---------- IGNORE length when 0 or undefined ---------- */
  if (body.length === 0) {
    const items = await drizzle.query.articles.findMany({
      columns: {
        id: true,
        type: true,
        connector: true,
        outputs: true,
        lengthInMeter: true,
        storageLocationSection: true,
        tags: true,
      },
      with: { storageLocation: { columns: { id: false } } },
      where: and(inStorage, searchQuery),
      orderBy: asc(articles.lengthInMeter),
      limit: 3,
    });
    if (!items.length) {
      throw createError({
        statusCode: 404,
        statusMessage: "No matching items",
      });
    }
    return { items } as ArticleSearchResponse;
  }

  /* ---------- length > 0 : singles then bundles ---------- */
  const items = await drizzle.query.articles.findMany({
    columns: {
      id: true,
      type: true,
      connector: true,
      outputs: true,
      lengthInMeter: true,
      storageLocationSection: true,
      tags: true,
    },
    with: { storageLocation: { columns: { id: false } } },
    where: and(
      inStorage,
      searchQuery,
      gte(articles.lengthInMeter, body.length),
    ),
    orderBy: asc(articles.lengthInMeter),
    limit: 3,
  });

  if (items.length >= 3) return { items } as ArticleSearchResponse;

  const pool = await drizzle.query.articles.findMany({
    columns: {
      id: true,
      lengthInMeter: true,
    },
    with: { storageLocation: { columns: { id: true } } },
    where: and(inStorage, searchQuery, lt(articles.lengthInMeter, body.length)),
    orderBy: desc(articles.lengthInMeter),
  });

  /* ---------- build “bundle” suggestions (2- or 3-part) ---------- */

  type RowLite = {
    id: string;
    lengthInMeter: number;
    storageLocation: { id: number };
  };

  const target = body.length; // requested total (metres)
  const combosNeed = 3 - items.length; // 0…3 singles still missing
  const poolRest: RowLite[] = [...pool]; // copy so we can mark used

  type Candidate = { combo: RowLite[]; diff: number };
  const candidates: Candidate[] = [];

  for (const locId of new Set(poolRest.map((r) => r.storageLocation.id))) {
    const group = poolRest
      .filter((r) => r.storageLocation.id === locId)
      .sort((a, b) => b.lengthInMeter - a.lengthInMeter);

    for (let i = 0; i < group.length; i++) {
      const first = group[i];
      if (!first) continue;

      for (let j = i + 1; j < group.length; j++) {
        const second = group[j];
        if (!second) continue;

        /* -------- 2-item combo -------- */
        const twoSum = first.lengthInMeter + second.lengthInMeter;
        if (twoSum >= target) {
          candidates.push({ combo: [first, second], diff: twoSum - target });
        }

        /* -------- 3-item combo -------- */
        for (let k = j + 1; k < group.length; k++) {
          const third = group[k];
          if (!third) continue; // ✔

          const threeSum = twoSum + third.lengthInMeter;
          if (threeSum >= target) {
            candidates.push({
              combo: [first, second, third],
              diff: threeSum - target,
            });
          }
        }
      }
    }
  }

  // 2) Sort by smallest over-run
  candidates.sort((a, b) => a.diff - b.diff);

  // 3) Pick up to combosNeed non-overlapping combos
  const combos: RowLite[][] = [];
  const used = new Set<string>();

  for (const { combo } of candidates) {
    if (combos.length >= combosNeed) break;
    const ids = combo.map((r) => r.id);
    if (ids.some((id) => used.has(id))) continue;
    combos.push(combo);
    ids.forEach((id) => used.add(id));
  }

  // 4) Fetch full rows if we got any bundles
  if (combos.length) {
    const comboIds = [...new Set(combos.flat().map((r) => r.id))];
    const comboRows = await drizzle.query.articles.findMany({
      columns: {
        id: true,
        type: true,
        connector: true,
        lengthInMeter: true,
        storageLocationSection: true,
        tags: true,
        outputs: true,
      },
      with: { storageLocation: { columns: { id: false } } },
      where: inArray(articles.id, comboIds),
    });
    const byId = new Map(comboRows.map((r) => [r.id, r]));
    const bundles = combos.map((arr) => arr.map((r) => byId.get(r.id)!));
    return { items, bundles } as ArticleSearchResponse;
  }

  // 5) No bundles found?
  if (!items.length) {
    throw createError({ statusCode: 404, statusMessage: "No matching items" });
  }

  return { items } as ArticleSearchResponse;
});
