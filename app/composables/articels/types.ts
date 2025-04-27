export type Type =
  | "Kabel"
  | "Verlängerung"
  | "Verteiler"
  | "Box"
  | "Kabelrolle"
  | "Steckerleiste";

export type Ampacity = "≤13A" | "16A" | "32A" | "63A" | "125A" | "≥200A";
export type Connector =
  | "T13"
  | "T23"
  | "CEE16"
  | "CEE32"
  | "CEE63"
  | "CEE125"
  | "Powerlock 500A";

export interface Config {
  type: Type;
  ampacity: Ampacity | null;
  connector: Connector | null;
  sockets: Record<Connector, number> | {} | null;
}
