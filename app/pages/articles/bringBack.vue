<template>
  <div class="m-0 flex w-full flex-col content-center items-center gap-5 p-0">
    <h1>Einlagern</h1>
    <UInputMenu v-model="selectedQrCodes" multiple :items="ScannedQrCodes" />
  </div>
</template>

<script lang="ts" setup>
const ScannedQrCodes = useState("ScannedQrCodes", () => []);
const selectedQrCodes = useState("selectedQrCodes", () => []);
</script>

<style></style>
