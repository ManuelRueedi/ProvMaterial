<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
const { isMobile } = useDevice();

const items = ref<NavigationMenuItem[][]>([
  [
    {
      to: "/articles/takeOut",
      label: "Auslagern",
      icon: "ic:baseline-outbox",
    },
    { to: "/", label: "Übersicht", icon: "ic:baseline-space-dashboard" },
    {
      to: "/articles/bringBack",
      label: "Einlagern",
      icon: "ic:baseline-move-to-inbox",
    },
  ],
]);

const ScannedQrCodes = useState("ScannedQrCodes", () => []);
const selectedQrCodes = useState("selectedQrCodes", () => []);

const handleModalLeave = () => {
  if (selectedQrCodes.value.length > 0) {
    //navigateTo("/articles/scannedArticles");
  }
};
</script>

<template>
  <UContainer class="full-width h-screen overflow-x-hidden pt-5 pb-20">
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
      class="fixed top-3 left-3 z-10 opacity-90"
    />
    <UModal
      v-if="isMobile"
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
        <qrCodeScanner></qrCodeScanner>
      </template>
      <template #footer>
        <USelect
          v-if="ScannedQrCodes.length > 0"
          class="w-full"
          v-model="selectedQrCodes"
          multiple
          :items="ScannedQrCodes"
        />
      </template>
    </UModal>
  </UContainer>
</template>
