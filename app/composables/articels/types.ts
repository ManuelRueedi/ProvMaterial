// ~/schemas/config.ts
import { z } from "zod";

/* ───── enums (the string unions) ───── */
export const TypeEnum = z.enum([
  "Kabel",
  "Verlängerung",
  "Verteiler",
  "Box",
  "Kabelrolle",
  "Steckerleiste",
]);
export type Type = z.infer<typeof TypeEnum>;

export const AmpacityEnum = z.enum(["≤13A", "16A", "32A", "63A", "≥125A"]);
export type Ampacity = z.infer<typeof AmpacityEnum>;

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

export const TagsEnum = z.enum(["Zähler", "Hauptschalter", "defekt"]);
export type Tags = z.infer<typeof TagsEnum>;

export const ConfigSchema = z.object({
  type: TypeEnum,
  ampacity: AmpacityEnum.nullable(),
  connector: ConnectorEnum.nullable(),
  sockets: z.record(ConnectorEnum, z.number()).default({}),
  length: z.number().nonnegative(), // metres
  tags: z.array(TagsEnum), //
});
export type Config = z.infer<typeof ConfigSchema>;
