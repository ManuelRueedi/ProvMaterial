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
  takeOutUser?: {
    id: number;
    firstName: string;
    lastName: string | null;
    mail: string;
  } | null;
  bringBackUser?: {
    id: number;
    firstName: string;
    lastName: string | null;
    mail: string;
  } | null;
};

const timelineCardUi = reactive({
  root: "rounded-xl overflow-hidden",
  header: "px-6 lg:px-8 py-4 lg:py-6",
  body: "px-6 lg:px-8 pb-6 lg:pb-8",
});

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
  <div class="mx-auto w-full max-w-4xl lg:max-w-5xl">
    <TransitionGroup
      v-if="sortedHistory.length > 0"
      name="list"
      tag="div"
      class="relative"
    >
      <div
        v-for="(item, index) in sortedHistory"
        :key="getItemKey(item, index)"
        class="timeline-item relative flex pb-8 sm:pb-10 lg:pb-12"
        :style="{ transitionDelay: `${index * 100}ms` }"
      >
        <div
          v-if="index !== sortedHistory.length - 1"
          class="absolute top-6 left-6 -ml-px h-full w-0.5 transition-colors duration-500 lg:top-8 lg:left-8 lg:w-1"
          :class="[item.to === 0 ? 'bg-primary-400' : 'bg-neutral-300']"
          aria-hidden="true"
        ></div>

        <div class="relative flex items-start space-x-4 lg:space-x-6">
          <div class="relative">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 lg:h-16 lg:w-16"
              :class="[
                item.to === 0
                  ? 'bg-primary-500 shadow-primary-500/30 shadow-lg'
                  : 'bg-neutral-400 shadow-md shadow-neutral-400/20',
              ]"
            >
              <UIcon
                :name="
                  item.to === 0
                    ? 'i-heroicons-map-pin-20-solid'
                    : 'i-heroicons-archive-box-20-solid'
                "
                class="h-6 w-6 text-white transition-transform duration-300 lg:h-8 lg:w-8"
                :class="item.to === 0 ? 'animate-bounce' : ''"
              />
            </div>
          </div>

          <UCard
            class="min-w-0 flex-1 transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-lg"
            :class="[
              item.to === 0
                ? 'shadow-primary-500/10 border-primary-500 border-l-4 shadow-xl'
                : 'shadow-md hover:shadow-lg',
            ]"
            :ui="timelineCardUi"
          >
            <template #header>
              <div class="flex items-start justify-between">
                <div class="flex-grow">
                  <h3
                    class="text-xl font-bold transition-colors duration-300 lg:text-2xl"
                    :class="[
                      item.to === 0 ? 'text-primary-700' : 'text-highlighted',
                    ]"
                  >
                    {{ item.projectName }}
                  </h3>
                  <p class="text-muted mt-1 text-sm lg:mt-2 lg:text-base">
                    {{ item.locationName }}
                  </p>
                </div>
              </div>
            </template>

            <p
              class="text-default mb-4 text-base leading-relaxed lg:mb-6 lg:text-lg"
            >
              {{ item.projectDescription }}
            </p>

            <div class="text-muted space-y-3 text-sm lg:space-y-4 lg:text-base">
              <div class="flex items-center space-x-2 lg:space-x-3">
                <UIcon
                  name="i-heroicons-clock"
                  class="text-primary-500 size-5 lg:size-6"
                />
                <span>{{ formatDatePeriod(item.from, item.to) }}</span>
              </div>
              <div class="flex items-center space-x-2 lg:space-x-3">
                <UIcon
                  name="ic:baseline-location-on"
                  class="text-primary-500 size-5 lg:size-6"
                />
                <span>{{ item.locationAddress }}</span>
              </div>
              <div
                v-if="item.takeOutUser"
                class="flex items-center space-x-2 lg:space-x-3"
              >
                <UIcon
                  name="ic:baseline-arrow-upward"
                  class="text-secondary size-5 lg:size-6"
                />
                <span
                  >Ausgetragen von: {{ item.takeOutUser.firstName }}
                  {{ item.takeOutUser.lastName }}</span
                >
              </div>
              <div
                v-if="item.bringBackUser"
                class="flex items-center space-x-2 lg:space-x-3"
              >
                <UIcon
                  name="ic:baseline-arrow-downward"
                  class="text-primary size-5 lg:size-6"
                />
                <span
                  >Zurückgebracht von: {{ item.bringBackUser.firstName }}
                  {{ item.bringBackUser.lastName }}</span
                >
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </TransitionGroup>

    <div v-else class="py-16 text-center lg:py-24">
      <div class="animate-pulse">
        <UIcon
          name="i-heroicons-no-symbol"
          class="text-dimmed mx-auto mb-4 h-16 w-16 lg:mb-6 lg:h-20 lg:w-20"
        />
      </div>
      <p class="text-muted text-lg lg:text-xl">
        Keine Verlaufsdaten vorhanden.
      </p>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

.list-leave-active {
  position: absolute;
  width: calc(100% - 3rem);
}

/* Enhanced bounce animation for active items */
@keyframes gentle-bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
  60% {
    transform: translateY(-1px);
  }
}

.animate-bounce {
  animation: gentle-bounce 2s infinite;
}

/* Staggered animation for timeline items */
.timeline-item {
  animation: fade-in-up 0.8s ease-out both;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
