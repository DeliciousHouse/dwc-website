import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

type InputItem = {
  url: string; // http(s) URL, or local absolute path, or file:/// URL
  filename: string; // target filename, stored under /apps/web/public/media/stock/
};

function argValue(flag: string) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function isHttp(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

function isFileUrl(url: string) {
  return url.startsWith("file://");
}

function fileUrlToPath(u: string) {
  return decodeURIComponent(u.replace("file://", ""));
}

async function downloadToFile(url: string, outPath: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed download: ${url} (${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(outPath, buf);
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  const inputPath = argValue("--input");
  if (!inputPath) {
    throw new Error('Missing --input. Example: pnpm assets:sync -- --input ./stock.json');
  }

  const root = process.cwd();
  const stockDir = path.join(root, "apps/web/public/media/stock");
  await ensureDir(stockDir);

  const raw = await fs.readFile(path.resolve(root, inputPath), "utf8");
  const parsed = JSON.parse(raw) as InputItem[];
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Input JSON must be a non-empty array.");
  }

  const widths = [480, 768, 1024, 1440, 1920];

  for (const item of parsed) {
    if (!item?.url || !item?.filename) throw new Error("Each entry needs { url, filename }.");

    const targetOriginal = path.join(stockDir, item.filename);
    await ensureDir(path.dirname(targetOriginal));

    // Copy/download original
    if (isHttp(item.url)) {
      await downloadToFile(item.url, targetOriginal);
    } else if (isFileUrl(item.url)) {
      await fs.copyFile(fileUrlToPath(item.url), targetOriginal);
    } else {
      // treat as local path
      await fs.copyFile(item.url, targetOriginal);
    }

    const base = targetOriginal.replace(path.extname(targetOriginal), "");
    const metaPath = `${base}.meta.json`;

    const img = sharp(targetOriginal, { failOn: "none" });
    const meta = await img.metadata();
    if (!meta.width || !meta.height) throw new Error(`Could not read dimensions for ${item.filename}`);

    const variants: Record<string, { width: number; height: number }> = {};

    // Generate responsive variants
    for (const w of widths) {
      const resized = sharp(targetOriginal, { failOn: "none" }).resize({ width: w, withoutEnlargement: true });

      const webpPath = `${base}-${w}.webp`;
      await resized.webp({ quality: 80 }).toFile(webpPath);
      const webpMeta = await sharp(webpPath).metadata();
      variants[path.basename(webpPath)] = { width: webpMeta.width ?? w, height: webpMeta.height ?? Math.round((w * meta.height) / meta.width) };

      const avifPath = `${base}-${w}.avif`;
      await resized.avif({ quality: 55 }).toFile(avifPath);
      const avifMeta = await sharp(avifPath).metadata();
      variants[path.basename(avifPath)] = { width: avifMeta.width ?? w, height: avifMeta.height ?? Math.round((w * meta.height) / meta.width) };
    }

    await fs.writeFile(
      metaPath,
      JSON.stringify(
        {
          original: { filename: path.basename(targetOriginal), width: meta.width, height: meta.height },
          variants,
        },
        null,
        2
      )
    );
  }

  // eslint-disable-next-line no-console
  console.log(`Synced ${parsed.length} assets into apps/web/public/media/stock`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

