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
  if (route.query.error === "unauthorized") {
    toast.add({
      title: "Zugriff verweigert",
      description:
        "Nur Benutzer mit @shpower.ch E-Mail-Adressen dürfen auf diese Anwendung zugreifen.",
      color: "error",
      timeout: 8000,
    });
  }
});
</script>
