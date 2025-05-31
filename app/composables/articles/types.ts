// ~/schemas/config.ts
import { z } from "zod";

/**
 * Equipment type categorization
 */
export const TypeEnum = z.enum([
  "Kabel",
  "Verlängerung",
  "Verteiler",
  "Box",
  "Kabelrolle",
  "Steckerleiste",
]);
export type Type = z.infer<typeof TypeEnum>;

/**
 * Current capacity classification
 */
export const AmpacityEnum = z.enum(["≤13A", "16A", "32A", "63A", "≥125A"]);
export type Ampacity = z.infer<typeof AmpacityEnum>;

/**
 * Connector types for electrical equipment
 */
export const ConnectorEnum = z.enum([
  "T13",
  "T23",
  "CEE16",
  "CEE32",
  "CEE63",
  "CEE125",
  "Powerlock 500A",
  "Powerlock 800A",
]);
export type Connector = z.infer<typeof ConnectorEnum>;

/**
 * Special features or properties
 */
export const TagEnum = z.enum(["Zähler", "Hauptschalter", "defekt"]);
export type Tag = z.infer<typeof TagEnum>;
// For backward compatibility
export type Tags = Tag;

/**
 * Search configuration schema for filtering articles
 */
export const ConfigSchema = z.object({
  type: TypeEnum,
  ampacity: AmpacityEnum.nullable(),
  connector: ConnectorEnum.nullable(),
  sockets: z.record(ConnectorEnum, z.number()).default({}),
  length: z.number().nonnegative(), // metres
  tags: z.array(TagEnum),
});
export type Config = z.infer<typeof ConfigSchema>;

/**
 * Base article properties that are common across the application
 */
export interface ArticleBase {
  id: string;
  type: Type;
  ampacity: number;
  connector: Connector | null;
  outputs: Partial<Record<Connector, number>>;
  tags: Tag[];
  lengthInMeter: number;
}

/**
 * Article with location information
 */
export interface ArticleWithLocation extends ArticleBase {
  locationId: number;
  storageLocationId: number;
  storageLocationSection: string | null;
  currentProjectId: number | null;
}
