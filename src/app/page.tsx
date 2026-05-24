import fs from "fs";
import path from "path";
import sizeOf from "image-size";
import HomeClient from "./HomeClient";

export default function Home() {
  const photoDir = "public/photos";
  const gamePhotosDir = path.join(process.cwd(), photoDir);
  let availableImages: { src: string; width: number; height: number }[] = [];

  // Derive the URL path (mapped to standard public directory)
  const publicUrlBase = "/photos";

  try {
    if (fs.existsSync(gamePhotosDir)) {
      const files = fs.readdirSync(gamePhotosDir);
      availableImages = files
        .filter((file) => /\.(avif|jpg|jpeg|png|webp|gif)$/i.test(file))
        .map((file) => {
          const filePath = path.join(gamePhotosDir, file);
          let dimensions = { width: 300, height: 300 }; // default fallbacks
          try {
            const buffer = fs.readFileSync(filePath);
            const size = sizeOf(buffer);
            if (size.width && size.height) {
              dimensions = { width: size.width, height: size.height };
            }
          } catch (e) {
            console.error(`Error reading dimensions for ${file}:`, e);
          }

          return {
            src: `${publicUrlBase}/${file}`,
            width: dimensions.width,
            height: dimensions.height,
          };
        });
    }
  } catch (error) {
    console.error("Error reading game photos directory:", error);
    availableImages = [];
  }

  return (
    <HomeClient
      availableImages={availableImages}
    />
  );
}
