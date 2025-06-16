export default defineEventHandler(async (event) => {
  const { lat, lng } = await readBody(event);

  if (!lat || !lng) {
    throw createError({
      statusCode: 400,
      statusMessage: "Breitengrad und Längengrad sind erforderlich",
    });
  }

  try {
    // Using OpenStreetMap Nominatim API for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "de",
          "User-Agent": "ProvMaterial",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.display_name) {
      return {
        address: data.display_name,
        success: true,
      };
    } else {
      return {
        address: null,
        success: false,
        error: "Keine Adresse für diese Koordinaten gefunden",
      };
    }
  } catch (error) {
    console.error("Error fetching address:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Fehler beim Abrufen der Adresse von den Koordinaten",
    });
  }
});
