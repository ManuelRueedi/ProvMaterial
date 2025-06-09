<template>
  <div
    v-if="showInstallPrompt"
    class="fixed right-4 bottom-4 left-4 z-50 rounded-lg border border-gray-200 bg-white p-4 shadow-lg md:right-4 md:left-auto md:w-80 dark:border-gray-700 dark:bg-gray-800"
  >
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0">
        <UIcon
          name="i-heroicons-device-phone-mobile"
          class="text-primary h-6 w-6"
        />
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
          ProvMaterial installieren
        </h3>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Zum Startbildschirm hinzufügen für schnellen Zugriff und
          Offline-Funktionalität.
        </p>
        <div class="mt-3 flex gap-2">
          <button
            @click="installPwa"
            class="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 inline-flex items-center rounded-md border border-transparent px-3 py-1.5 text-xs font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            Installieren
          </button>
          <button
            @click="dismissPrompt"
            class="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Später vielleicht
          </button>
          <button
            class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            @click="neverShowAgain"
          >
            Niemals
          </button>
        </div>
      </div>
      <button
        class="flex-shrink-0 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
        @click="dismissPrompt"
      >
        <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const showInstallPrompt = ref(false);
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);

const shouldShowPrompt = () => {
  if (
    import.meta.client &&
    window.matchMedia("(display-mode: standalone)").matches
  ) {
    return false;
  }

  if (
    import.meta.client &&
    localStorage.getItem("pwa-install-dismissed") === "never"
  ) {
    return false;
  }

  const lastDismissed = import.meta.client
    ? localStorage.getItem("pwa-install-last-dismissed")
    : null;
  if (lastDismissed) {
    const daysSinceDismissal =
      (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
    if (daysSinceDismissal < 7) {
      return false;
    }
  }

  return true;
};

const installPwa = async () => {
  if (!deferredPrompt.value) return;

  try {
    await deferredPrompt.value.prompt();
    const { outcome } = await deferredPrompt.value.userChoice;

    if (outcome === "accepted") {
      console.log("PWA erfolgreich installiert");
    }

    deferredPrompt.value = null;
    showInstallPrompt.value = false;
  } catch (error) {
    console.error("Fehler beim Installieren der PWA:", error);
  }
};

const dismissPrompt = () => {
  showInstallPrompt.value = false;
  if (import.meta.client) {
    localStorage.setItem("pwa-install-last-dismissed", Date.now().toString());
  }
};

const neverShowAgain = () => {
  showInstallPrompt.value = false;
  if (import.meta.client) {
    localStorage.setItem("pwa-install-dismissed", "never");
  }
};

onMounted(() => {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    deferredPrompt.value = e as BeforeInstallPromptEvent;

    if (shouldShowPrompt()) {
      setTimeout(() => {
        showInstallPrompt.value = true;
      }, 3000);
    }
  });

  window.addEventListener("appinstalled", () => {
    console.log("PWA wurde installiert");
    showInstallPrompt.value = false;
    deferredPrompt.value = null;
  });
});
</script>
