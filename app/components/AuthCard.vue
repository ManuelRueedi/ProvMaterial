<script setup lang="ts">
import { usePasskey } from "@/composables/usePasskey";

const {
  loggedIn,
  user,
  signUp,
  signIn,
  deleteKey,
  loginWithMicrosoft,
  logout,
} = usePasskey();

const colorMode = useColorMode();
const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set(_isDark) {
    colorMode.preference = _isDark ? "dark" : "light";
  },
});
</script>

<template>
  <UCard class="flex max-h-fit max-w-fit rounded-2xl">
    <!-- Signed‑in state -->
    <UContainer v-if="loggedIn && user">
      <UContainer class="my-5 flex justify-between">
        <UButton
          to="/"
          icon="ic:baseline-home"
          size="xl"
          color="neutral"
          variant="ghost"
          class="flex justify-end"
        />
        <ClientOnly v-if="!colorMode?.forced">
          <UButton
            :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
            color="neutral"
            variant="ghost"
            size="xl"
            @click="isDark = !isDark"
            background="primary"
          />

          <template #fallback>
            <div class="size-8" />
          </template>
        </ClientOnly>
      </UContainer>
      <h1 class="mb-4 text-center text-3xl font-semibold">
        Hallo, {{ user?.firstName }}!
      </h1>

      <div class="space-y-1 text-center text-base">
        <p>{{ user?.jobtitle }}</p>
        <p>{{ user?.mail }}</p>
      </div>

      <div
        class="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
      >
        <UButton color="error" @click="logout" label="Logout" />
        <UButton
          :disabled="user?.hasWebauthn"
          label="Passkey einrichten"
          @click="signUp"
        />
        <UButton
          color="warning"
          :disabled="!user?.hasWebauthn"
          label="Passkey löschen"
          @click="deleteKey"
        />
      </div>

      <p v-if="user?.hasWebauthn" class="text-success-600 mt-4 text-center">
        Passkey registriert.
      </p>
    </UContainer>

    <!-- Guest state -->
    <UContainer v-else>
      <h1 class="mb-6 text-center text-2xl font-semibold">Bitte anmelden</h1>

      <div class="flex flex-col items-center gap-4">
        <UButton
          class="w-full sm:w-auto"
          @click="loginWithMicrosoft()"
          label="Login mit Microsoft"
        />
        <UButton
          class="w-full sm:w-auto"
          @click="signIn"
          label="Login mit WebAuthn"
        />
      </div>
    </UContainer>
  </UCard>
</template>
