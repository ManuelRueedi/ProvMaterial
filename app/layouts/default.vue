<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const items = ref<NavigationMenuItem[][]>([
  [
    {
      to: "/articels/takeOut",
      label: "Auslagern",
      icon: "ic:baseline-outbox",
    },
    { to: "/", label: "Übersicht", icon: "ic:baseline-space-dashboard" },
    {
      to: "/articels/bringBack",
      label: "Einlagern",
      icon: "ic:baseline-move-to-inbox",
    },
  ],
]);
</script>

<template>
  <UContainer class="mb-20 w-screen overflow-hidden p-0">
    <slot />
    <UNavigationMenu
      :highlight="true"
      :items="items"
      class="fixed bottom-0 left-1/2 w-[95vw] -translate-x-1/2 justify-evenly rounded-t-2xl bg-neutral-50 px-10 py-2 lg:w-3/4"
      :ui="{
        linkLabel: 'font-semibold text-lg relative  hidden md:inline',
        linkLeadingIcon: 'shrink-0 size-10',
        link: 'w-full px-8',
      }"
    />
  </UContainer>
  <UButton
    variant="subtle"
    color="neutral"
    icon="ic:baseline-qr-code-scanner"
    class="fixed right-5 bottom-30 opacity-80"
    :ui="{
      base: 'p-3',
      leadingIcon: 'size-14',
    }"
  />
  <UButton
    to="/login"
    color="neutral"
    icon="ic:baseline-manage-accounts"
    class="fixed top-3 left-3 opacity-90"
    :ui="{
      base: 'p-2',
      leadingIcon: 'size-8',
    }"
  />
</template>
