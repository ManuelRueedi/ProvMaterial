import { z } from "zod";

export const RightEnum = z.enum([
  "useArticles",
  "editArticles",
  "addArticles",
  "removeArticles",
]);
export type Right = z.infer<typeof RightEnum>;
export type Rights = Right[]; // Array of rights
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
  "Adapterkabel",
]);
export type Type = z.infer<typeof TypeEnum>;

/**
 * Current capacity classification
 */
export const AmpacityEnum = z.enum([
  "10A",
  "16A",
  "32A",
  "40A",
  "63A",
  "≥125A",
]);
export type Ampacity = z.infer<typeof AmpacityEnum>;

/**
 * Map ampacity strings to numeric values for database storage and comparisons
 */
export const AMPACITY_TO_NUMBER: Record<Ampacity, number> = {
  "10A": 10,
  "16A": 16,
  "32A": 32,
  "40A": 40,
  "63A": 63,
  "≥125A": 125,
};

/**
 * Convert ampacity string to number for database operations
 */
export function ampacityToNumber(ampacity: Ampacity): number {
  return AMPACITY_TO_NUMBER[ampacity];
}

/**
 * Convert numeric ampacity back to string enum (reverse mapping)
 */
export function numberToAmpacity(value: number): Ampacity {
  const entry = Object.entries(AMPACITY_TO_NUMBER).find(
    ([_, num]) => num === value,
  );
  if (!entry) {
    throw new Error(`Invalid ampacity value: ${value}`);
  }
  return entry[0] as Ampacity;
}

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
  "J40",
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
  isStorageLocation?: boolean;
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
  ampacity: Ampacity;
  lengthInMeter: number;
  connector?: Connector;
  outputs: Partial<Record<Connector, number>>;
  tags: Tag[];
  location?: Location;
  storageLocation: Location;
  storageLocationSection?: string;
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
