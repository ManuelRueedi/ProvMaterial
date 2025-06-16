interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    state?: string;
    county?: string;
  };
}

export default defineEventHandler(async (event) => {
  const { address } = await readBody(event);
  if (!address || typeof address !== "string" || address.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Adresse ist erforderlich",
    });
  }

  try {
    // Using OpenStreetMap Nominatim API for forward geocoding
    // Prioritize results in Switzerland, specifically Canton Schaffhausen
    const searchQuery = encodeURIComponent(address.trim());
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&countrycodes=ch&limit=5&addressdetails=1`,
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

    const data: NominatimResult[] = await response.json();

    if (data && data.length > 0) {
      // Sort results to prioritize Canton Schaffhausen
      const sortedResults = data.sort(
        (a: NominatimResult, b: NominatimResult) => {
          const aIsSchaffhausen =
            a.address?.state?.toLowerCase().includes("schaffhausen") ||
            a.address?.county?.toLowerCase().includes("schaffhausen") ||
            a.display_name?.toLowerCase().includes("schaffhausen");
          const bIsSchaffhausen =
            b.address?.state?.toLowerCase().includes("schaffhausen") ||
            b.address?.county?.toLowerCase().includes("schaffhausen") ||
            b.display_name?.toLowerCase().includes("schaffhausen");

          if (aIsSchaffhausen && !bIsSchaffhausen) return -1;
          if (!aIsSchaffhausen && bIsSchaffhausen) return 1;
          return 0;
        },
      );

      const result = sortedResults[0];

      if (!result) {
        return {
          success: false,
          error: "Keine gültigen Koordinaten gefunden",
        };
      }

      return {
        success: true,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        display_name: result.display_name,
        address: result.display_name,
      };
    } else {
      return {
        success: false,
        error: "Keine Koordinaten für diese Adresse gefunden",
      };
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Fehler beim Abrufen der Koordinaten von der Adresse",
    });
  }
});
