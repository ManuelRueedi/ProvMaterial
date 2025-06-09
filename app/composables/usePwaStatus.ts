// Extend Navigator interface for iOS standalone detection
interface ExtendedNavigator extends Navigator {
  standalone?: boolean;
}

export const usePwaStatus = () => {
  const isOnline = ref(true);
  const isInstalled = ref(false);
  const isUpdateAvailable = ref(false);
  const needRefresh = ref(false);

  // Check if app is installed
  const checkIfInstalled = () => {
    if (import.meta.client) {
      const nav = window.navigator as ExtendedNavigator;
      isInstalled.value =
        window.matchMedia("(display-mode: standalone)").matches ||
        nav.standalone === true ||
        document.referrer.includes("android-app://");
    }
  };

  // Handle online/offline status
  const updateOnlineStatus = () => {
    if (import.meta.client) {
      isOnline.value = navigator.onLine;
    }
  };

  // PWA update handling
  const updateServiceWorker = async () => {
    if (import.meta.client && "serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
          needRefresh.value = false;
          // Reload the page to apply updates
          window.location.reload();
        }
      } catch (error) {
        console.error("Error updating service worker:", error);
      }
    }
  };

  onMounted(() => {
    if (!import.meta.client) return;

    // Check installation status
    checkIfInstalled();

    // Listen for online/offline events
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    updateOnlineStatus();

    // Listen for PWA update events
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });

      // Listen for service worker updates
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  isUpdateAvailable.value = true;
                  needRefresh.value = true;
                }
              });
            }
          });
        }
      });
    }
  });

  onUnmounted(() => {
    if (import.meta.client) {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    }
  });

  return {
    isOnline: readonly(isOnline),
    isInstalled: readonly(isInstalled),
    isUpdateAvailable: readonly(isUpdateAvailable),
    needRefresh: readonly(needRefresh),
    updateServiceWorker,
    checkIfInstalled,
  };
};
