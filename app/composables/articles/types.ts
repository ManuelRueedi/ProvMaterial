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
 * Location information interface
 */
export interface Location {
  id?: number;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface Project {
  id?: number;
  name: string;
  description?: string;
}

/**
 * Article response from search API with storage location details
 * This is the main type returned by the /api/articles/search endpoint
 * Used by both frontend and backend
 */
export interface Article {
  id: string;
  type: Type;
  lengthInMeter: number;
  connector: Connector;
  outputs: Partial<Record<Connector, number>>;
  tags: Tag[];
  location?: Location;
  storageLocation: Location;
  storageLocationSection: string;
  project?: Project;
}

/**
 * Response format for article search endpoint
 * Used by both frontend and backend - single source of truth
 * Can return either just items or items with bundles
 */
export type ArticleSearchResponse =
  | { items: Article[] }
  | { items: Article[]; bundles: Article[][] };
