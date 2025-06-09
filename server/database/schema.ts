import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import type { WebAuthnCredential } from "#auth-utils";
import type {
  Type,
  Connector,
  Tag,
  Rights,
  Action,
} from "@/composables/articles/types";

// auth
// ───────────────────────── users ─────────────────────────
export const users = sqliteTable("users", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  microsoftID: text().notNull(),
  mail: text().notNull().unique(),
  firstName: text().notNull(),
  lastName: text(),
  jobtitle: text(),
  rights: text({ mode: "json" }).$type<Rights>(),
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
  transports: text({ mode: "json" })
    .notNull()
    .$type<WebAuthnCredential["transports"]>(),
});

// ───────────────────────── projects ─────────────────────────
export const projects = sqliteTable("projects", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
});

// ───────────────────────── locations ────────────────────────
export const locations = sqliteTable("locations", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  address: text(),
  latitude: real(),
  longitude: real(),
  isStorageLocation: integer({ mode: "boolean" }).default(false),
});

// ───────────────────────── articles ─────────────────────────
export const articles = sqliteTable("articles", {
  id: text().primaryKey(),
  type: text().notNull().$type<Type>(),
  ampacity: integer().notNull(),
  connector: text().$type<Connector>(),
  outputs: text({ mode: "json" })
    .default({})
    .$type<Partial<Record<Connector, number>>>(),
  tags: text({ mode: "json" })
    .notNull()
    .default(sql`'[]'`)
    .$type<Tag[]>(),
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

// ─────────────── article_history ───────────────────
export const articleLocationHistory = sqliteTable("article_location_history", {
  id: integer().primaryKey({ autoIncrement: true }),
  articleId: text()
    .references(() => articles.id, { onDelete: "cascade" })
    .notNull(),
  locationName: text().notNull(),
  locationaddress: text(),
  locationLatitude: real(),
  locationLongitude: real(),
  locationID: integer().references(() => locations.id, {
    onDelete: "set null",
  }),
  projectName: text(),
  projectDescription: text(),
  projectId: integer().references(() => projects.id, { onDelete: "set null" }),
  takeOutUserId: integer().references(() => users.id, { onDelete: "set null" }),
  bringBackUserId: integer().references(() => users.id, {
    onDelete: "set null",
  }),
  fromTs: integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  toTs: integer({ mode: "timestamp" }),
});

// ──────────────────────── inspections ───────────────────────
export const inspections = sqliteTable("inspections", {
  id: integer().primaryKey({ autoIncrement: true }),
  articleId: text().references(() => articles.id, { onDelete: "set null" }),
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
  userId: integer({ mode: "number" }).references(() => users.id),
  articleId: text().references(() => articles.id, { onDelete: "set null" }),
  action: text().notNull().$type<Action>().default("update"), //, "update", "delete"
  changeTs: integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
  old: text({ mode: "json" }).$type<Partial<typeof articles.$inferSelect>>(),
  new: text({ mode: "json" }).$type<Partial<typeof articles.$inferSelect>>(),
});

// Relations

export const usersRelations = relations(users, ({ many }) => ({
  credentials: many(webauthnCredentials),
  takenOutHistories: many(articleLocationHistory, {
    relationName: "takeOutUser",
  }),
  broughtBackHistories: many(articleLocationHistory, {
    relationName: "bringBackUser",
  }),
}));

export const webauthnCredentialsRelations = relations(
  webauthnCredentials,
  ({ one }) => ({
    user: one(users, {
      fields: [webauthnCredentials.userId],
      references: [users.id],
    }),
  }),
);

export const articlesRelations = relations(articles, ({ one }) => ({
  location: one(locations, {
    fields: [articles.locationId],
    references: [locations.id],
  }),
  storageLocation: one(locations, {
    fields: [articles.storageLocationId],
    references: [locations.id],
  }),
  project: one(projects, {
    fields: [articles.currentProjectId],
    references: [projects.id],
  }),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  articles: many(articles),
}));

export const locationsRelations = relations(locations, ({ many }) => ({
  article: many(articles),
}));

export const articleLocationHistoryRelations = relations(
  articleLocationHistory,
  ({ one }) => ({
    article: one(articles, {
      fields: [articleLocationHistory.articleId],
      references: [articles.id],
    }),
    location: one(locations, {
      fields: [articleLocationHistory.locationID],
      references: [locations.id],
    }),
    project: one(projects, {
      fields: [articleLocationHistory.projectId],
      references: [projects.id],
    }),
    takeOutUser: one(users, {
      fields: [articleLocationHistory.takeOutUserId],
      references: [users.id],
      relationName: "takeOutUser",
    }),
    bringBackUser: one(users, {
      fields: [articleLocationHistory.bringBackUserId],
      references: [users.id],
      relationName: "bringBackUser",
    }),
  }),
);

export const changeLogRelations = relations(changeLog, ({ one }) => ({
  user: one(users, {
    fields: [changeLog.userId],
    references: [users.id],
  }),
  article: one(articles, {
    fields: [changeLog.articleId],
    references: [articles.id],
  }),
}));
