<template>
  <UContainer class="flex h-screen flex-col items-center justify-center">
    <!-- Preview Environment Badge -->
    <UAlert
      v-if="isPreview"
      class="mb-4 max-w-sm"
      color="warning"
      variant="soft"
      title="Testumgebung"
      description="Sie verwenden die Testversion von Provmaterial"
      icon="i-heroicons-exclamation-triangle"
    />
    <authCard class="max-w-sm" />
  </UContainer>
</template>

<script setup>
import { errorMap } from "@/composables/useFriendlyError";

definePageMeta({
  layout: false,
});

const route = useRoute();
const toast = useToast();
const { public: publicConfig } = useRuntimeConfig();
// Environment detection
const isPreview = computed(
  () =>
    publicConfig.appEnv === "preview" || publicConfig.appEnv === "development",
);

// Check for error query parameter and show toast
onMounted(() => {
  try {
    const errorType = route.query.error;

    switch (errorType) {
      case "noLogin":
        toast.add({
          title: "Keine Anmeldung",
          description:
            "Sie sind nicht angemeldet. Bitte melden Sie sich an, um fortzufahren.",
          color: "warning",
          timeout: 6000,
          icon: "i-heroicons-exclamation-circle",
        });
        break;
      case "noRight-useArticles":
        toast.add({
          title: "Keine Berechtigung",
          description:
            "Sie haben keine Berechtigung, auf diese Anwendung zuzugreifen. Bitte kontaktieren Sie den Administrator.",
          color: "error",
          timeout: 8000,
          icon: "i-heroicons-shield-exclamation",
        });
        break;
      case "unauthorized":
        toast.add({
          title: "Zugriff verweigert",
          description:
            "Nur Benutzer mit @shpower.ch E-Mail-Adressen dürfen auf diese Anwendung zugreifen.",
          color: "error",
          timeout: 8000,
          icon: "i-heroicons-shield-exclamation",
        });
        break;
      case "access_denied":
        toast.add({
          title: "Anmeldung abgebrochen",
          description:
            "Die Microsoft-Anmeldung wurde abgebrochen oder verweigert.",
          color: "warning",
          timeout: 6000,
          icon: "i-heroicons-x-circle",
        });
        break;
      case "invalid_request":
        toast.add({
          title: "Ungültige Anfrage",
          description:
            "Die Anmeldeanfrage war ungültig. Bitte versuchen Sie es erneut.",
          color: "error",
          timeout: 6000,
          icon: "i-heroicons-exclamation-triangle",
        });
        break;
      case "bad_request":
        toast.add({
          title: "Fehlerhafte Anfrage",
          description:
            "Es gab ein Problem mit den Anmeldedaten. Bitte versuchen Sie es erneut.",
          color: "error",
          timeout: 6000,
          icon: "i-heroicons-exclamation-triangle",
        });
        break;
      case "auth_error":
        toast.add({
          title: "Authentifizierungsfehler",
          description:
            "Ein unerwarteter Fehler ist bei der Anmeldung aufgetreten. Bitte versuchen Sie es später erneut.",
          color: "error",
          timeout: 8000,
          icon: "i-heroicons-exclamation-circle",
        });
        break;
      case "session_expired":
        toast.add({
          title: "Sitzung abgelaufen",
          description:
            "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
          color: "warning",
          timeout: 6000,
          icon: "i-heroicons-clock",
        });
        break;
      default:
        // No error or unknown error - don't show anything
        break;
    }
  } catch (error) {
    console.error("Login page error:", error);
    const friendlyError = errorMap(error);
    toast.add({
      title: friendlyError.title || "Unerwarteter Fehler",
      description:
        friendlyError.description ||
        "Ein unerwarteter Fehler ist aufgetreten. Bitte laden Sie die Seite neu.",
      color: friendlyError.color || "error",
      icon: friendlyError.icon || "ph:warning-circle",
    });
  }
});
</script>
