<script setup lang="ts">
import { z } from "zod";

const qrArraySchema = z
  .array(z.string().min(1).max(30))
  .min(1, { message: "At least one QR code required." });

const selectedQrCodes = useState("selectedQrCodes", () => []);

async function parse() {
  const parse = qrArraySchema.safeParse(selectedQrCodes.value);
  if (!parse.success) {
    throw new Error(
      `Invalid QR array: ${parse.error.errors.map((e) => e.message).join("; ")}`,
    );
  }
  console.log(parse.data);
}
</script>

<template>
  <p class="justify-self-center" v-for="selectedQrCode in selectedQrCodes">
    {{ selectedQrCode }},
  </p>
</template>
