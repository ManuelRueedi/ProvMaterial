<template>
  <div
    class="flex w-full max-w-xl flex-col gap-2 px-10 [@media(min-width:400px)]:flex-row"
  >
    <UBadge
      class="min-w-30 flex-1/3 justify-center"
      :icon="icon"
      size="md"
      color="neutral"
      variant="solid"
    >
      {{ label }}
    </UBadge>
    <slot />
  </div>
</template>

<script lang="ts" setup>
interface Props {
  icon: string;
  label: string;
}

defineProps<Props>();
</script>
