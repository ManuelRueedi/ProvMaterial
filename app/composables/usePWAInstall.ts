// Type for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Extend Window interface to include beforeinstallprompt and appinstalled events
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    appinstalled: Event;
  }
}

export const usePWAInstall = () => {
  const isInstallable = ref(false);
  const isInstalled = ref(false);
  const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
  const showInstallPrompt = ref(false);
  const dismissedInstallPrompt = ref(false); // Check if PWA is already installed
  const checkIfInstalled = () => {
    if (!import.meta.client) return;

    // Check if running in standalone mode (PWA is installed)
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    const isIOSInstalled =
      "standalone" in window.navigator &&
      Boolean((window.navigator as { standalone?: boolean }).standalone);

    isInstalled.value = isStandalone || isIOSInstalled;
  };

  // Check localStorage for dismissed prompt
  const checkDismissedStatus = () => {
    if (!import.meta.client) return;

    const dismissed = localStorage.getItem("pwa-install-dismissed");
    const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days

    // Reset dismissed status if more than 30 days have passed
    if (dismissedTime && dismissedTime > thirtyDaysAgo) {
      dismissedInstallPrompt.value = true;
    } else if (dismissedTime && dismissedTime <= thirtyDaysAgo) {
      localStorage.removeItem("pwa-install-dismissed");
      dismissedInstallPrompt.value = false;
    }
  };
  // Listen for beforeinstallprompt event
  const setupInstallPrompt = () => {
    if (!import.meta.client) return;
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Store the event so it can be triggered later
      deferredPrompt.value = e;
      isInstallable.value = true;

      // Show our custom install prompt if not dismissed and not already installed
      if (!dismissedInstallPrompt.value && !isInstalled.value) {
        // Prevent the mini-infobar from appearing on mobile since we'll show our custom one
        e.preventDefault();

        // Add a small delay to avoid showing immediately on page load
        setTimeout(() => {
          showInstallPrompt.value = true;
        }, 3000);
      }
      // If dismissed or already installed, let the browser handle it naturally
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener("appinstalled", () => {
      isInstalled.value = true;
      isInstallable.value = false;
      showInstallPrompt.value = false;
      deferredPrompt.value = null;
    });

    // Cleanup function
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  };

  // Install the PWA
  const installPWA = async () => {
    if (!deferredPrompt.value) return false;

    try {
      // Show the install prompt
      deferredPrompt.value.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.value.userChoice;

      if (outcome === "accepted") {
        isInstalled.value = true;
        showInstallPrompt.value = false;
      }

      // Clear the deferred prompt
      deferredPrompt.value = null;
      isInstallable.value = false;

      return outcome === "accepted";
    } catch (error) {
      console.error("Error installing PWA:", error);
      return false;
    }
  };

  // Dismiss the install prompt
  const dismissInstallPrompt = () => {
    showInstallPrompt.value = false;
    dismissedInstallPrompt.value = true;

    // Store dismissal in localStorage with timestamp
    if (import.meta.client) {
      localStorage.setItem("pwa-install-dismissed", Date.now().toString());
    }
  };

  // Initialize on client side
  onMounted(() => {
    checkIfInstalled();
    checkDismissedStatus();
    setupInstallPrompt();
  });
  // Show the install prompt manually (bypasses dismissal check)
  const showInstallDialog = () => {
    if (isInstallable.value && !isInstalled.value) {
      showInstallPrompt.value = true;
    }
  };

  return {
    isInstallable: readonly(isInstallable),
    isInstalled: readonly(isInstalled),
    showInstallPrompt: readonly(showInstallPrompt),
    dismissedInstallPrompt: readonly(dismissedInstallPrompt),
    installPWA,
    dismissInstallPrompt,
    showInstallDialog, // For manual triggering if needed
  };
};
