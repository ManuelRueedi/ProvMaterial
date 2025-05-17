<script setup lang="ts">
const toast = useToast();

const {
  loggedIn,
  user,
  clear: logout,
  openInPopup,
  fetch: fetchUserSession,
} = useUserSession();

/* WebAuthn helpers */
const { register, authenticate } = useWebAuthn({
  registerEndpoint: "/auth/register",
  authenticateEndpoint: "/auth/authenticate",
});

const { isDesktop } = useDevice();

/** Microsoft login – popup on desktop, redirect on mobile */
const loginWithMicrosoft = () => {
  const url = "/auth/microsoft";
  if (isDesktop) {
    openInPopup(url);
  } else {
    window.location.href = url;
  }
};

/** Register a new passkey */
const signUp = async () => {
  try {
    if (user.value) {
      await register({ userName: user.value.mail });
      await fetchUserSession();
    }
  } catch (err: any) {
    console.error("❌ Registration failed:", err.message);
    toast.add(errorMap(err));
  }
};

/** Sign in with an existing passkey */
const signIn = async () => {
  try {
    await authenticate();
    await fetchUserSession();
  } catch (err: any) {
    console.error("❌ Authenticate failed:", err.message);
    toast.add(errorMap(err));
  }
};

/** Remove the user’s passkey */
const deleteKey = async () => {
  try {
    const { message } = await $fetch<{ message: string }>("/auth/removeKey", {
      method: "DELETE",
    });
    await fetchUserSession();
    console.log(message);
  } catch (err: any) {
    console.error("❌ Delete key failed:", err.message);
    toast.add(errorMap(err));
  }
};

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
