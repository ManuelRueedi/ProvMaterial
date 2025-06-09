<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const { isMobile } = useDevice();
const toggleQrCodeIcon = useToggleQrCodeIcon();

// Use global scanned articles state
const { selectedArticles } = useScannedArticles();

// Computed property for QR code button icon
const qrCodeIcon = computed(() => {
  return selectedArticles.value.length > 0
    ? "ic:baseline-qr-code"
    : "ic:baseline-qr-code-scanner";
});

// Computed property for button color
const qrCodeButtonColor = computed(() => {
  return selectedArticles.value.length > 0 ? "primary" : "neutral";
});

// Mobile address bar hiding functionality
onMounted(() => {
  // Only run on mobile devices and client side
  if (!isMobile || !import.meta.client) return;

  let scrollTimer: NodeJS.Timeout;

  const triggerAddressBarHide = () => {
    // Clear any existing timer
    clearTimeout(scrollTimer);

    // Use a small delay to ensure smooth behavior
    scrollTimer = setTimeout(() => {
      const currentScrollY = window.scrollY;

      // Trigger browser address bar hiding by creating momentum
      if (currentScrollY > 0) {
        // Force a tiny scroll to trigger address bar hiding
        window.scrollBy(0, 1);
        // Immediately scroll back to maintain position
        requestAnimationFrame(() => {
          window.scrollBy(0, -1);
        });
      } else {
        // If at top, scroll down slightly then back
        window.scrollBy(0, 1);
        requestAnimationFrame(() => {
          window.scrollBy(0, -1);
        });
      }
    }, 10);
  };

  // Add scroll listener with throttling
  let isThrottled = false;

  const handleScroll = () => {
    if (isThrottled) return;

    isThrottled = true;
    triggerAddressBarHide();

    // Reset throttle after a short delay
    setTimeout(() => {
      isThrottled = false;
    }, 50);
  };

  // Add touch event handlers for more responsive behavior
  let touchStartY = 0;
  let hasMoved = false;

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches && e.touches[0]) {
      touchStartY = e.touches[0].clientY;
      hasMoved = false;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (hasMoved || !e.touches || !e.touches[0]) return;

    const touchCurrentY = e.touches[0].clientY;
    const touchDelta = Math.abs(touchStartY - touchCurrentY);

    // If user moved finger enough, trigger address bar hiding
    if (touchDelta > 10) {
      hasMoved = true;
      triggerAddressBarHide();
    }
  };

  // Use passive listeners for better performance
  const options = { passive: true };

  window.addEventListener("scroll", handleScroll, options);
  window.addEventListener("touchstart", handleTouchStart, options);
  window.addEventListener("touchmove", handleTouchMove, options);

  // Cleanup on unmount
  onBeforeUnmount(() => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("touchmove", handleTouchMove);
    clearTimeout(scrollTimer);
  });
});

const navigationMenuUi = reactive({
  root: "shadow-md",
  linkLabel: "font-semibold text-lg relative  hidden md:inline",
  linkLeadingIcon: "shrink-0 size-10",
  link: "w-full px-8",
});

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
</script>

<template>
  <UContainer class="full-width min-h-screen overflow-x-hidden pb-20">
    <slot />

    <UNavigationMenu
      :highlight="true"
      :items="items"
      highlight-color="error"
      color="primary"
      class="fixed bottom-0 left-1/2 w-[95vw] -translate-x-1/2 justify-evenly rounded-t-3xl bg-neutral-50 lg:w-3/4"
      :ui="navigationMenuUi"
    />
    <UButton
      size="xl"
      to="/login"
      color="neutral"
      icon="ic:baseline-manage-accounts"
      class="fixed top-3 left-3 z-10 opacity-70"
    />
    <div v-if="isMobile" class="fixed right-5 bottom-23 z-10">
      <UButton
        variant="subtle"
        :color="qrCodeButtonColor"
        :icon="qrCodeIcon"
        class="opacity-70"
        :ui="{
          leadingIcon: 'size-13',
        }"
        @click="toggleQrCodeIcon"
      />
      <div
        v-if="selectedArticles.length > 0"
        class="bg-neutral bg-elevated border-accented text-md absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full border px-1 font-bold"
      >
        {{ selectedArticles.length }}
      </div>
    </div>
    <QrCodeScanner />
    <PwaInstallPrompt />
    <PwaUpdateNotification />
    <OfflineIndicator />
  </UContainer>
</template>
