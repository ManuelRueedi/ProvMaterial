<template>
  <div>
    <UModal
      v-model:open="isModalOpen"
      title="QrCode Scanner"
      description="scanning.."
      @after:leave="handleModalLeave"
    >
      <template #content>
        <UCard>
          <div class="relative">
            <div class="absolute top-0 z-10 w-full">
              <div class="flex flex-col items-center">
                <p
                  class="rounded-b-2xl bg-neutral-900 px-3 pb-2 text-neutral-50"
                >
                  {{ selectedConstraints.label }}
                </p>
                <p class="error rounded-2xl bg-neutral-900 px-3">{{ error }}</p>
              </div>
            </div>
            <div class="relative">
              <u-button
                color="neutral"
                class="absolute bottom-5 left-5 z-10 shadow-xl"
                size="lg"
                icon="ic:baseline-cameraswitch"
                @click="toggleConstraint"
              />

              <!-- Loading Screen -->
              <div
                v-if="isCameraLoading"
                class="bg-accented absolute inset-0 z-20 flex flex-col items-center justify-center"
              >
                <div class="flex flex-col items-center space-y-4">
                  <UIcon
                    name="ic:baseline-camera-alt"
                    class="h-16 w-16 animate-pulse"
                  />
                  <div class="text-center">
                    <p class="text-lg font-medium">Kamera wird gestartet...</p>
                  </div>
                  <div class="flex space-x-1">
                    <div
                      class="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.3s]"
                    ></div>
                    <div
                      class="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.15s]"
                    ></div>
                    <div
                      class="h-2 w-2 animate-bounce rounded-full bg-white"
                    ></div>
                  </div>
                </div>
              </div>

              <qrcode-stream
                :constraints="selectedConstraints.constraints"
                :track="paintOutline"
                @error="onError"
                @detect="onDetect"
                @camera-on="onCameraReady"
              />
            </div>
          </div>

          <!-- Selected Articles Display -->
          <div v-if="scannedArticles.length > 0" class="mt-4">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="text-sm font-medium">
                Gescannte Artikel ({{ scannedArticles.length }})
              </h3>
              <UButton
                size="xs"
                variant="soft"
                color="error"
                label="Alle löschen"
                icon="ic:baseline-clear"
                @click="clearAll"
              />
            </div>
            <div class="max-h-48 space-y-2 overflow-y-auto">
              <div
                v-for="article in scannedArticles"
                :key="article.id"
                class="border-default flex cursor-pointer items-center justify-between rounded-md border p-2"
                @click="
                  toggleArticleSelection({
                    ...article,
                    tags: [...article.tags],
                    outputs: { ...article.outputs },
                  })
                "
              >
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <UBadge variant="soft" color="primary" size="sm">
                      {{ article.id }}
                    </UBadge>
                    <span class="text-sm">{{ article.type }}</span>
                    <span class="text-xs"> {{ article.lengthInMeter }}m </span>
                  </div>
                  <div class="text-xs">
                    {{ article.storageLocation?.name }} -
                    {{ article.storageLocationSection }}
                  </div>
                </div>

                <div class="flex items-center gap-1">
                  <UCheckbox
                    :model-value="
                      selectedArticles.some(
                        (selected) => selected.id === article.id,
                      )
                    "
                    @click.stop
                  />
                </div>
              </div>
            </div>

            <div v-if="selectedArticles.length > 0" class="mt-3 text-center">
              <p class="text-xs">
                {{ selectedArticles.length }} Artikel ausgewählt
              </p>
            </div>
          </div>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { QrcodeStream } from "vue-qrcode-reader";
import type { DetectedBarcode, EmittedError } from "vue-qrcode-reader";

// Device detection and modal state
const showQrCodeIcon = useShowQrCodeIcon();
const isModalOpen = computed({
  get: () => showQrCodeIcon.value,
  set: (value) => (showQrCodeIcon.value = value),
});

// Camera loading state
const isCameraLoading = ref(true);

/*** detection handling ***/

const {
  scannedArticles,
  selectedArticles,
  fetchAndAddArticle,
  clearAll,
  toggleArticleSelection,
} = useScannedArticles();

function onDetect(detectedCodes: DetectedBarcode[]) {
  const newCodes = detectedCodes.map((code) => code.rawValue);
  newCodes.forEach((newCode) => {
    if (newCode !== undefined) {
      // Fetch article data for the scanned QR code
      fetchAndAddArticle(newCode);
    }
  });
}

/*** select camera ***/

// keep track of where we are in the list
const currentOptIdx = ref(0);

/** Go to the next constraint option (wraps around) */
function toggleConstraint() {
  currentOptIdx.value =
    (currentOptIdx.value + 1) % constraintOptions.value.length;

  const nextConstraint = constraintOptions.value[currentOptIdx.value];
  if (nextConstraint) {
    selectedConstraints.value = nextConstraint;
  }
  isCameraLoading.value = true; // Reset loading state when changing camera
}

type constraintOptions = {
  label: string;
  constraints: {
    facingMode?: string;
    deviceId?: string;
  };
};
const selectedConstraints: Ref<constraintOptions> = ref({
  label: "Rückkamera",
  constraints: { facingMode: "environment" },
});
const defaultConstraintOptions: constraintOptions[] = [
  { label: "Rückkamera", constraints: { facingMode: "environment" } },
  { label: "Frontkamera", constraints: { facingMode: "user" } },
];
const constraintOptions = ref(defaultConstraintOptions);

async function onCameraReady() {
  // NOTE: on iOS we can't invoke `enumerateDevices` before the user has given
  // camera access permission. `QrcodeStream` internally takes care of
  // requesting the permissions. The `camera-on` event should guarantee that this
  // has happened.
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(({ kind }) => kind === "videoinput");

  constraintOptions.value = [
    ...defaultConstraintOptions,
    ...videoDevices.map(({ deviceId, label }) => ({
      label: `${label}`,
      constraints: { deviceId },
    })),
  ];

  error.value = "";
  isCameraLoading.value = false;
}

/*** track functons ***/

function paintOutline(
  detectedCodes: DetectedBarcode[],
  ctx: CanvasRenderingContext2D,
) {
  for (const detectedCode of detectedCodes) {
    const [firstPoint, ...otherPoints] = detectedCode.cornerPoints;

    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(firstPoint.x, firstPoint.y);
    for (const { x, y } of otherPoints) {
      ctx.lineTo(x, y);
    }
    ctx.lineTo(firstPoint.x, firstPoint.y);
    ctx.closePath();
    ctx.stroke();
  }
  for (const detectedCode of detectedCodes) {
    const { boundingBox, rawValue } = detectedCode;

    const centerX = boundingBox.x + boundingBox.width / 2;
    const centerY = boundingBox.y + boundingBox.height / 2;

    const fontSize = Math.max(20, (50 * boundingBox.width) / ctx.canvas.width);

    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = "center";

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#222";
    ctx.strokeText(detectedCode.rawValue, centerX, centerY);

    ctx.fillStyle = "#EEE";
    ctx.fillText(rawValue, centerX, centerY);
  }
}
/*** error handling ***/

const error = ref("");

function onError(err: EmittedError) {
  error.value = `[${err.name}]: `;

  if (err.name === "NotAllowedError") {
    error.value += "Sie müssen die Kamera-Berechtigung erteilen";
  } else if (err.name === "NotFoundError") {
    error.value += "keine Kamera auf diesem Gerät gefunden";
  } else if (err.name === "NotSupportedError") {
    error.value += "sicherer Kontext erforderlich (HTTPS, localhost)";
  } else if (err.name === "NotReadableError") {
    error.value += "wird die Kamera bereits verwendet?";
  } else if (err.name === "OverconstrainedError") {
    error.value += "installierte Kameras sind nicht geeignet";
  } else if (err.name === "StreamApiNotSupportedError") {
    error.value += "Stream API wird in diesem Browser nicht unterstützt";
  } else if (err.name === "InsecureContextError") {
    error.value +=
      "Kamera-Zugriff ist nur in sicherem Kontext erlaubt. Verwenden Sie HTTPS oder localhost statt HTTP.";
  } else {
    error.value += err.message;
  }

  // Stop loading on error
  isCameraLoading.value = false;
}

/*** modal handling ***/

function handleModalLeave() {
  // Reset error state when modal closes
  error.value = "";
  // Reset loading state when modal closes
  isCameraLoading.value = true;
}
</script>

<style scoped>
.error {
  font-weight: bold;
  color: red;
}
.barcode-format-checkbox {
  margin-right: 10px;
  white-space: nowrap;
  display: inline-block;
}
</style>
