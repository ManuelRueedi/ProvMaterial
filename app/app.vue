<script setup lang="ts">
import { errorMap } from "@/composables/useFriendlyError";

// SEO and PWA Head configuration
useHead({
  link: [
    { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
    { rel: 'icon', href: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon-180x180.png' }
  ]
})

const toast = useToast();

// Global error handler for unhandled promise rejections
onMounted(() => {
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
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
