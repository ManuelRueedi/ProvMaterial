<script setup>
useSeoMeta({
  title: "ProvMaterial",
  description: "Manage your ProvMaterial.",
});
const { loggedIn, session, user, clear, fetch } = useUserSession();
</script>

<template>
  <main>
    <h1>Hello</h1>
    loggedIn: {{ loggedIn }}
    <br />
    session: {{ session }}
    <br />
    user: {{ user }}
    <br />
    <button @click="clear">Logout</button>
    <br />
    <NuxtLink to="/login">Login</NuxtLink>
  </main>
</template>
