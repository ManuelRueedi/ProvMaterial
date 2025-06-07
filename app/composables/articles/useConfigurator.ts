import { reactive, computed, watchEffect } from "vue";

import {
  ampacityByType,
  connectorByType,
  connectorByAmpacity,
  socketsByType,
  tagsByType,
} from "./rules";
import type { Ampacity, Config, Connector } from "./types";

export function useConfigurator() {
  const config = reactive<Config>({
    type: "Verlängerung",
    ampacity: "32A",
    connector: null,
    sockets: {},
    length: 0,
    tags: [],
  });

  /* ── reset length when TYPE changes ───────────────────── */
  watch(
    () => config.type,
    () => {
      config.length = 0;
      config.tags = [];
    },
  );

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
  const socketsEnabled = computed(
    () => (socketsByType[config.type]?.length ?? 0) > 0,
  );
  const tagsOptions = computed(() => tagsByType[config.type] ?? []);
  const tagsEnabled = computed(
    () => (tagsByType[config.type]?.length ?? 0) > 0,
  );

  /* ────── keep everything valid + pre-select first entry ────── */
  watchEffect(() => {
    /* Ampacity */
    if (!ampacityOptions.value.includes(config.ampacity as Ampacity))
      config.ampacity = ampacityOptions.value[0] ?? null;

    /* Connector */
    if (!connectorOptions.value.includes(config.connector as Connector))
      config.connector = connectorOptions.value[0] ?? null;

    /* Sockets */
    if (!socketsEnabled.value) {
      config.sockets = {};
    } else {
      if (config.sockets && typeof config.sockets === "object") {
        for (const k of Object.keys(config.sockets) as Connector[]) {
          if (!socketsOptions.value.includes(k)) {
            config.sockets[k as keyof typeof config.sockets] = undefined;
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
    tagsOptions,
    tagsEnabled,
  };
}
