<script setup>
useSeoMeta({
  title: "ProvMaterial",
  description: "Manage your ProvMaterial. ✨",
});

const { loggedIn, user, clear, openInPopup, fetch } = useUserSession();

const { register } = useWebAuthn({
  registerEndpoint: "/auth/register",
  authenticateEndpoint: "/webauthn/authenticate",
});

async function signUp() {
  if (!loggedIn.value) {
    console.error("❌ Not logged in");
    return;
  }

  try {
    const credential = await register({ userName: user.value.mail });
    console.log("✅ Registered credential:", credential);
    fetch();
  } catch (err) {
    console.error(
      "❌ Registration failed:",
      err.statusText || err.data?.statusMessage || err.message,
    );
    fetch();
  }
}
</script>

<template>
  <div class="flex h-dvh items-center justify-center">
    <div class="card">
      <!-- Signed-in state -->
      <template v-if="loggedIn && user">
        <div class="text-3xl font-semibold">Welcome, {{ user.firstName }}!</div>
        <div class="space-y-4 text-center">
          <p class="p-1">{{ user.jobtitle }}</p>
          <p class="p-1">{{ user.mail }}</p>
        </div>
        <div class="flex justify-center space-x-5 p-2">
          <UButton @click="clear" label="logout" />
          <u-button
            :disabled="user.hasWebauthn"
            label="Enable Passkey"
            @click="signUp"
          />
        </div>
        <p class="p-3 text-center text-green-600" v-if="user.hasWebauthn">
          Passkey registered.
        </p>
      </template>

      <!-- Guest state -->
      <template v-else>
        <div class="text-center text-2xl font-semibold">Please Sign In</div>
        <div class="space-y-4 p-4 text-center">
          <UButton
            @click="openInPopup('/auth/microsoft')"
            label="Login with Microsoft"
          />
        </div>
      </template>
    </div>
  </div>
</template>
