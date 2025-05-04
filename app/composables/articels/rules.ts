import type { Type, Ampacity, Connector, Tags } from "./types";

export const ampacityByType: Record<Type, Ampacity[]> = {
  Kabel: ["≤13A", "16A", "32A", "63A", "≥125A"],
  Verlängerung: ["≤13A", "16A", "32A", "63A", "≥125A"],
  Verteiler: ["16A", "32A", "63A", "≥125A"],
  Box: ["32A", "63A", "≥125A"],
  Kabelrolle: ["≤13A", "16A", "32A"],
  Steckerleiste: ["≤13A", "16A"],
};

export const connectorByType: Record<Type, Connector[]> = {
  Kabel: [],
  Verlängerung: [
    "T13",
    "T23",
    "CEE16",
    "CEE32",
    "CEE63",
    "CEE125",
    "Powerlock 500A",
    "Powerlock 800A",
  ],
  Verteiler: ["CEE16", "CEE32", "CEE63", "CEE125"],
  Box: ["CEE32", "CEE63", "CEE125"],
  Kabelrolle: ["T13", "T23", "CEE16", "CEE32"],
  Steckerleiste: ["T13", "T23"],
};

export const connectorByAmpacity: Record<Ampacity, Connector[]> = {
  "≤13A": ["T13"],
  "16A": ["T23", "CEE16"],
  "32A": ["CEE32"],
  "63A": ["CEE63"],
  "≥125A": ["CEE125", "Powerlock 500A", "Powerlock 800A"],
};

export const socketsByType: Record<Type, Connector[]> = {
  Kabel: [],
  Verlängerung: [],
  Verteiler: ["T13", "T23", "CEE16", "CEE32", "CEE63", "CEE125"],
  Box: ["CEE32", "CEE63", "CEE125"],
  Kabelrolle: ["T13", "T23", "CEE16"],
  Steckerleiste: ["T13", "T23"],
};

export const tagsByType: Record<Type, Tags[]> = {
  Kabel: [],
  Verlängerung: [],
  Verteiler: ["Hauptschalter", "Zähler"],
  Box: ["Hauptschalter", "Zähler"],
  Kabelrolle: [],
  Steckerleiste: [],
};
