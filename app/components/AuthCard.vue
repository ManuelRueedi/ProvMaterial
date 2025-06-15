<script setup lang="ts">
const toast = useToast();
const { public: publicConfig } = useRuntimeConfig();

const {
  loggedIn,
  user,
  clear: logout,
  fetch: fetchUserSession,
} = useUserSession();

/* WebAuthn helpers */
const { register, authenticate } = useWebAuthn({
  registerEndpoint: "/auth/register",
  authenticateEndpoint: "/auth/authenticate",
});

/** Microsoft login – popup on desktop, redirect on mobile */
const loginWithMicrosoft = () => {
  window.location.href = "/auth/microsoft";
};

/** Register a new passkey */
const signUp = async () => {
  try {
    if (user.value) {
      await register({ userName: user.value.mail });
      await fetchUserSession();

      // Show success message for WebAuthn registration
      toast.add({
        title: "Passkey erstellt",
        description: "WebAuthn-Passkey wurde erfolgreich registriert",
        color: "success",
        icon: "i-heroicons-check-circle",
      });
    }
  } catch (err: unknown) {
    console.error("❌ Registration failed:", (err as Error).message);
    toast.add(errorMap(err));
  }
};

/** Sign in with an existing passkey */
const signIn = async () => {
  try {
    await authenticate();
    await fetchUserSession();

    // Show success message for WebAuthn login
    toast.add({
      title: "Erfolgreich angemeldet",
      description: "WebAuthn-Anmeldung erfolgreich",
      color: "success",
      icon: "i-heroicons-check-circle",
    });
  } catch (err: unknown) {
    console.error("❌ Authenticate failed:", (err as Error).message);
    toast.add(errorMap(err));
  }
};

/** Enhanced logout with proper cleanup */
const enhancedLogout = async () => {
  await logout();
  toast.add({
    title: "Abgemeldet",
    description: "Sie wurden abgemeldet",
    color: "warning",
    icon: "i-heroicons-exclamation-triangle",
  });
};

/** Remove the user's passkey with confirmation */
const deleteKey = async () => {
  // Show confirmation dialog in German
  const confirmed = confirm(
    "Möchten Sie Ihren Passkey wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
  );

  if (!confirmed) {
    return;
  }

  try {
    const { message } = await $fetch<{ message: string }>("/auth/removeKey", {
      method: "DELETE",
    });
    await fetchUserSession();

    // Show success message
    toast.add({
      title: "Passkey entfernt",
      description: message,
      color: "success",
      icon: "i-heroicons-check-circle",
    });
  } catch (err: unknown) {
    console.error("❌ Delete key failed:", (err as Error).message);
    toast.add(errorMap(err));
  }
};

/** Test login functionality */
const testPassword = ref("");
const isTestLoginVisible = ref(false);
const isTestLoggingIn = ref(false);

const testLogin = async () => {
  if (!testPassword.value) {
    toast.add({
      title: "Fehler",
      description: "Bitte geben Sie das Test-Passwort ein",
      color: "error",
    });
    return;
  }

  isTestLoggingIn.value = true;
  try {
    await $fetch("/auth/testLogin", {
      method: "POST",
      body: { password: testPassword.value },
    });
    await fetchUserSession();
    testPassword.value = "";
    isTestLoginVisible.value = false;
    toast.add({
      title: "Erfolgreich",
      description: "Test-Anmeldung erfolgreich",
      color: "success",
    });
  } catch (err: unknown) {
    console.error("❌ Test login failed:", (err as Error).message);
    toast.add(errorMap(err));
  } finally {
    isTestLoggingIn.value = false;
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

// Check if current user has admin rights
const { session } = useUserSession();
const hasAdminRights = computed(() => {
  const userRights = session.value?.rights || [];
  return userRights.includes("admin");
});
</script>

<template>
    <!-- Signed‑in state -->
    <UContainer v-if="loggedIn && user">
      <UContainer class="my-5 flex justify-between">
        <UButton
          :disabled="!session?.rights.includes('useArticles')"
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
            background="primary"
            @click="isDark = !isDark"
          />

          <template #fallback>
            <div class="size-8" />
          </template>
        </ClientOnly>
      </UContainer>
      <h1 class="mb-4 text-center text-3xl font-semibold">
        Hallo, {{ user?.firstName }}!
      </h1>

      <!-- Test Account Badge -->
      <div
        v-if="user?.mail === 'test@example.com'"
        class="mb-4 flex justify-center"
      >
        <UBadge color="warning" variant="subtle" size="lg"> Test-Konto </UBadge>
      </div>

      <div class="space-y-1 text-center text-base">
        <p>{{ user?.jobtitle }}</p>
        <p>{{ user?.mail }}</p>
      </div>

      <div
        class="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
      >
        <UButton color="error" label="Logout" @click="enhancedLogout" />

        <!-- Show "Passkey einrichten" button only if user doesn't have WebAuthn and is not test account -->
        <UButton
          v-if="!user?.hasWebauthn && user?.mail !== 'test@example.com'"
          label="Passkey einrichten"
          @click="signUp"
        />

        <!-- Show "Passkey löschen" button only if user has WebAuthn and is not test account -->
        <UButton
          v-if="user?.hasWebauthn && user?.mail !== 'test@example.com'"
          color="warning"
          label="Passkey löschen"
          @click="deleteKey"
        />

        <!-- Admin button - only visible for users with admin rights -->
        <UButton
          v-if="hasAdminRights"
          to="/admin"
          color="primary"
          label="Admin"
          icon="i-heroicons-cog-6-tooth"
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
          label="Login mit Microsoft"
          icon="i-simple-icons-microsoft"
          @click="loginWithMicrosoft()"
        />
        <UButton
          class="w-full sm:w-auto"
          label="Login mit WebAuthn"
          icon="i-heroicons-finger-print"
          @click="signIn"
        />
        <!-- Test Login Section -->
        <div
          v-if="publicConfig.testLoginEnabled"
          class="mt-4 w-full border-t border-gray-200 pt-4 dark:border-gray-700"
        >
          <div v-if="!isTestLoginVisible" class="text-center">
            <UButton
              variant="outline"
              color="neutral"
              size="sm"
              label="Test-Anmeldung"
              icon="i-lucide-key"
              @click="isTestLoginVisible = true"
            />
          </div>

          <div v-else class="space-y-3">
            <UFormField label="Test-Passwort">
              <UInput
                v-model="testPassword"
                type="password"
                placeholder="Test-Passwort eingeben"
                @keyup.enter="testLogin"
              />
            </UFormField>
            <div class="flex gap-2">
              <UButton
                :loading="isTestLoggingIn"
                label="Anmelden"
                size="sm"
                class="flex-1"
                @click="testLogin"
              />
              <UButton
                variant="outline"
                label="Abbrechen"
                size="sm"
                class="flex-1"
                @click="
                  isTestLoginVisible = false;
                  testPassword = '';
                "
              />
            </div>
            <p class="text-muted text-center text-xs">Nur für Testzwecke</p>
          </div>
        </div>
      </div>
    </UContainer>
  </UCard>
</template>
