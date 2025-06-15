<script setup lang="ts">
import { NuxtPwaManifest } from "#components";
const { public: publicConfig } = useRuntimeConfig();
const isPreview = computed(() => publicConfig.appEnv === "preview");

useSeoMeta({
  title: isPreview.value ? "ProvMaterial (Preview)" : "ProvMaterial",
  description: "Verwalte dein ProvMaterial. ✨",
});
</script>

<template>
  <UApp>
    <NuxtPwaManifest />
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- PWA Install Prompt -->
    <PWAInstallPrompt />
  </UApp>
</template>
