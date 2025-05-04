import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import type { WebAuthnCredential } from "#auth-utils";
import type {
  Type,
  Ampacity,
  Connector,
  Tags,
} from "@/composables/articels/types";

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

export const usersRelations = relations(users, ({ many }) => ({
  credentials: many(webauthnCredentials),
}));

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
  transports: text({ mode: "json" })
    .notNull()
    .$type<WebAuthnCredential["transports"]>(),
});

export const webauthnCredentialsRelations = relations(
  webauthnCredentials,
  ({ one }) => ({
    user: one(users, {
      fields: [webauthnCredentials.userId],
      references: [users.id],
    }),
  }),
);

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

export const locationsRelations = relations(locations, ({ one }) => ({
  article: one(articles),
}));

// ───────────────────────── articles ─────────────────────────
export const articles = sqliteTable("articles", {
  id: text().primaryKey(),
  type: text().notNull().$type<Type>(),
  ampacity: integer().notNull(),
  connector: text().$type<Connector>(),
  outputs: text({ mode: "json" }).$type<Record<Connector, number>>(),
  tags: text({ mode: "json" })
    .notNull()
    .default(sql`'[]'`)
    .$type<Tags[]>(),
  lengthInMeter: real().notNull(),
  locationId: integer()
    .references(() => locations.id, { onUpdate: "cascade" })
    .notNull(),
  storageLocationId: integer()
    .references(() => locations.id, {
      onUpdate: "cascade",
    })
    .notNull(),
  storageLocationSection: text(),
  currentProjectId: integer().references(() => projects.id, {
    onUpdate: "cascade",
  }),
  createdAt: integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const articlesRelations = relations(articles, ({ one }) => ({
  storageLocation: one(locations, {
    fields: [articles.storageLocationId],
    references: [locations.id],
  }),
}));

// ─────────────── article_location_history ───────────────────
export const articleLocationHistory = sqliteTable("article_location_history", {
  id: integer().primaryKey({ autoIncrement: true }),
  articleId: text().references(() => articles.id),
  locationId: integer().references(() => locations.id),
  fromTs: integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
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
  changeTs: integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
  user: text(),
  field: text(),
  old: text(),
  new: text(),
});
