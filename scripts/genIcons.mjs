// One-off generator: renders favicon SVG + OG image into all the PNG/ICO
// assets the site references. Run with: node scripts/genIcons.mjs
// Requires sharp + png-to-ico (installed transiently with --no-save).
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");

const faviconSvg = await readFile(join(pub, "favicon.svg"));
const ogSvg = await readFile(join(root, "scripts", "og-image.svg"));

const png = (size) =>
  sharp(faviconSvg, { density: 384 }).resize(size, size).png().toBuffer();

const pngTargets = [
  ["favicon-16x16.png", 16],
  ["favicon-32x32.png", 32],
  ["favicon.png", 64],
  ["apple-touch-icon.png", 180],
  ["android-chrome-192x192.png", 192],
  ["android-chrome-512x512.png", 512],
];

for (const [name, size] of pngTargets) {
  await writeFile(join(pub, name), await png(size));
  console.log("wrote", name);
}

// Multi-resolution .ico (16/32/48) for legacy + browser tabs
const ico = await pngToIco([await png(16), await png(32), await png(48)]);
await writeFile(join(pub, "favicon.ico"), ico);
console.log("wrote favicon.ico");

// Open Graph / Twitter share card
await writeFile(
  join(pub, "og-image.png"),
  await sharp(ogSvg, { density: 144 }).resize(1200, 630).png().toBuffer()
);
console.log("wrote og-image.png");
