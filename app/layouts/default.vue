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

const ScannedQrCodes = useState("ScannedQrCodes", () => []);
const selectedQrCodes = useState("selectedQrCodes", () => []);

const handleModalLeave = () => {
  if (selectedQrCodes.value.length > 0) {
    navigateTo("/articels/scannedArticles");
  }
};
</script>

<template>
  <UContainer class="full-width mb-20 h-screen overflow-hidden">
    <slot />

    <UNavigationMenu
      :highlight="true"
      :items="items"
      highlight-color="error"
      color="primary"
      class="fixed bottom-0 left-1/2 w-[95vw] -translate-x-1/2 justify-evenly rounded-t-3xl bg-neutral-50 lg:w-3/4"
      :ui="{
        root: 'shadow-md',
        linkLabel: 'font-semibold text-lg relative  hidden md:inline',
        linkLeadingIcon: 'shrink-0 size-10',
        link: 'w-full px-8',
      }"
    />
    <UButton
      size="xl"
      to="/login"
      color="neutral"
      icon="ic:baseline-manage-accounts"
      class="fixed top-3 left-3 opacity-90"
    />
    <UModal
      @after:leave="handleModalLeave"
      :ui="{ header: 'hidden' }"
      description="scanning.."
      title="QrCode Scanner"
    >
      <UButton
        variant="subtle"
        color="neutral"
        icon="ic:baseline-qr-code-scanner"
        class="fixed right-10 bottom-23 opacity-80"
        :ui="{
          leadingIcon: 'size-13',
        }"
      />
      <template #body>
        <QrCodeScanner></QrCodeScanner>
      </template>
      <template #footer>
        <USelect
          class="w-full"
          v-model="selectedQrCodes"
          multiple
          :items="ScannedQrCodes"
        />
      </template>
    </UModal>
  </UContainer>
</template>
