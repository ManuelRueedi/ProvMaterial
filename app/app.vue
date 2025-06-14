<script setup lang="ts">
import { NuxtPwaManifest } from "#components";
import { errorMap } from "@/composables/useFriendlyError";
const isPreview = computed(() => publicConfig.appEnv === "preview");

const toast = useToast();

// Global error handler for unhandled promise rejections
onMounted(() => {
  if (!import.meta.client) return;

  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);

    // Show user-friendly error toast
    const friendlyError = errorMap(event.reason);
    toast.add({
      title: friendlyError.title || "Unerwarteter Fehler",
      description:
        friendlyError.description || "Ein unerwarteter Fehler ist aufgetreten.",
      color: "error",
      icon: friendlyError.icon || "i-heroicons-exclamation-triangle",
    });

    // Prevent the default browser error console
    event.preventDefault();
  });
});

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
  </UApp>
</template>
