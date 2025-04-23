<script setup lang="ts">
import { usePasskey } from "@/composables/usePasskey";

const { loggedIn, user, logout, openInPopup, signUp, signIn, deleteKey } =
  usePasskey();
</script>

<template>
  <div
    class="card w-full max-w-[22rem] rounded-2xl p-6 shadow-lg sm:max-w-md md:max-w-lg lg:max-w-xl"
  >
    <!-- Signed‑in state -->
    <template v-if="loggedIn && user">
      <h1 class="mb-4 text-center text-3xl font-semibold">
        Welcome, {{ user.firstName }}!
      </h1>

      <div class="space-y-1 text-center text-base">
        <p>{{ user.jobtitle }}</p>
        <p>{{ user.mail }}</p>
      </div>

      <div
        class="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
      >
        <UButton @click="logout" label="Logout" />
        <UButton
          :disabled="user.hasWebauthn"
          label="Enable Passkey"
          @click="signUp"
        />
        <UButton
          type="reset"
          :disabled="!user.hasWebauthn"
          label="Delete Passkey"
          @click="deleteKey"
        />
      </div>

      <p v-if="user.hasWebauthn" class="mt-4 text-center text-green-600">
        Passkey registered.
      </p>
    </template>

    <!-- Guest state -->
    <template v-else>
      <h1 class="mb-6 text-center text-2xl font-semibold">Please Sign In</h1>

      <div class="flex flex-col items-center gap-4">
        <UButton
          class="w-full sm:w-auto"
          @click="openInPopup('/auth/microsoft')"
          label="Login with Microsoft"
        />
        <UButton
          class="w-full sm:w-auto"
          @click="signIn"
          label="Login with WebAuthn"
        />
      </div>
    </template>
  </div>
</template>
