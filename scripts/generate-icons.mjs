// Generates the ensage brand assets (favicon, PWA/apple icons, OG image and the
// standalone logo lock-ups) from the single source-of-truth mark.
//
//   node scripts/generate-icons.mjs
//
// The generated files are committed, so this only needs to run when the mark or
// the palette changes. Requires `sharp` (a transitive dependency of next).
import { mkdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

// --- The mark (viewBox 0 0 500 538) ----------------------------------------
const MARK_PATH =
  "M176.971 7.02945C181.471 2.52858 187.576 0 193.941 0H452C478.51 0 500 21.4904 500 48V120.262C500 129.777 494.379 138.393 485.672 142.227L232.678 253.624C216.866 257.861 216.866 280.296 232.678 284.533L485.672 395.93C494.379 399.764 500 408.381 500 417.895V490C500 516.51 478.51 538 452 538H48C21.4903 538 0 516.51 0 490L0 193.941C0 187.576 2.52856 181.471 7.02944 176.971L176.971 7.02945Z"
const MARK_W = 500
const MARK_H = 538

// --- Palette ---------------------------------------------------------------
// The mark is a single orange gradient, so it always needs an opaque backing
// to sit on: white in light contexts, near-black in dark ones.
const COLORS = {
  brand: "#f98028",
  brandLight: "#ffc398",
  lightTile: "#ffffff",
  lightRing: "#e7e5e4",
  darkTile: "#17140f",
  darkRing: "#3a332a",
  ink: "#f5f1ea",
  muted: "#a8a29e",
  ogBackground: "#14120f",
}

const FONT =
  "Instrument Sans, Helvetica Neue, Helvetica, Arial, sans-serif"

const gradientDefs = () =>
  `<linearGradient id="brand" x1="250" y1="0" x2="250" y2="538" gradientUnits="userSpaceOnUse">` +
  `<stop stop-color="${COLORS.brand}"/><stop offset="1" stop-color="${COLORS.brandLight}"/></linearGradient>`

/** The mark, scaled to `height` and centred on (cx, cy). */
function markGroup({ height, cx, cy, fill = "url(#brand)" }) {
  const scale = height / MARK_H
  const x = cx - (MARK_W / 2) * scale
  const y = cy - (MARK_H / 2) * scale
  return (
    `<g transform="translate(${x.toFixed(3)} ${y.toFixed(3)}) scale(${scale.toFixed(5)})">` +
    `<path d="${MARK_PATH}" fill="${fill}"/></g>`
  )
}

/**
 * A square app-icon: rounded backing tile, a hairline ring and the mark.
 * `radius: 0` produces a full-bleed square (for maskable/iOS icons).
 */
function tileIcon({ size, background, ring, radius = size * 0.22, markRatio = 0.58 }) {
  const stroke = radius === 0 ? 0 : Math.max(1, size / 180)
  const inset = stroke / 2
  const ringRect =
    stroke > 0
      ? `<rect x="${inset}" y="${inset}" width="${size - stroke}" height="${size - stroke}" rx="${Math.max(
          0,
          radius - inset
        )}" fill="none" stroke="${ring}" stroke-width="${stroke.toFixed(2)}"/>`
      : ""
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>${gradientDefs()}</defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="${background}"/>
  ${ringRect}
  ${markGroup({ height: size * markRatio, cx: size / 2, cy: size / 2 })}
</svg>`
}

/** Horizontal mark + wordmark lock-up on a rounded backing. */
function lockup({ width, height, background, ring, ink }) {
  const tile = height * 0.62
  const tileX = height * 0.19
  const tileY = (height - tile) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>${gradientDefs()}</defs>
  <rect width="${width}" height="${height}" rx="${height * 0.22}" fill="${background}"/>
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="${height * 0.22 - 1}" fill="none" stroke="${ring}" stroke-width="2"/>
  <rect x="${tileX}" y="${tileY}" width="${tile}" height="${tile}" rx="${tile * 0.24}" fill="${background}" stroke="${ring}" stroke-width="2"/>
  ${markGroup({ height: tile * 0.58, cx: tileX + tile / 2, cy: tileY + tile / 2 })}
  <text x="${tileX + tile + height * 0.2}" y="${height / 2}" font-family="${FONT}" font-size="${height * 0.38}" font-weight="600" fill="${ink}" dominant-baseline="central">ensage</text>
</svg>`
}

function ogSvg() {
  const width = 1200
  const height = 630
  const tile = 132
  const tileX = 96
  const tileY = 128
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    ${gradientDefs()}
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(300 180) scale(820 620)">
      <stop stop-color="${COLORS.brand}" stop-opacity="0.30"/>
      <stop offset="1" stop-color="${COLORS.brand}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="${COLORS.ogBackground}"/>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>
  <rect x="${tileX}" y="${tileY}" width="${tile}" height="${tile}" rx="${tile * 0.24}" fill="#100e0b" stroke="${COLORS.darkRing}" stroke-width="2"/>
  ${markGroup({ height: tile * 0.58, cx: tileX + tile / 2, cy: tileY + tile / 2 })}
  <text x="${tileX + tile + 36}" y="${tileY + tile / 2}" font-family="${FONT}" font-size="96" font-weight="600" fill="${COLORS.ink}" dominant-baseline="central">ensage</text>
  <text x="96" y="404" font-family="${FONT}" font-size="44" fill="${COLORS.ink}">Self-hosted sharing for text, files, and links.</text>
  <text x="96" y="470" font-family="${FONT}" font-size="34" fill="${COLORS.muted}">Collections · expiration · access control · a CLI that works anywhere.</text>
  <rect x="96" y="530" width="${width - 192}" height="2" fill="#2b2620"/>
  <text x="96" y="580" font-family="${FONT}" font-size="30" fill="${COLORS.muted}">ensage.shftln.com</text>
  <text x="${width - 96}" y="580" text-anchor="end" font-family="${FONT}" font-size="30" fill="${COLORS.brand}">Private by design</text>
</svg>`
}

/** The adaptive favicon: white backing in light mode, dark backing in dark mode. */
function adaptiveIconSvg() {
  const size = 512
  const radius = 112
  const stroke = 10
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    ${gradientDefs()}
    <style>
      .tile { fill: ${COLORS.lightTile}; }
      .ring { stroke: ${COLORS.lightRing}; }
      @media (prefers-color-scheme: dark) {
        .tile { fill: ${COLORS.darkTile}; }
        .ring { stroke: ${COLORS.darkRing}; }
      }
    </style>
  </defs>
  <rect class="tile" width="${size}" height="${size}" rx="${radius}"/>
  <rect class="ring" x="${stroke / 2}" y="${stroke / 2}" width="${size - stroke}" height="${size - stroke}" rx="${radius - stroke / 2}" fill="none" stroke-width="${stroke}"/>
  ${markGroup({ height: size * 0.6, cx: size / 2, cy: size / 2 })}
</svg>`
}

async function png(svg, out) {
  await mkdir(dirname(out), { recursive: true })
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out)
  console.log("png ", out.replace(`${root}/`, ""))
}

async function svgFile(svg, out) {
  await mkdir(dirname(out), { recursive: true })
  await writeFile(out, `${svg.trim()}\n`)
  console.log("svg ", out.replace(`${root}/`, ""))
}

/** Pack PNGs into an .ico (ICO supports embedded PNG frames). */
function packIco(frames) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(frames.length, 4)
  const directory = []
  let offset = 6 + 16 * frames.length
  for (const { size, buffer } of frames) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0)
    entry.writeUInt8(size >= 256 ? 0 : size, 1)
    entry.writeUInt8(0, 2) // palette
    entry.writeUInt8(0, 3) // reserved
    entry.writeUInt16LE(1, 4) // color planes
    entry.writeUInt16LE(32, 6) // bits per pixel
    entry.writeUInt32LE(buffer.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += buffer.length
    directory.push(entry)
  }
  return Buffer.concat([header, ...directory, ...frames.map((f) => f.buffer)])
}

async function main() {
  // Favicon (modern browsers get the adaptive SVG, the rest the .ico).
  await svgFile(adaptiveIconSvg(), join(root, "app/icon.svg"))

  const icoFrames = []
  for (const size of [16, 32, 48]) {
    const buffer = await sharp(
      Buffer.from(
        tileIcon({
          size,
          background: COLORS.darkTile,
          ring: COLORS.darkRing,
          markRatio: 0.64,
        })
      )
    )
      .png()
      .toBuffer()
    icoFrames.push({ size, buffer })
  }
  await writeFile(join(root, "app/favicon.ico"), packIco(icoFrames))
  console.log("ico  app/favicon.ico")

  // Apple touch icon (iOS masks the corners itself, so keep it full-bleed).
  await png(
    tileIcon({
      size: 180,
      background: COLORS.darkTile,
      ring: COLORS.darkRing,
      radius: 0,
      markRatio: 0.58,
    }),
    join(root, "app/apple-icon.png")
  )

  // Web app manifest icons.
  await png(
    tileIcon({ size: 192, background: COLORS.darkTile, ring: COLORS.darkRing }),
    join(root, "public/pwa-192.png")
  )
  await png(
    tileIcon({ size: 512, background: COLORS.darkTile, ring: COLORS.darkRing }),
    join(root, "public/pwa-512.png")
  )
  await png(
    tileIcon({
      size: 512,
      background: COLORS.darkTile,
      ring: COLORS.darkRing,
      radius: 0,
      markRatio: 0.5,
    }),
    join(root, "public/pwa-maskable-512.png")
  )

  // Social preview.
  await png(ogSvg(), join(root, "public/og.png"))

  // Reusable lock-ups (also handy in the README).
  await svgFile(
    lockup({
      width: 640,
      height: 180,
      background: COLORS.lightTile,
      ring: COLORS.lightRing,
      ink: "#1c1917",
    }),
    join(root, "public/brand/logo-light.svg")
  )
  await svgFile(
    lockup({
      width: 640,
      height: 180,
      background: COLORS.darkTile,
      ring: COLORS.darkRing,
      ink: COLORS.ink,
    }),
    join(root, "public/brand/logo-dark.svg")
  )
  await svgFile(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${MARK_W}" height="${MARK_H}" viewBox="0 0 ${MARK_W} ${MARK_H}">
  <defs>${gradientDefs()}</defs>
  <path d="${MARK_PATH}" fill="url(#brand)"/>
</svg>`,
    join(root, "public/brand/mark.svg")
  )
}

await main()
