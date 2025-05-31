<script setup lang="ts">
import { computed } from "vue";

type HistoryView = {
  locationName: string;
  locationAddress: string;
  projectName: string;
  projectDescription: string;
  from: number; // Unix Timestamp (Sekunden)
  to: number; // Unix Timestamp (Sekunden), 0 für aktuell
  id?: string | number;
};

const props = defineProps<{
  history: HistoryView[];
}>();

const sortedHistory = computed(() => {
  return [...props.history].sort((a, b) => {
    if (a.to === 0 && b.to !== 0) return -1;
    if (b.to === 0 && a.to !== 0) return 1;
    return b.from - a.from;
  });
});

function formatDatePeriod(fromTimestamp: number, toTimestamp: number): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  const fromDateStr = new Date(fromTimestamp * 1000).toLocaleDateString(
    "de-DE",
    options,
  );
  if (toTimestamp === 0) {
    return `${fromDateStr} – Heute`;
  }
  const toDateStr = new Date(toTimestamp * 1000).toLocaleDateString(
    "de-DE",
    options,
  );
  return `${fromDateStr} – ${toDateStr}`;
}

function getItemKey(item: HistoryView, index: number): string | number {
  if (item.id) return item.id;
  return `${item.from}-${item.locationName}-${index}`;
}
</script>

<template>
  <div class="mx-auto w-full max-w-2xl">
    <TransitionGroup
      v-if="sortedHistory.length > 0"
      name="list"
      tag="div"
      class="relative"
    >
      <div
        v-for="(item, index) in sortedHistory"
        :key="getItemKey(item, index)"
        class="timeline-item relative flex pb-8 sm:pb-10"
        :style="{ transitionDelay: `${index * 100}ms` }"
      >
        <div
          v-if="index !== sortedHistory.length - 1"
          class="absolute top-5 left-5 -ml-px h-full w-0.5"
          :class="[
            item.to === 0
              ? 'bg-primary-500 dark:bg-primary-400/50'
              : 'bg-gray-300 dark:bg-gray-700',
          ]"
          aria-hidden="true"
        ></div>

        <div class="relative flex items-start space-x-3 sm:space-x-4">
          <div class="relative">
            <span
              class="flex h-10 w-10 items-center justify-center rounded-full ring-4 print:ring-0"
              :class="[
                item.to === 0
                  ? 'bg-primary-500 ring-primary-300 dark:bg-primary-500 dark:ring-primary-400/30' // Aktives Element: Primärfarben
                  : 'bg-gray-500 ring-gray-300 dark:bg-gray-500 dark:ring-gray-400/30', // Inaktives Element: Grautöne
                'relative ring-white dark:ring-gray-900 print:!ring-transparent',
              ]"
            >
              <UIcon
                :name="
                  item.to === 0
                    ? 'i-heroicons-map-pin-20-solid'
                    : 'i-heroicons-calendar-days-20-solid'
                "
                class="z-10 h-5 w-5 text-white"
              />
              <span
                v-if="item.to === 0"
                class="bg-primary-400 animate-ping-slow absolute z-0 inline-flex h-full w-full rounded-full opacity-75"
              ></span>
            </span>
          </div>

          <UCard
            class="min-w-0 flex-1 transition-all duration-300 ease-out"
            :ui="{
              root:
                item.to === 0
                  ? 'rounded-lg !shadow-xl transform scale-[1.01] bg-primary-50 dark:bg-primary-900/40 !ring-2 !ring-primary-800' // Aktives Element: Primärfarben
                  : 'rounded-lg shadow-md hover:shadow-lg ring-1 ring-neutral-300/20 ', // Standard
              header:
                item.to === 0
                  ? 'px-4 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-4'
                  : 'px-3 pt-3 pb-2 sm:px-4 sm:pt-4 sm:pb-3',
              body: item.to === 0 ? 'p-4 sm:p-6' : 'p-3 sm:p-4',
            }"
          >
            <template #header>
              <div
                class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"
              >
                <div class="flex-grow">
                  <h3
                    class="text-base leading-tight font-semibold"
                    :class="[
                      item.to === 0
                        ? 'text-primary-700 dark:text-primary-200 text-lg'
                        : 'text-gray-800 dark:text-white',
                    ]"
                  >
                    {{ item.projectName }}
                  </h3>
                  <p
                    class="text-xs"
                    :class="[
                      item.to === 0
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-500 dark:text-gray-400',
                    ]"
                  >
                    {{ item.locationName }}
                  </p>
                </div>
                <UBadge
                  v-if="item.to === 0"
                  color="primary"
                  variant="solid"
                  size="md"
                  class="mt-1 sm:mt-0"
                >
                  <UIcon
                    name="i-heroicons-check-badge-solid"
                    class="mr-1.5 h-5 w-5"
                  />
                  Aktuell hier
                </UBadge>
              </div>
            </template>

            <p
              class="mb-3 text-sm"
              :class="[
                item.to === 0
                  ? 'text-gray-700 dark:text-gray-100'
                  : 'text-gray-600 dark:text-gray-300',
              ]"
            >
              {{ item.projectDescription }}
            </p>
            <div
              class="space-y-1 text-xs"
              :class="[
                item.to === 0
                  ? 'text-gray-600 dark:text-gray-300'
                  : 'text-gray-500 dark:text-gray-400',
              ]"
            >
              <p>
                <UIcon
                  name="i-heroicons-clock"
                  class="mr-1 align-text-bottom"
                />
                <strong>Zeitraum:</strong>
                {{ formatDatePeriod(item.from, item.to) }}
              </p>
              <p>
                <UIcon
                  name="i-heroicons-building-office-2"
                  class="mr-1 align-text-bottom"
                />
                <strong>Adresse:</strong> {{ item.locationAddress }}
              </p>
            </div>
          </UCard>
        </div>
      </div>
    </TransitionGroup>

    <div v-else class="py-10 text-center text-gray-500 dark:text-gray-400">
      <UIcon
        name="i-heroicons-no-symbol"
        class="mx-auto mb-2 h-12 w-12 text-gray-400 dark:text-gray-600"
      />
      <p>Keine Verlaufsdaten vorhanden.</p>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
.list-leave-active {
  position: absolute;
  width: calc(100% - 2.5rem);
}

@keyframes ping-slow {
  75%,
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}
.animate-ping-slow {
  animation: ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
