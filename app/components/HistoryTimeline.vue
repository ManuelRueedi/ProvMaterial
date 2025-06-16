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
  header: "px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6",
  body: "px-3 sm:px-4 lg:px-8 pb-3 sm:pb-4 lg:pb-8",
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
  <div class="mx-auto w-full max-w-4xl px-2 sm:px-4 lg:max-w-5xl lg:px-0">
    <!-- Alert für aktuellen Status -->
    <UAlert
      v-if="
        sortedHistory.length === 0 ||
        (sortedHistory.length > 0 && sortedHistory[0]?.to !== 0)
      "
      color="success"
      variant="soft"
      class="mb-4 sm:mb-6"
      icon="i-heroicons-archive-box"
      title="Aktuell im Lager"
      description="Dieses Material befindet sich derzeit im Lager."
    />

    <TransitionGroup
      v-if="sortedHistory.length > 0"
      name="list"
      tag="div"
      class="relative"
    >
      <div
        v-for="(item, index) in sortedHistory"
        :key="getItemKey(item, index)"
        class="timeline-item relative flex pb-6 sm:pb-8 lg:pb-12"
        :style="{ transitionDelay: `${index * 100}ms` }"
      >
        <div
          v-if="index !== sortedHistory.length - 1"
          class="absolute top-5 left-4 -ml-px h-full w-0.5 transition-colors duration-500 sm:top-6 sm:left-5 lg:top-8 lg:left-8 lg:w-1"
          :class="[item.to === 0 ? 'bg-primary-400' : 'bg-neutral-300']"
          aria-hidden="true"
        ></div>

        <div
          class="relative flex items-start space-x-3 sm:space-x-4 lg:space-x-6"
        >
          <div class="relative flex-shrink-0">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 sm:h-10 sm:w-10 lg:h-16 lg:w-16"
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
                class="h-4 w-4 text-white transition-transform duration-300 sm:h-5 sm:w-5 lg:h-8 lg:w-8"
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
              <div
                class="flex flex-col space-y-2 sm:flex-row sm:items-start sm:justify-between sm:space-y-0"
              >
                <div class="flex flex-col space-y-2">
                  <h3
                    class="text-lg font-bold transition-colors duration-300 sm:text-xl lg:text-2xl"
                    :class="[
                      item.to === 0 ? 'text-primary-700' : 'text-highlighted',
                    ]"
                  >
                    {{ item.projectName }}
                  </h3>
                  <p class="text-muted text-sm sm:text-base lg:text-lg">
                    {{ item.locationName }}
                  </p>
                </div>
                <UBadge
                  v-if="item.to === 0"
                  color="success"
                  variant="soft"
                  size="lg"
                  class="sm:size-md lg:size-lg animate-pulse self-start"
                >
                  Aktuell hier
                </UBadge>
              </div>
            </template>

            <p
              class="text-default mb-3 text-sm leading-relaxed sm:mb-4 sm:text-base lg:mb-6 lg:text-lg"
            >
              {{ item.projectDescription }}
            </p>

            <div
              class="text-muted space-y-2 text-xs sm:space-y-3 sm:text-sm lg:space-y-4 lg:text-base"
            >
              <div class="flex items-center space-x-2 lg:space-x-3">
                <UIcon
                  name="i-heroicons-clock"
                  class="text-primary-500 size-4 flex-shrink-0 sm:size-5 lg:size-6"
                />
                <span class="break-words">{{
                  formatDatePeriod(item.from, item.to)
                }}</span>
              </div>
              <div class="flex items-center space-x-2 lg:space-x-3">
                <UIcon
                  name="ic:baseline-location-on"
                  class="text-primary-500 size-4 flex-shrink-0 sm:size-5 lg:size-6"
                />
                <span class="break-words">{{ item.locationAddress }}</span>
              </div>
              <div
                v-if="item.takeOutUser"
                class="flex items-center space-x-2 lg:space-x-3"
              >
                <UIcon
                  name="ic:baseline-arrow-upward"
                  class="text-secondary size-4 flex-shrink-0 sm:size-5 lg:size-6"
                />
                <span class="break-words"
                  ><span class="hidden sm:inline">Ausgetragen von: </span
                  ><span class="sm:hidden">Von: </span
                  >{{ item.takeOutUser.firstName }}
                  {{ item.takeOutUser.lastName }}</span
                >
              </div>
              <div
                v-if="item.bringBackUser"
                class="flex items-center space-x-2 lg:space-x-3"
              >
                <UIcon
                  name="ic:baseline-arrow-downward"
                  class="text-primary size-4 flex-shrink-0 sm:size-5 lg:size-6"
                />
                <span class="break-words"
                  ><span class="hidden sm:inline">Zurückgebracht von: </span
                  ><span class="sm:hidden">Zurück: </span
                  >{{ item.bringBackUser.firstName }}
                  {{ item.bringBackUser.lastName }}</span
                >
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </TransitionGroup>

    <div v-else class="py-12 text-center sm:py-16 lg:py-24">
      <div class="animate-pulse">
        <UIcon
          name="i-heroicons-no-symbol"
          class="text-dimmed mx-auto mb-3 h-12 w-12 sm:mb-4 sm:h-16 sm:w-16 lg:mb-6 lg:h-20 lg:w-20"
        />
      </div>
      <p class="text-muted text-base sm:text-lg lg:text-xl">
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
  transform: translateY(20px) scale(0.95);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.list-leave-active {
  position: absolute;
  width: calc(100% - 1.5rem);
}

@media (min-width: 640px) {
  .list-enter-from {
    transform: translateY(30px) scale(0.95);
  }

  .list-leave-to {
    transform: translateY(-30px) scale(0.95);
  }

  .list-leave-active {
    width: calc(100% - 2rem);
  }
}

@media (min-width: 1024px) {
  .list-leave-active {
    width: calc(100% - 3rem);
  }
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
    transform: translateY(-2px);
  }
  60% {
    transform: translateY(-1px);
  }
}

@media (min-width: 640px) {
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
}

.animate-bounce {
  animation: gentle-bounce 2s infinite;
}

/* Staggered animation for timeline items */
.timeline-item {
  animation: fade-in-up 0.6s ease-out both;
}

@media (min-width: 640px) {
  .timeline-item {
    animation: fade-in-up 0.8s ease-out both;
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 640px) {
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

@media (min-width: 1024px) {
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
}

/* Improve touch targets on mobile */
@media (max-width: 639px) {
  .timeline-item {
    min-height: 44px; /* Minimum touch target size */
  }
}
</style>
