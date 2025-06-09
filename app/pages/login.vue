<template>
  <UContainer class="flex h-screen items-center justify-center">
    <authCard />
  </UContainer>
</template>

<script setup>
definePageMeta({
  layout: false,
});

const route = useRoute();
const toast = useToast();

// Check for error query parameter and show toast
onMounted(() => {
  const errorType = route.query.error;

  switch (errorType) {
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
});
</script>
