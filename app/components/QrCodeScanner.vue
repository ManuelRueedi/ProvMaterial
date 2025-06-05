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
              <qrcode-stream
                :constraints="selectedConstraints.constraints"
                :track="paintOutline"
                @error="onError"
                @detect="onDetect"
                @camera-on="onCameraReady"
              />
            </div>
          </div>
          <USelect
            v-if="ScannedQrCodes.length > 0"
            v-model="selectedQrCodes"
            class="mt-3 w-full"
            multiple
            :items="ScannedQrCodes"
          />
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { QrcodeStream } from "vue-qrcode-reader";
import type { DetectedBarcode, EmittedError } from "vue-qrcode-reader";

// Device detection and modal state
const { isMobile } = useDevice();
const showQrCodeIcon = useShowQrCodeIcon();
const isModalOpen = computed({
  get: () => showQrCodeIcon.value,
  set: (value) => (showQrCodeIcon.value = value),
});

// Modal UI configuration
const modalUi = reactive({ header: "hidden" });

/*** detection handling ***/

const ScannedQrCodes: Ref<string[]> = useState("ScannedQrCodes", () => []);
const selectedQrCodes: Ref<string[]> = useState("selectedQrCodes", () => []);

function onDetect(detectedCodes: DetectedBarcode[]) {
  const newCodes = detectedCodes.map((code) => code.rawValue);
  newCodes.forEach((newCode) => {
    if (newCode !== undefined) {
      if (!ScannedQrCodes.value.includes(newCode)) {
        ScannedQrCodes.value.push(newCode);
      }
    }
  });
  newCodes.forEach((newCode) => {
    if (newCode !== undefined) {
      if (!selectedQrCodes.value.includes(newCode)) {
        selectedQrCodes.value.push(newCode);
      }
    }
  });
}

// Modal leave handler
const handleModalLeave = () => {
  if (selectedQrCodes.value.length > 0) {
    //navigateTo("/articles/scannedArticles");
  }
};

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
}

/*** track functons ***/

function paintOutline(detectedCodes: DetectedBarcode[], ctx: any) {
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
    error.value += "you need to grant camera access permission";
  } else if (err.name === "NotFoundError") {
    error.value += "no camera on this device";
  } else if (err.name === "NotSupportedError") {
    error.value += "secure context required (HTTPS, localhost)";
  } else if (err.name === "NotReadableError") {
    error.value += "is the camera already in use?";
  } else if (err.name === "OverconstrainedError") {
    error.value += "installed cameras are not suitable";
  } else if (err.name === "StreamApiNotSupportedError") {
    error.value += "Stream API is not supported in this browser";
  } else if (err.name === "InsecureContextError") {
    error.value +=
      "Camera access is only permitted in secure context. Use HTTPS or localhost rather than HTTP.";
  } else {
    error.value += err.message;
  }
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
