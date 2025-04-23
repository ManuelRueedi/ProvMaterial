<script setup>
useSeoMeta({
  title: "ProvMaterial",
  description: "Manage your ProvMaterial. ✨",
});

const {
  loggedIn,
  user,
  clear,
  openInPopup,
  fetch: fetchUserSession,
} = useUserSession();

const { register, authenticate } = useWebAuthn({
  registerEndpoint: "/auth/register",
  authenticateEndpoint: "/auth/authenticate",
});

async function signUp() {
  try {
    const credential = await register({ userName: user.value.mail }).then(
      fetchUserSession,
    );
    console.log("✅ Registered credential:", credential);
  } catch (err) {
    console.error(
      "❌ Registration failed:",
      err.statusText || err.data?.statusMessage || err.message,
    );
  }
}
const userName = ref("");

async function signIn() {
  try {
    await authenticate("Manuel").then(fetchUserSession); // refetch the user session
  } catch (err) {
    console.error(
      "❌ authenticate failed:",
      err.statusText || err.data?.statusMessage || err.message,
    );
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
            class="m-2 p-2"
            @click="openInPopup('/auth/microsoft')"
            label="Login with Microsoft"
          />
          <UButton
            class="m-2 p-2"
            @click="signIn"
            label="Login with WebAuthn"
          />
        </div>
        <form @submit.prevent="signIn">
          <input v-model="userName" placeholder="Email" />
          <button type="submit">Sign in</button>
        </form>
      </template>
    </div>
  </div>
</template>
