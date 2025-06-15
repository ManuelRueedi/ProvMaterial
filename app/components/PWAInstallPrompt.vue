<template>
  <Teleport to="body">
    <div
      v-if="showInstallPrompt"
      class="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        @click="dismissInstallPrompt"
      />

      <!-- Modal -->
      <div
        class="relative w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all sm:mx-auto dark:bg-gray-800"
      >
        <!-- Icon -->
        <div class="mb-4 flex justify-center">
          <div
            class="bg-primary-100 dark:bg-primary-900 flex h-16 w-16 items-center justify-center rounded-full"
          >
            <UIcon
              name="i-heroicons-device-phone-mobile"
              class="text-primary-600 dark:text-primary-400 h-8 w-8"
            />
          </div>
        </div>

        <!-- Content -->
        <div class="text-center">
          <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            App installieren
          </h3>
          <p class="mb-6 text-sm text-gray-600 dark:text-gray-300">
            Installiere ProvMaterial als App für schnelleren Zugriff und eine
            bessere Benutzererfahrung direkt vom Homescreen.
          </p>

          <!-- Features -->
          <div class="mb-6 space-y-2">
            <div class="flex items-center justify-center space-x-2 text-sm">
              <UIcon
                name="i-heroicons-bolt"
                class="h-4 w-4 text-green-600 dark:text-green-400"
              />
              <span class="text-gray-700 dark:text-gray-300">
                Schnellerer Start
              </span>
            </div>
            <div class="flex items-center justify-center space-x-2 text-sm">
              <UIcon
                name="i-heroicons-device-phone-mobile"
                class="h-4 w-4 text-green-600 dark:text-green-400"
              />
              <span class="text-gray-700 dark:text-gray-300">
                Bessere Benutzererfahrung
              </span>
            </div>
          </div>
          <!-- Actions -->
          <div class="flex space-x-3">
            <UButton
              color="neutral"
              variant="ghost"
              class="flex-1"
              @click="dismissInstallPrompt"
            >
              Später
            </UButton>
            <UButton
              color="primary"
              class="flex-1"
              :loading="isInstalling"
              @click="handleInstall"
            >
              Installieren
            </UButton>
          </div>
        </div>

        <!-- Don't show again -->
        <div class="mt-4 text-center">
          <button
            type="button"
            class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            @click="dismissInstallPrompt"
          >
            30 Tage nicht mehr anzeigen
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { showInstallPrompt, installPWA, dismissInstallPrompt } = usePWAInstall();
const toast = useToast();

const isInstalling = ref(false);

const handleInstall = async () => {
  isInstalling.value = true;

  try {
    const installed = await installPWA();

    if (installed) {
      toast.add({
        title: "App installiert",
        description: "ProvMaterial wurde erfolgreich installiert",
        color: "success",
        icon: "i-heroicons-check-circle",
      });
    }
  } catch (error) {
    console.error("Installation failed:", error);
    toast.add({
      title: "Installation fehlgeschlagen",
      description: "Die App konnte nicht installiert werden",
      color: "error",
      icon: "i-heroicons-exclamation-triangle",
    });
  } finally {
    isInstalling.value = false;
  }
};
</script>
