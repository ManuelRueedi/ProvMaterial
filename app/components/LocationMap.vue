<template>
  <div class="space-y-4">
    <!-- Show message if no locations -->
    <div
      v-if="!pending && (!locations || locations.length === 0)"
      class="py-8 text-center"
    >
      <UIcon
        name="i-heroicons-map-pin"
        class="mx-auto mb-4 h-12 w-12 text-gray-400"
      />
      <h3 class="mb-2 text-lg font-semibold">
        {{ emptyStateTitle }}
      </h3>
      <p class="text-muted mb-4">
        {{ emptyStateDescription }}
      </p>
      <UButton
        v-if="showCreateButton"
        color="primary"
        icon="i-heroicons-plus"
        @click="$emit('createLocation')"
      >
        Standort erstellen
      </UButton>
    </div>
    <!-- Map container -->
    <div
      v-if="!pending && locationsWithCoordinates.length > 0"
      :class="
        isFullscreen
          ? 'bg-default fixed inset-0 z-50 p-1'
          : 'w-full overflow-hidden rounded-lg border'
      "
      :style="isFullscreen ? {} : { height: height || '24rem' }"
    >
      <ClientOnly>
        <div class="relative h-full w-full">
          <!-- Control buttons positioned over the map -->
          <div class="absolute top-4 left-4 z-10 flex gap-2">
            <UButton
              icon="i-heroicons-arrows-pointing-out"
              size="sm"
              color="neutral"
              variant="solid"
              class="!bg-white !text-black shadow-xl"
              :title="isFullscreen ? 'Vollbild verlassen' : 'Vollbild'"
              @click="toggleFullscreen"
            />
            <UButton
              icon="i-heroicons-map-pin"
              size="sm"
              color="neutral"
              variant="solid"
              class="!bg-white !text-black shadow-xl"
              title="Aktueller Standort"
              :loading="isLoadingLocation"
              @click="() => getCurrentLocation()"
            />
          </div>

          <!-- Off-screen indicator for highlighted location -->
          <div
            v-if="offScreenIndicator.show"
            class="off-screen-indicator"
            :style="{
              top: offScreenIndicator.y + 'px',
              left: offScreenIndicator.x + 'px',
              transform: `translate(-50%, -50%) rotate(${offScreenIndicator.angle}deg)`,
            }"
            @click="centerOnHighlightedLocation"
          >
            <div class="indicator-arrow">
              <UIcon
                name="ic:baseline-keyboard-arrow-up"
                class="h-7 w-7 text-white"
              />
            </div>
            <div class="indicator-label">
              {{ highlightedLocationName }}
            </div>
          </div>

          <MglMap
            ref="map"
            :map-style="mapStyle"
            :center="mapCenter"
            :zoom="mapZoom"
            @map:load="onMapLoad"
            @map:zoom="updateClusters"
            @map:move="updateClustersThrottled"
            @map:moveend="updateClusters"
          >
            <MglNavigationControl />
            <MglScaleControl />

            <!-- Current location marker -->
            <MglMarker
              v-if="currentLocation"
              :coordinates="[currentLocation.lng, currentLocation.lat]"
              :draggable="false"
            >
              <template #marker>
                <div class="current-location-marker">
                  <div class="current-location-circle">
                    <UIcon name="i-heroicons-user" class="h-4 w-4 text-white" />
                  </div>
                  <div class="current-location-pulse"></div>
                </div>
              </template>
            </MglMarker>

            <!-- Cluster and location markers -->
            <MglMarker
              v-for="cluster in clusters"
              :key="cluster.id"
              :coordinates="cluster.geometry.coordinates"
              :draggable="false"
            >
              <template #marker>
                <!-- Cluster marker (multiple locations) -->
                <div
                  v-if="cluster.properties.cluster"
                  class="cluster-marker"
                  :class="{
                    'cluster-clicked': animatingCluster === cluster.id,
                    'cluster-highlighted':
                      clusterContainsHighlightedLocation(cluster),
                  }"
                  @click="expandCluster(cluster)"
                >
                  <div
                    class="cluster-circle"
                    :class="{
                      highlighted: clusterContainsHighlightedLocation(cluster),
                    }"
                    :data-point-count="cluster.properties.point_count"
                  >
                    <div class="cluster-inner">
                      {{ cluster.properties.point_count }}
                    </div>
                  </div>
                </div>
                <!-- Single location marker -->
                <div
                  v-else
                  class="location-marker"
                  :class="{
                    'marker-clicked': animatingMarker === cluster.id,
                    highlighted:
                      cluster.properties.location.id ===
                      props.highlightedLocationId,
                  }"
                  @click="showLocationPopup(cluster)"
                >
                  <div
                    class="marker-pin"
                    :class="{
                      'storage-location':
                        cluster.properties.location.isStorageLocation,
                      'regular-location':
                        !cluster.properties.location.isStorageLocation,
                      highlighted:
                        cluster.properties.location.id ===
                        props.highlightedLocationId,
                    }"
                  >
                    <UIcon
                      :name="
                        cluster.properties.location.isStorageLocation
                          ? 'i-lucide-warehouse'
                          : 'i-lucide-map-pin'
                      "
                      class="h-5 w-5 text-white"
                    />
                  </div>
                  <div
                    class="marker-shadow"
                    :class="{
                      'highlighted-shadow':
                        cluster.properties.location.id ===
                        props.highlightedLocationId,
                    }"
                  ></div>
                </div>
              </template>
            </MglMarker>

            <!-- Map popup -->
            <MglPopup
              v-if="selectedMapLocation"
              :coordinates="[
                selectedMapLocation.longitude,
                selectedMapLocation.latitude,
              ]"
              :close-button="true"
              :close-on-click="false"
              @close="selectedMapLocation = null"
            >
              <Transition name="popup" appear>
                <div v-if="selectedMapLocation" class="popup-content">
                  <span
                    v-if="selectedMapLocation.isStorageLocation"
                    class="storage-badge storage-badge-top"
                  >
                    Lager
                  </span>
                  <div class="popup-header">
                    <h3 class="popup-title">
                      {{ selectedMapLocation.name }}
                    </h3>
                  </div>
                  <div class="popup-detail">
                    📍
                    <a
                      :href="`https://www.google.com/maps/search/?api=1&query=${selectedMapLocation.latitude},${selectedMapLocation.longitude}`"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="popup-address-link"
                    >
                      {{
                        selectedMapLocation.address ||
                        `${selectedMapLocation.latitude.toFixed(6)}, ${selectedMapLocation.longitude.toFixed(6)}`
                      }}
                    </a>
                  </div>
                  <div class="popup-detail">
                    📦 {{ selectedMapLocation.articleCount || 0 }} Artikel
                  </div>
                  <div class="mt-3 flex gap-2">
                    <button
                      v-if="showSelectButton && mode === 'select'"
                      class="popup-button popup-button-primary"
                      @click="$emit('selectLocation', selectedMapLocation)"
                    >
                      Auswählen
                    </button>
                    <button
                      v-if="showEditButton"
                      class="popup-button popup-button-primary"
                      @click="$emit('editLocation', selectedMapLocation)"
                    >
                      Bearbeiten
                    </button>
                  </div>
                </div>
              </Transition>
            </MglPopup>
          </MglMap>
        </div>
        <template #fallback>
          <div
            class="flex h-full w-full items-center justify-center rounded-lg bg-gray-100 text-gray-500"
          >
            Karte wird geladen...
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- Map Legend -->
    <div
      v-if="showLegend && locationsWithCoordinates.length > 0"
      class="flex items-center gap-4 text-sm"
    >
      <div class="flex items-center gap-2">
        <div
          class="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500"
        >
          <UIcon name="i-lucide-warehouse" class="h-2.5 w-2.5 text-white" />
        </div>
        <span>Lagerstandorte</span>
      </div>
      <div class="flex items-center gap-2">
        <div
          class="flex h-4 w-4 items-center justify-center rounded-full bg-green-500"
        >
          <UIcon name="i-lucide-map-pin" class="h-2.5 w-2.5 text-white" />
        </div>
        <span>Standorte</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Location, Project } from "@/composables/articles/types";
import Supercluster from "supercluster";
import { onMounted, onUnmounted } from "vue";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Props {
  locations: Location[];
  projects?: Project[];
  pending?: boolean;
  height?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  showCreateButton?: boolean;
  showEditButton?: boolean;
  showLegend?: boolean;
  showSelectButton?: boolean;
  mode?: "view" | "select";
  highlightedLocationId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  pending: false,
  height: "h-96",
  emptyStateTitle: "Keine Standorte vorhanden",
  emptyStateDescription:
    "Erstellen Sie Ihren ersten Standort, um ihn auf der Karte zu sehen.",
  showCreateButton: false,
  showEditButton: false,
  showLegend: true,
  showSelectButton: false,
  mode: "view",
  projects: () => [],
  highlightedLocationId: undefined,
});

const _emit = defineEmits<{
  createLocation: [];
  editLocation: [location: Location];
  selectLocation: [location: Location];
  selectProject: [project: Project];
}>();

// Component state
const selectedMapLocation = ref<Location | null>(null);

// Fullscreen and geolocation state
const isFullscreen = ref(false);
const isLoadingLocation = ref(false);
const currentLocation = ref<{ lng: number; lat: number } | null>(null);
const toast = useToast();

// Animation state
const animatingCluster = ref<string | null>(null);
const animatingMarker = ref<string | null>(null);

// Off-screen indicator state
const offScreenIndicator = ref({
  show: false,
  x: 0,
  y: 0,
  angle: 0,
});

// Clustering state
const map = ref(null);
const supercluster = ref<Supercluster | null>(null);
const clusters = ref<any[]>([]);
const currentZoom = ref(13);
const currentBounds = ref(null);

// Map configuration
const mapStyle =
  "https://api.maptiler.com/maps/0197273f-cf7d-78b4-b2e3-16a360932850/style.json?key=Z3eYEpeHavyVp6P3AygU";

// Locations that have coordinates for map display
const locationsWithCoordinates = computed(() => {
  return props.locations || [];
});

// Map center calculation - center on locations or default to Switzerland
const mapCenter = computed((): [number, number] => {
  const locationsWithCoords = locationsWithCoordinates.value;

  if (locationsWithCoords.length === 0) {
    // Default center (Switzerland)
    return [8.629319, 47.69331394];
  }

  if (locationsWithCoords.length === 1) {
    const location = locationsWithCoords[0];
    if (location) {
      return [location.longitude, location.latitude];
    }
    return [8.629319, 47.69331394];
  }

  // Calculate center of all locations
  const validLocations = locationsWithCoords;

  if (validLocations.length === 0) {
    return [8.629319, 47.69331394];
  }

  const avgLng =
    validLocations.reduce((sum, loc) => sum + loc.longitude, 0) /
    validLocations.length;
  const avgLat =
    validLocations.reduce((sum, loc) => sum + loc.latitude, 0) /
    validLocations.length;

  return [avgLng, avgLat];
});

// Map zoom calculation
const mapZoom = computed(() => {
  const locationsWithCoords = locationsWithCoordinates.value;

  if (locationsWithCoords.length <= 1) {
    return 13;
  }

  // Calculate bounds and appropriate zoom level
  const lngs = locationsWithCoords.map((loc) => loc.longitude);
  const lats = locationsWithCoords.map((loc) => loc.latitude);

  const lngSpan = Math.max(...lngs) - Math.min(...lngs);
  const latSpan = Math.max(...lats) - Math.min(...lats);
  const maxSpan = Math.max(lngSpan, latSpan);

  if (maxSpan > 1) return 8;
  if (maxSpan > 0.5) return 9;
  if (maxSpan > 0.1) return 10;
  if (maxSpan > 0.05) return 11;
  return 12;
});

// Get highlighted location name
const highlightedLocationName = computed(() => {
  if (!props.highlightedLocationId) return "";
  const location = locationsWithCoordinates.value.find(
    (loc) => loc.id === props.highlightedLocationId,
  );
  return location?.name || "";
});

// Initialize clustering
function initializeClustering() {
  const SuperclusterClass = Supercluster;
  supercluster.value = new SuperclusterClass({
    radius: 60, // Cluster radius in pixels
    maxZoom: 16, // Maximum zoom level for clustering
    minZoom: 0,
    minPoints: 2, // Minimum points to form a cluster
  });

  // Convert locations to GeoJSON features
  const features = locationsWithCoordinates.value.map((location) => ({
    type: "Feature" as const,
    properties: {
      cluster: false,
      location,
    },
    geometry: {
      type: "Point" as const,
      coordinates: [location.longitude, location.latitude],
    },
  }));

  supercluster.value.load(features);
  updateClusters();
}

// Update clusters based on current map view
function updateClusters() {
  if (!supercluster.value || !map.value) return;

  const mapInstance = (map.value as { map?: unknown })?.map as any;
  if (!mapInstance) return;

  const bounds = mapInstance.getBounds();
  const zoom = Math.floor(mapInstance.getZoom());

  currentZoom.value = zoom;
  currentBounds.value = bounds;

  const clustersData = supercluster.value.getClusters(
    [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
    zoom,
  );

  clusters.value = clustersData.map((cluster: unknown, index: number) => ({
    ...(cluster as Record<string, unknown>),
    id: (cluster as any).properties?.cluster
      ? `cluster-${(cluster as any).properties.cluster_id}`
      : `location-${(cluster as any).properties.location?.id || index}`,
  }));

  // Update off-screen indicator when map view changes
  updateOffScreenIndicator();
}

// Throttled version for smooth updates during drag
let updateThrottleTimeout: NodeJS.Timeout | null = null;
function updateClustersThrottled() {
  if (updateThrottleTimeout) {
    clearTimeout(updateThrottleTimeout);
  }
  updateThrottleTimeout = setTimeout(() => {
    updateClusters();
  }, 16); // ~60fps for smooth updates
}

// Handle map load event
function onMapLoad() {
  initializeClustering();
}

// Expand cluster when clicked
function expandCluster(cluster: Record<string, unknown>) {
  if (!map.value || !supercluster.value) return;

  const mapInstance = (map.value as { map?: unknown })?.map as any;
  if (!mapInstance) return;

  // Add click animation
  animatingCluster.value = cluster.id as string;
  setTimeout(() => {
    animatingCluster.value = null;
  }, 300);

  const properties = cluster.properties as any;
  if (properties?.cluster) {
    const expansionZoom = supercluster.value.getClusterExpansionZoom(
      properties.cluster_id,
    );
    mapInstance.easeTo({
      center: (cluster.geometry as any).coordinates,
      zoom: Math.min(expansionZoom, 20),
      duration: 500,
    });
  }
}

// Show location popup when clicked
function showLocationPopup(cluster: Record<string, unknown>) {
  const location = (cluster.properties as any).location;
  if (location) {
    // Add click animation
    animatingMarker.value = cluster.id as string;
    setTimeout(() => {
      animatingMarker.value = null;
    }, 200);

    // Toggle popup - if same location is clicked, close it; otherwise open new one
    if (
      selectedMapLocation.value &&
      selectedMapLocation.value.id === location.id
    ) {
      selectedMapLocation.value = null;
    } else {
      selectedMapLocation.value = location;
    }
  }
}

// Get current location
async function getCurrentLocation(silent = false) {
  if (!navigator.geolocation) {
    if (!silent) {
      toast.add({
        title: "Fehler",
        description: "Geolocation wird nicht unterstützt",
        color: "error",
      });
    }
    return;
  }

  isLoadingLocation.value = true;

  try {
    const position = await new Promise<GeolocationPosition>(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      },
    );

    const { latitude, longitude } = position.coords;

    // Update current location marker
    currentLocation.value = { lng: longitude, lat: latitude };

    // Center map on current location
    if (map.value) {
      const mapInstance = (map.value as { map?: unknown })?.map as any;
      if (mapInstance) {
        mapInstance.easeTo({
          center: [longitude, latitude],
          zoom: 16,
          duration: 1000,
        });
      }
    }

    if (!silent) {
      toast.add({
        title: "Standort gefunden",
        description: "Aktueller Standort wurde auf der Karte markiert",
        color: "success",
      });
    }
  } catch (error) {
    console.error("Geolocation error:", error);
    if (!silent) {
      toast.add({
        title: "Fehler",
        description: "Standort konnte nicht ermittelt werden",
        color: "error",
      });
    }
  } finally {
    isLoadingLocation.value = false;
  }
}

// Toggle fullscreen
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value;
}

// Center map on highlighted location
function centerOnHighlightedLocation() {
  if (!props.highlightedLocationId || !map.value) return;

  const highlightedLocation = locationsWithCoordinates.value.find(
    (location) => location.id === props.highlightedLocationId,
  );

  if (highlightedLocation) {
    const mapInstance = (map.value as { map?: unknown })?.map as any;
    if (mapInstance) {
      mapInstance.easeTo({
        center: [highlightedLocation.longitude, highlightedLocation.latitude],
        zoom: Math.max(mapInstance.getZoom(), 15),
        duration: 1000,
      });
    }
  }
}

// Update off-screen indicator
function updateOffScreenIndicator() {
  if (!props.highlightedLocationId || !map.value) {
    offScreenIndicator.value.show = false;
    return;
  }

  const highlightedLocation = locationsWithCoordinates.value.find(
    (location) => location.id === props.highlightedLocationId,
  );

  if (!highlightedLocation) {
    offScreenIndicator.value.show = false;
    return;
  }

  const mapInstance = (map.value as { map?: unknown })?.map as any;
  if (!mapInstance) return;

  const bounds = mapInstance.getBounds();
  const isVisible = bounds.contains([
    highlightedLocation.longitude,
    highlightedLocation.latitude,
  ]);

  if (isVisible) {
    offScreenIndicator.value.show = false;
    return;
  }

  // Calculate indicator position and angle
  const mapContainer = mapInstance.getContainer();
  const mapCenter = mapInstance.getCenter();
  const mapCenterPixel = mapInstance.project(mapCenter);
  const locationPixel = mapInstance.project([
    highlightedLocation.longitude,
    highlightedLocation.latitude,
  ]);

  // Calculate direction vector from map center to location
  const dx = locationPixel.x - mapCenterPixel.x;
  const dy = locationPixel.y - mapCenterPixel.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) {
    offScreenIndicator.value.show = false;
    return;
  }

  // Normalize direction
  const ndx = dx / distance;
  const ndy = dy / distance;

  // Calculate position on map edge (with padding)
  const padding = 50;
  const mapWidth = mapContainer.offsetWidth;
  const mapHeight = mapContainer.offsetHeight;
  const centerX = mapWidth / 2;
  const centerY = mapHeight / 2;

  // Find intersection with map bounds
  const maxX = mapWidth - padding;
  const maxY = mapHeight - padding;
  const minX = padding;
  const minY = padding;

  // Calculate intersection with bounds
  const tRight = (maxX - centerX) / ndx;
  const tLeft = (minX - centerX) / ndx;
  const tBottom = (maxY - centerY) / ndy;
  const tTop = (minY - centerY) / ndy;

  const validT = [tRight, tLeft, tBottom, tTop].filter((t) => t > 0);
  const t = Math.min(...validT);

  const indicatorX = centerX + ndx * t;
  const indicatorY = centerY + ndy * t;

  // Calculate rotation angle (pointing towards the location)
  const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;

  offScreenIndicator.value = {
    show: true,
    x: indicatorX,
    y: indicatorY,
    angle,
  };
}

// Handle escape key for fullscreen
onMounted(() => {
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape" && isFullscreen.value) {
      isFullscreen.value = false;
    }
  };

  document.addEventListener("keydown", handleEscape);

  onUnmounted(() => {
    document.removeEventListener("keydown", handleEscape);
  });
});

// Watch for location changes and reinitialize clustering
watch(
  () => locationsWithCoordinates.value,
  () => {
    if (supercluster.value) {
      initializeClustering();
    }
  },
  { deep: true },
);

// Watch for highlighted location changes and center map on it
watch(
  () => props.highlightedLocationId,
  (newHighlightedId, oldHighlightedId) => {
    if (
      newHighlightedId &&
      newHighlightedId !== oldHighlightedId &&
      map.value
    ) {
      const highlightedLocation = locationsWithCoordinates.value.find(
        (location) => location.id === newHighlightedId,
      );

      if (highlightedLocation) {
        const mapInstance = (map.value as { map?: unknown })?.map as any;
        if (mapInstance) {
          // Smooth pan to the highlighted location
          mapInstance.easeTo({
            center: [
              highlightedLocation.longitude,
              highlightedLocation.latitude,
            ],
            zoom: Math.max(mapInstance.getZoom(), 14), // Ensure minimum zoom for visibility
            duration: 1000,
          });
        }
      }
    }
    // Update off-screen indicator whenever highlighted location changes
    updateOffScreenIndicator();
  },
);

// Check if cluster contains highlighted location
function clusterContainsHighlightedLocation(
  cluster: Record<string, unknown>,
): boolean {
  if (!props.highlightedLocationId || !supercluster.value) return false;

  const properties = cluster.properties as any;
  if (!properties?.cluster) return false;

  try {
    const clusterLeaves = supercluster.value.getLeaves(
      properties.cluster_id,
      Infinity,
    );

    return clusterLeaves.some(
      (leaf: any) =>
        leaf.properties?.location?.id === props.highlightedLocationId,
    );
  } catch (error) {
    console.warn("Error checking cluster contents:", error);
    return false;
  }
}
</script>

<style scoped>
/* Location marker styles */
.location-marker {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}

.location-marker:hover {
  transform: translateY(-2px);
}

.location-marker.marker-clicked {
  animation: markerPulse 0.3s ease-out;
}

@keyframes markerPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.marker-pin {
  width: 32px;
  height: 32px;
  border-radius: 50% 50% 50% 0;
  position: relative;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid white;
  box-shadow:
    0 3px 6px rgba(0, 0, 0, 0.16),
    0 3px 6px rgba(0, 0, 0, 0.23);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.marker-pin:hover {
  box-shadow:
    0 14px 28px rgba(0, 0, 0, 0.25),
    0 10px 10px rgba(0, 0, 0, 0.22);
  transform: rotate(-45deg) translateY(-2px);
}

.marker-pin > * {
  transform: rotate(45deg);
}

.storage-location {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.regular-location {
  background: linear-gradient(135deg, #10b981, #059669);
}

.marker-shadow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%) skew(-10deg, -10deg);
  z-index: -1;
  filter: blur(3px);
}

/* Highlight styles */
.location-marker.highlighted {
  animation: greenGlow 2s infinite;
  z-index: 1000;
}

.marker-pin.highlighted {
  box-shadow:
    0 0 20px rgba(16, 185, 129, 0.8),
    0 0 40px rgba(16, 185, 129, 0.6),
    0 3px 6px rgba(0, 0, 0, 0.16),
    0 3px 6px rgba(0, 0, 0, 0.23);
}

.highlighted-shadow {
  background: rgba(16, 185, 129, 0.4) !important;
  width: 40px !important;
  height: 40px !important;
  filter: blur(8px) !important;
}

@keyframes greenGlow {
  0%,
  100% {
    filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.6));
  }
  50% {
    filter: drop-shadow(0 0 25px rgba(16, 185, 129, 1));
  }
}

/* Cluster marker styles */
.cluster-marker {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}

.cluster-marker:hover {
  transform: scale(1.05);
}

.cluster-marker.cluster-clicked {
  animation: clusterExpand 0.4s ease-out;
}

@keyframes clusterExpand {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

.cluster-circle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  color: white;
  border: 4px solid white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.cluster-circle:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
}

.cluster-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
  color: white;
}

/* Dynamic cluster sizing based on point count */
.cluster-circle[data-point-count="2"],
.cluster-circle[data-point-count="3"] {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6, #10b981);
}

.cluster-circle[data-point-count="4"],
.cluster-circle[data-point-count="5"],
.cluster-circle[data-point-count="6"] {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #1d4ed8, #059669);
}

.cluster-circle[data-point-count="7"],
.cluster-circle[data-point-count="8"],
.cluster-circle[data-point-count="9"] {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #2563eb, #047857);
}

.cluster-circle:not([data-point-count="2"]):not([data-point-count="3"]):not(
    [data-point-count="4"]
  ):not([data-point-count="5"]):not([data-point-count="6"]):not(
    [data-point-count="7"]
  ):not([data-point-count="8"]):not([data-point-count="9"]) {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #1e40af, #065f46);
}

/* Cluster highlight styles */
.cluster-marker.cluster-highlighted {
  animation: greenGlow 2s infinite;
  z-index: 999;
}

.cluster-circle.highlighted {
  box-shadow:
    0 0 25px rgba(16, 185, 129, 0.8),
    0 0 50px rgba(16, 185, 129, 0.6),
    0 4px 8px rgba(0, 0, 0, 0.3) !important;
}

.cluster-circle.highlighted:hover {
  box-shadow:
    0 0 30px rgba(16, 185, 129, 1),
    0 0 60px rgba(16, 185, 129, 0.7),
    0 8px 16px rgba(0, 0, 0, 0.4) !important;
}

/* Popup transition animations */
.popup-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.popup-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.popup-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(10px);
}

.popup-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-5px);
}

.popup-enter-to,
.popup-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Map popup styles */
.popup-content {
  padding: 0;
  min-width: 200px;
  max-width: 280px;
  animation: popupSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes popupSlideIn {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(15px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  animation: popupElementSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation-delay: 0.1s;
  animation-fill-mode: both;
}

.popup-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
}

.storage-badge {
  background: #3b82f6;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  animation: popupElementSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation-delay: 0.2s;
  animation-fill-mode: both;
}

.storage-badge-top {
  display: inline-block;
  margin-bottom: 8px;
  animation-delay: 0.1s;
}

.popup-detail {
  margin-bottom: 8px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
  animation: popupElementSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation-fill-mode: both;
}

.popup-detail:nth-child(2) {
  animation-delay: 0.15s;
}

.popup-detail:nth-child(3) {
  animation-delay: 0.25s;
}

.popup-button {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  animation: popupElementSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation-delay: 0.3s;
  animation-fill-mode: both;
  transform: translateY(10px);
}

@keyframes popupElementSlideIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.popup-address-link {
  color: #3b82f6;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.2s;
}

.popup-address-link:hover {
  color: #2563eb;
  text-decoration: none;
}

.popup-button-primary {
  background: #3b82f6;
  color: white;
}

.popup-button-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.popup-button-secondary:hover {
  background: #374151;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(107, 114, 128, 0.3);
}

/* Override default maplibre popup styles */
:global(.maplibregl-popup-content) {
  padding: 16px !important;
  border-radius: 12px !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2) !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  animation: popupBounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  backdrop-filter: blur(8px) !important;
}

@keyframes popupBounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(20px);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05) translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

:global(.maplibregl-popup-tip) {
  border-top-color: white !important;
}

:global(.maplibregl-popup-close-button) {
  font-size: 24px !important;
  color: #6b7280 !important;
  right: 8px !important;
  top: 8px !important;
  width: 32px !important;
  height: 32px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:global(.maplibregl-popup-close-button:hover) {
  color: #374151 !important;
}

/* Current location marker styles */
.current-location-marker {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Off-screen indicator styles */
.off-screen-indicator {
  position: absolute;
  z-index: 1001;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  pointer-events: all;
  animation: greenGlow 2s infinite;
}

.indicator-arrow {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #10b981, #059669);
  border: 3px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 0 20px rgba(16, 185, 129, 0.8),
    0 0 40px rgba(16, 185, 129, 0.6),
    0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.indicator-arrow:hover {
  transform: scale(1.1);
  box-shadow:
    0 0 25px rgba(16, 185, 129, 1),
    0 0 50px rgba(16, 185, 129, 0.7),
    0 6px 16px rgba(0, 0, 0, 0.4);
}

.indicator-arrow .heroicon {
  color: white;
  font-weight: bold;
}

.indicator-label {
  background: white;
  color: #1f2937;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 1px solid #e5e7eb;
  box-shadow:
    0 0 10px rgba(16, 185, 129, 0.6),
    0 2px 4px rgba(0, 0, 0, 0.1);
}

.current-location-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c82ab5, #9920db);
  border: 4px solid white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  position: relative;
}

.current-location-pulse {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(203, 24, 248, 0.4);
  animation: currentLocationPulse 2s infinite;
  z-index: 1;
}

@keyframes currentLocationPulse {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>
