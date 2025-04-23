import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { isNotNull, sql } from "drizzle-orm";

// auth
// ───────────────────────── users ─────────────────────────
export const users = sqliteTable("users", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  microsoftID: text().notNull(),
  mail: text().notNull().unique(),
  firstName: text().notNull(),
  lastName: text(),
  jobtitle: text(),
  rights: text({ mode: "json" }).$type<{
    useArticels: boolean;
    editArticels: boolean;
    addArticels: boolean;
    removeArticels: boolean;
  }>(),
});

// ───────────────────────── webauthnCredentials  ─────────────────────────
export const webauthnCredentials = sqliteTable("webauthnCredentials", {
  id: text().primaryKey(),
  userId: integer()
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  publicKey: text().notNull(),
  counter: integer().notNull(),
  backedUp: integer({ mode: "boolean" }).notNull(),
  transports: text(),
});

// ───────────────────────── projects ─────────────────────────
export const projects = sqliteTable("projects", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text(),
});

// ───────────────────────── locations ────────────────────────
export const locations = sqliteTable("locations", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  address: text(),
  latitude: real(),
  longitude: real(),
  isStorageLocation: integer({ mode: "boolean" }).default(false),
});

// ───────────────────────── articles ─────────────────────────
export const articles = sqliteTable("articles", {
  id: integer().primaryKey({ autoIncrement: true }),
  articleIdentifier: text(),
  type: text().notNull(),
  connector: text().notNull(),
  outputs: text({ mode: "json" }).$type<string[]>(),
  lengthInMeter: real(),
  locationId: integer().references(() => locations.id, { onUpdate: "cascade" }),
  storageLocationId: integer().references(() => locations.id, {
    onUpdate: "cascade",
  }),
  storageLocationSection: integer(),
  currentProjectId: integer().references(() => projects.id, {
    onUpdate: "cascade",
  }),
  createdAt: integer({ mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer({ mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// ─────────────── article_location_history ───────────────────
export const articleLocationHistory = sqliteTable("article_location_history", {
  id: integer().primaryKey({ autoIncrement: true }),
  articleId: text().references(() => articles.id),
  locationId: integer().references(() => locations.id),
  fromTs: integer({ mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  toTs: integer({ mode: "timestamp" }),
});

// ──────────────────────── inspections ───────────────────────
export const inspections = sqliteTable("inspections", {
  id: integer().primaryKey({ autoIncrement: true }),
  articleId: text().references(() => articles.id),
  inspectionDate: integer({ mode: "timestamp" }).notNull(),
  inspectedBy: text(),
  fiType: text(),
  fiTripTimeMs: real(),
  fiTripCurrentMA: real(),
  insulationMohm: real(),
  circuits: text({ mode: "json" }).$type<string[]>(),
  result: text(),
  notes: text(),
});

// ───────────────────────── change_log ───────────────────────
export const changeLog = sqliteTable("change_log", {
  id: integer().primaryKey({ autoIncrement: true }),
  articleId: text().references(() => articles.id),
  changeTs: integer({ mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  user: text(),
  field: text(),
  old: text(),
  new: text(),
});
