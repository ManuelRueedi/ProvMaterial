import { ref } from "vue";
import type { Config, Connector } from "@/composables/articles/types";

export function useSocketSelection(config: Config) {
  const selectedSocket = ref<Connector>("CEE16");
  const selectedSocketNumber = ref(1);

  const handleAddSocket = () => {
    if (selectedSocket.value && selectedSocketNumber.value > 0) {
      config.sockets = {
        ...config.sockets,
        [selectedSocket.value]: selectedSocketNumber.value,
      };
    }
  };

  const removeSocketFromSelection = (
    key: keyof NonNullable<Config["sockets"]>,
  ) => {
    const { [key]: _, ...rest } = config.sockets;
    config.sockets = rest;
  };

  return {
    selectedSocket,
    selectedSocketNumber,
    handleAddSocket,
    removeSocketFromSelection,
  };
}
