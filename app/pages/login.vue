<script setup lang="ts">
import { watchEffect } from "vue";

const { openInPopup, loggedIn, fetch } = useUserSession(); // has openInPopup :contentReference[oaicite:0]{index=0}

async function signIn() {
  await openInPopup("/auth/microsoft", { width: 600, height: 650 });
  await fetch(); // make sure main window sees the fresh cookie
}

watchEffect(() => {
  if (loggedIn.value) navigateTo("/"); // jump away as soon as we’re logged in
});
</script>

<template>
  <main class="grid h-screen place-content-center gap-4">
    <h1 class="text-xl font-semibold">Bitte anmelden</h1>
    <button class="rounded-xl px-6 py-3 shadow" @click="signIn">
      Sign in with Microsoft
    </button>
  </main>
</template>
