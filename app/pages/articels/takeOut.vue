<template>
  <h1 class="justify-self-center">Auslagern</h1>

  <div
    class="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-7 pt-5"
  >
    <!-- Typ -->
    <LabeledSelection
      icon="ic:baseline-view-in-ar"
      :items="typeOptions"
      v-model="config.type"
    >
      Typ
    </LabeledSelection>

    <!-- Strombelastbarkeit -->
    <LabeledSelection
      icon="ic:baseline-electric-bolt"
      :items="ampacityOptions"
      v-model="config.ampacity"
    >
      Nennstrom
    </LabeledSelection>

    <!-- Anschluss -->
    <LabeledSelection
      v-if="connectorOptions.length"
      icon="ic:baseline-power"
      :items="connectorOptions"
      v-model="config.connector"
    >
      Anschluss
    </LabeledSelection>
    <!-- Abgänge -->
    <div
      v-if="socketsEnabled"
      class="flex w-full max-w-xl flex-col gap-2 px-10"
    >
      <div
        class="flex w-full flex-col gap-2 [@media(min-width:400px)]:flex-row"
      >
        <UBadge
          icon="ic:baseline-outlet"
          class="min-w-30 flex-1/3 justify-center"
          size="md"
          color="neutral"
          variant="solid"
        >
          Abgänge
        </UBadge>
        <USelect
          class="flex-2/3"
          :items="socketsOptions"
          v-model="selectedSocket"
        />
      </div>
      <div class="flex w-full gap-2">
        <UButton
          @click="setSelectedSocket"
          class="min-w-30 flex-1/3 justify-center"
          >hinzufügen</UButton
        >
        <UInputNumber
          v-model="selectedSocketNumber"
          class="flex-2/3"
        ></UInputNumber>
      </div>
    </div>
  </div>
  <USeparator class="h-2 w-full p-3" color="neutral" type="solid" />
  <div
    v-for="(value, key) in config.sockets"
    class="flex w-full max-w-xl gap-2 justify-self-center px-10 pb-2"
  >
    <UButton
      @click="removeSocketFromSelection(key)"
      class="min-w-30 flex-1/3 justify-center"
      color="error"
      icon="ic:baseline-remove"
    />
    <UBadge :key="key" color="neutral" class="flex-2/3 justify-center">
      {{ value }} X {{ key }}
    </UBadge>
  </div>
  <!-- <p>{{ config }}</p> -->
</template>

<script lang="ts" setup>
import { useConfigurator } from "@/composables/articels/useConfigurator";
import { ref } from "vue";

const typeOptions = ref([
  "Kabel",
  "Verlängerung",
  "Verteiler",
  "Box",
  "Kabelrolle",
  "Steckerleiste",
]);

const {
  config,
  ampacityOptions,
  connectorOptions,
  socketsEnabled,
  socketsOptions,
} = useConfigurator();

const selectedSocket = ref("CEE16");
const selectedSocketNumber = ref(1);

const setSelectedSocket = () => {
  if (selectedSocket.value && selectedSocketNumber.value > 0) {
    config.sockets = {
      ...config.sockets,
      [selectedSocket.value]: selectedSocketNumber.value,
    };
  }
};
import type { Config } from "@/composables/articels/types";

const removeSocketFromSelection = (
  key: keyof NonNullable<Config["sockets"]>,
) => {
  const { [key]: _, ...rest } = config.sockets;
  config.sockets = rest;
};
</script>
