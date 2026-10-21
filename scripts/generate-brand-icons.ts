// Regenerates the share/app icons from the existing emblem only (apps/web/public/DW_logo.png)
// centred on the site background colour. Run: pnpm assets:icons
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const BACKGROUND = "#fcfcf9"; // --background in apps/web/src/app/globals.css
const root = process.cwd();
const logo = path.join(root, "apps/web/public/DW_logo.png");
const app = path.join(root, "apps/web/src/app");
const icons = path.join(root, "apps/web/public/icons");

// [output, width, height, emblem height as a share of the canvas height]
const targets: [string, number, number, number][] = [
  [path.join(icons, "icon-192.png"), 192, 192, 0.76],
  [path.join(icons, "icon-512.png"), 512, 512, 0.76],
  [path.join(app, "apple-icon.png"), 180, 180, 0.76],
  [path.join(app, "opengraph-image.png"), 1200, 630, 0.76],
  [path.join(app, "twitter-image.png"), 1200, 630, 0.76],
];

async function main() {
  await fs.mkdir(icons, { recursive: true });
  for (const [out, w, h, share] of targets) {
    const emblem = await sharp(logo)
      .resize({ height: Math.round(h * share), width: Math.round(w * share), fit: "inside" })
      .toBuffer();
    await sharp({ create: { width: w, height: h, channels: 3, background: BACKGROUND } })
      .composite([{ input: emblem, gravity: "center" }])
      .png()
      .toFile(out);
    console.log(`wrote ${path.relative(root, out)} (${w}x${h})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
