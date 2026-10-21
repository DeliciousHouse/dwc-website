import type { MetadataRoute } from "next";

// Page background from globals.css (--background, live computed #fcfcf9).
const BACKGROUND = "#fcfcf9";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Delicious Wines",
    short_name: "Delicious Wines",
    description: "An editorial wine list with clear context.",
    start_url: "/",
    display: "browser",
    background_color: BACKGROUND,
    theme_color: BACKGROUND,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
