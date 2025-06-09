<template>
  <div
    v-if="needRefresh"
    class="fixed top-4 right-4 left-4 z-50 rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-lg md:right-4 md:left-auto md:w-96 dark:border-blue-800 dark:bg-blue-900/20"
  >
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0">
        <UIcon
          name="i-heroicons-arrow-path"
          class="h-6 w-6 text-blue-600 dark:text-blue-400"
        />
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="text-sm font-medium text-blue-900 dark:text-blue-100">
          App Update Available
        </h3>
        <p class="mt-1 text-xs text-blue-700 dark:text-blue-300">
          A new version of ProvMaterial is available with improvements and bug
          fixes.
        </p>
        <div class="mt-3 flex gap-2">
          <button
            class="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            @click="updateApp"
          >
            Update Now
          </button>
          <button
            class="inline-flex items-center rounded-md border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-blue-600 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
            @click="dismissUpdate"
          >
            Later
          </button>
        </div>
      </div>
      <button
        class="flex-shrink-0 text-blue-400 hover:text-blue-500 dark:text-blue-500 dark:hover:text-blue-400"
        @click="dismissUpdate"
      >
        <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { needRefresh, updateServiceWorker } = usePwaStatus();

const updateApp = async () => {
  await updateServiceWorker();
};

const dismissUpdate = () => {
  // This will be handled by the composable
  // For now, we'll just hide the notification temporarily
  // You might want to implement a "remind me later" functionality
};
</script>
