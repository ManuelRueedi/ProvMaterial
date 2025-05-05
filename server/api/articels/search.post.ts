import { and, eq, gte, lt, lte, asc, desc, sql, inArray } from "drizzle-orm";
import { z } from "zod";
import { ConfigSchema } from "@/composables/articels/types";
import { articles } from "~~/server/database/schema";
import type {
  Type,
  Ampacity,
  Connector,
  Tags,
  Config,
} from "@/composables/articels/types";

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

  var searchQuery;
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
    return { items };
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

  if (items.length >= 3) return items;

  const pool = await drizzle.query.articles.findMany({
    columns: {
      id: true,
      lengthInMeter: true,
    },
    with: { storageLocation: { columns: { id: true } } },
    where: and(inStorage, searchQuery, lt(articles.lengthInMeter, body.length)),
    orderBy: desc(articles.lengthInMeter),
  });

  /* ---------- build “bundle” suggestions (2‑ or 3‑part) ---------- */

  type RowLite = {
    id: string;
    lengthInMeter: number;
    storageLocation: { id: number };
  };

  const target = body.length; // requested total (in metres)
  const combosNeed = 3 - items.length; // 0…3
  let poolRest: RowLite[] = [...pool]; // copy so we can mark used

  // 1) Generate all candidate combos (2- and 3-item) within each location
  type Candidate = { combo: RowLite[]; diff: number };
  const candidates: Candidate[] = [];

  for (const locId of new Set(poolRest.map((r) => r.storageLocation.id))) {
    const group = poolRest
      .filter((r) => r.storageLocation.id === locId)
      .sort((a, b) => b.lengthInMeter - a.lengthInMeter);

    // 2-item
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const sum = group[i].lengthInMeter + group[j].lengthInMeter;
        if (sum >= target) {
          candidates.push({
            combo: [group[i], group[j]],
            diff: sum - target,
          });
        }
      }
    }

    // 3-item
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        for (let k = j + 1; k < group.length; k++) {
          const sum =
            group[i].lengthInMeter +
            group[j].lengthInMeter +
            group[k].lengthInMeter;
          if (sum >= target) {
            candidates.push({
              combo: [group[i], group[j], group[k]],
              diff: sum - target,
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
      },
      with: { storageLocation: { columns: { id: false } } },
      where: inArray(articles.id, comboIds),
    });
    const byId = new Map(comboRows.map((r) => [r.id, r]));
    const bundles = combos.map((arr) => arr.map((r) => byId.get(r.id)!));
    return { items, bundles };
  }

  // 5) No bundles found?
  if (!items.length) {
    throw createError({ statusCode: 404, statusMessage: "No matching items" });
  }
});

export interface ArticleWithOutputs {
  id: string;
  type: Type;
  connector: Connector;
  outputs: Record<string, unknown>;
  lengthInMeter: number;
  storageLocationSection: string;
  tags: Tags[];
  storageLocation: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    isStorageLocation: boolean;
  };
}

// 2️ The “bundle” shape (no `outputs`) returned inside `bundles`
export type ArticleBundle = Omit<ArticleWithOutputs, "outputs">;

// 3️ The three possible return shapes
export type HandlerResult =
  | { items: ArticleWithOutputs[] } // when body.length===0
  | ArticleWithOutputs[] // when length>0 and items.length ≥ 3
  | { items: ArticleWithOutputs[]; bundles: ArticleBundle[][] }; // when length>0 & items<3 but combos found

// 4️ Since it’s an async handler:
export type HandlerReturn = Promise<HandlerResult>;
