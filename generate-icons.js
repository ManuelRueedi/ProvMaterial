import fs from "fs";
import sharp from "sharp";

async function generateIcons() {
  try {
    const svgBuffer = fs.readFileSync("./public/icon.svg");

    // Generate 192x192 icon
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile("./public/pwa-192x192.png");

    // Generate 512x512 icon
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile("./public/pwa-512x512.png");

    console.log("PWA icons generated successfully!");
  } catch (error) {
    console.error("Error generating icons:", error);
  }
}

generateIcons();
