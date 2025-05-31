import { drizzle } from "drizzle-orm/d1";
import * as schema from "../database/schema";

export const tables = schema;

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema });
}

// Exported database entity types
export type Article = typeof schema.articles.$inferSelect;
export type Project = typeof schema.projects.$inferSelect;
export type Location = typeof schema.locations.$inferSelect;
export type User = typeof schema.users.$inferSelect;
export type ArticleLocationHistory =
  typeof schema.articleLocationHistory.$inferSelect;
export type Inspection = typeof schema.inspections.$inferSelect;
export type ChangeLog = typeof schema.changeLog.$inferSelect;
