<template>
  <div class="flex h-full w-full flex-1 flex-col">
    <!-- <p>{{ address }}</p>
    <p>Latitude: {{ latitude }}</p>
    <p>Longitude: {{ longitude }}</p>
    <ClientOnly>
      <MglMap :map-style="style" :center="center" :zoom="zoom">
        <MglNavigationControl />
        <mgl-marker
          v-model:coordinates="coordinates"
          :draggable="true"
          @dragend="onDragEnd"
        />
      </MglMap>
    </ClientOnly> -->
    <UButton
      class="ml-2 justify-center p-2"
      color="neutral"
      @click="openCreateLocation = true"
    >
      Hinzufügen
    </UButton>
    <ClientOnly>
      <CreateLocationSlideover v-model:open="openCreateLocation">
      </CreateLocationSlideover>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
const openCreateLocation = ref(false);
const style =
  "https://api.maptiler.com/maps/0197273f-cf7d-78b4-b2e3-16a360932850/style.json?key=Z3eYEpeHavyVp6P3AygU";
const center: [number, number] = [8.65374, 47.69431];
const zoom = 13;
const coordinates = ref<{ lng: number; lat: number }>({
  lng: 8.65374,
  lat: 47.69431,
});

const latitude = ref(47.69431);
const longitude = ref(8.65374);
const address = ref("");

function onDragEnd() {
  latitude.value = coordinates.value.lat;
  longitude.value = coordinates.value.lng;
  console.log("Drag ended:", coordinates.value.lat, coordinates.value.lng);

  // Get address from coordinates
  getAddressFromCoordinates(coordinates.value.lat, coordinates.value.lng);
}

async function getAddressFromCoordinates(lat: number, lng: number) {
  try {
    // Using OpenStreetMap Nominatim API for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "de", // Get results in German
          "User-Agent": "ProvMaterial", // Replace with your application name
        },
      },
    );

    const data = await response.json();

    if (data && data.display_name) {
      address.value = data.display_name;
    }
  } catch (error) {
    console.error("Error fetching address:", error);
  }
}
</script>

<style></style>
