<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform opacity-0 scale-95"
    enter-to-class="transform opacity-100 scale-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform opacity-100 scale-100"
    leave-to-class="transform opacity-0 scale-95"
  >
    <div
      v-if="!isOnline"
      class="fixed top-0 right-0 left-0 z-50 bg-amber-500 px-4 py-2 text-amber-900"
    >
      <div class="flex items-center justify-center gap-2 text-sm font-medium">
        <UIcon name="ic:baseline-wifi-off" class="h-4 w-4" />
        <span>You're offline. Some features may not be available.</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { isOnline } = usePwaStatus();
</script>
