<template>
  <div class="flex flex-col gap-8">
    <!-- Articles List -->
    <div class="space-y-4">
      <TransitionGroup name="list" tag="div" class="grid gap-4" appear>
        <UCard
          v-for="(article, index) in articles"
          :key="article.number"
          class="group relative overflow-hidden transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-2xl"
          :style="{
            animationDelay: `${index * 100}ms`,
            animationDuration: '800ms',
            animationFillMode: 'both',
          }"
          :ui="{
            root: 'bg-default border border-default rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300',
          }"
        >
          <ArticleInfoDisplay :article="article" />
        </UCard>
      </TransitionGroup>
    </div>

    <slot></slot>

    <USeparator class="animate-fade-in"></USeparator>
    <!-- Take Out Form Section -->
    <div class="animate-fade-in-up animate-delay-500">
      <TakeOutForm
        :disabled="!articles.length"
        button-text="Alle Artikel austragen"
        @take-out="handleTakeOut"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TableItem } from "@/composables/articles/types";

const props = defineProps<{
  articles: TableItem[];
}>();

const emit = defineEmits<{
  takeOut: [articleIds: string[], locationId: number, projectId?: number];
}>();

async function handleTakeOut(locationId: number, projectId?: number) {
  if (!props.articles.length) return;

  const articleIds = props.articles.map((article) => article.number);
  emit("takeOut", articleIds, locationId, projectId);
}
</script>

<style scoped>
/* Vue Transition Classes for TransitionGroup */
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

.list-move {
  transition: transform 0.5s ease;
}

/* Enhanced card hover effects */
.group:hover .shrink-0 {
  transform: scale(1.05);
  transition: transform 0.2s ease-out;
}

/* Subtle animation for section indicators */
@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.group:hover .w-2.h-2 {
  animation: pulse-dot 2s infinite;
}
</style>
