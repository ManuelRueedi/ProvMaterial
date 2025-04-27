import { reactive, computed, watchEffect } from "vue";

import {
  ampacityByType,
  connectorByType,
  connectorByAmpacity,
  socketsAllowed,
  socketsByType,
} from "./rules";
import type { Config, Connector } from "./types";

export function useConfigurator() {
  const config = reactive<Config>({
    type: "Kabel",
    ampacity: null,
    connector: null,
    sockets: null,
  });

  /* ────── option lists ────── */
  const ampacityOptions = computed(() => ampacityByType[config.type]);
  const connectorOptions = computed(() => {
    const byType = connectorByType[config.type] ?? [];
    const byAmpacity =
      config.ampacity != null
        ? (connectorByAmpacity[config.ampacity] ?? [])
        : null;

    return byType.filter((c) => (byAmpacity ? byAmpacity.includes(c) : true));
  });
  const socketsOptions = computed(() => socketsByType[config.type] ?? []);
  const socketsEnabled = computed(() => socketsAllowed[config.type] ?? false);

  /* ────── keep everything valid + pre-select first entry ────── */
  watchEffect(() => {
    /* Ampacity */
    if (!ampacityOptions.value.includes(config.ampacity as any))
      config.ampacity = ampacityOptions.value[0] ?? null;

    /* Connector */
    if (!connectorOptions.value.includes(config.connector as any))
      config.connector = connectorOptions.value[0] ?? null;

    /* Sockets */
    if (!socketsEnabled.value) {
      config.sockets = null; // deaktivieren
    } else {
      if (config.sockets == null) config.sockets = {}; // anlegen
      // nur zulässige Buchsen behalten
      if (config.sockets && typeof config.sockets === "object") {
        for (const k of Object.keys(config.sockets) as Connector[]) {
          if (!socketsOptions.value.includes(k)) {
            delete config.sockets[k as keyof typeof config.sockets];
          }
        }
      }
    }
  });

  return {
    config,
    ampacityOptions,
    connectorOptions,
    socketsEnabled,
    socketsOptions,
  };
}
