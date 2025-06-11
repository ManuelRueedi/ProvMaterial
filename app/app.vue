<script setup lang="ts">
import { errorMap } from "@/composables/useFriendlyError";

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
  title: "ProvMaterial",
  description: "Manage your ProvMaterial. ✨",
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
