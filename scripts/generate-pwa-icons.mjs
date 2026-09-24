import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// High-fidelity Math Genius App Icon SVG
const standardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="50%" stop-color="#312e81" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="50%" stop-color="#ec4899" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#a855f7" stop-opacity="0.2" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Outer Neon Ring Accent -->
  <rect x="20" y="20" width="472" height="472" rx="96" fill="none" stroke="url(#accentGrad)" stroke-width="6" opacity="0.4" />

  <!-- Central Card Tile -->
  <g filter="url(#shadow)">
    <rect x="96" y="96" width="320" height="320" rx="64" fill="#0f172a" stroke="url(#accentGrad)" stroke-width="4" />
  </g>

  <!-- Mathematical Glowing Symbols -->
  <!-- Plus Symbol (Top Left) -->
  <g fill="#38bdf8">
    <rect x="146" y="170" width="40" height="12" rx="6" />
    <rect x="160" y="156" width="12" height="40" rx="6" />
  </g>

  <!-- Multiply Symbol (Top Right) -->
  <g transform="translate(330, 176) rotate(45)" fill="#f43f5e">
    <rect x="-20" y="-6" width="40" height="12" rx="6" />
    <rect x="-6" y="-20" width="12" height="40" rx="6" />
  </g>

  <!-- Divide Symbol (Bottom Left) -->
  <g fill="#34d399">
    <circle cx="166" cy="308" r="6" />
    <rect x="146" y="326" width="40" height="10" rx="5" />
    <circle cx="166" cy="354" r="6" />
  </g>

  <!-- Equals Symbol (Bottom Right) -->
  <g fill="#fbbf24">
    <rect x="310" y="318" width="40" height="10" rx="5" />
    <rect x="310" y="338" width="40" height="10" rx="5" />
  </g>

  <!-- Central Brain / Infinity Emblem -->
  <g transform="translate(256, 256)" filter="url(#shadow)">
    <!-- Infinity loop symbol -->
    <path d="M -54 -24 C -84 -50 -124 -20 -124 16 C -124 52 -84 82 -54 56 C -20 28 20 -28 54 -56 C 84 -82 124 -52 124 -16 C 124 20 84 50 54 24 C 20 -4 -20 -4 -54 -24 Z" 
      fill="none" stroke="url(#accentGrad)" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" />
    
    <!-- Core Bright Spark -->
    <circle cx="0" cy="0" r="16" fill="#fef08a" />
    <polygon points="0,-32 8,-12 32,0 8,12 0,32 -8,12 -32,0 -8,-12" fill="#fbbf24" />
  </g>

  <!-- Crown / Star Accent at the top -->
  <g transform="translate(256, 128)">
    <polygon points="0,-18 5,-5 19,-5 8,4 12,18 0,9 -12,18 -8,4 -19,-5 -5,-5" fill="#facc15" />
  </g>
</svg>`;

// Maskable Icon: has 15% safe margin around the border for Android launcher squircle/circular clipping
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="50%" stop-color="#312e81" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="accentGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="50%" stop-color="#ec4899" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
    <filter id="shadowM" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Full-bleed background extending to edges (mandatory for maskable) -->
  <rect width="512" height="512" fill="url(#bgGradM)" />

  <!-- Inner safe zone (scaled to 78% around center 256,256) -->
  <g transform="translate(256, 256) scale(0.78) translate(-256, -256)">
    <!-- Central Card Tile -->
    <g filter="url(#shadowM)">
      <rect x="96" y="96" width="320" height="320" rx="64" fill="#0f172a" stroke="url(#accentGradM)" stroke-width="5" />
    </g>

    <!-- Math symbols -->
    <g fill="#38bdf8">
      <rect x="146" y="170" width="40" height="12" rx="6" />
      <rect x="160" y="156" width="12" height="40" rx="6" />
    </g>

    <g transform="translate(330, 176) rotate(45)" fill="#f43f5e">
      <rect x="-20" y="-6" width="40" height="12" rx="6" />
      <rect x="-6" y="-20" width="12" height="40" rx="6" />
    </g>

    <g fill="#34d399">
      <circle cx="166" cy="308" r="6" />
      <rect x="146" y="326" width="40" height="10" rx="5" />
      <circle cx="166" cy="354" r="6" />
    </g>

    <g fill="#fbbf24">
      <rect x="310" y="318" width="40" height="10" rx="5" />
      <rect x="310" y="338" width="40" height="10" rx="5" />
    </g>

    <g transform="translate(256, 256)" filter="url(#shadowM)">
      <path d="M -54 -24 C -84 -50 -124 -20 -124 16 C -124 52 -84 82 -54 56 C -20 28 20 -28 54 -56 C 84 -82 124 -52 124 -16 C 124 20 84 50 54 24 C 20 -4 -20 -4 -54 -24 Z" 
        fill="none" stroke="url(#accentGradM)" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" />
      
      <circle cx="0" cy="0" r="16" fill="#fef08a" />
      <polygon points="0,-32 8,-12 32,0 8,12 0,32 -8,12 -32,0 -8,-12" fill="#fbbf24" />
    </g>

    <g transform="translate(256, 128)">
      <polygon points="0,-18 5,-5 19,-5 8,4 12,18 0,9 -12,18 -8,4 -19,-5 -5,-5" fill="#facc15" />
    </g>
  </g>
</svg>`;

async function generate() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Save SVG
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), standardSvg);
  console.log('Saved public/icon.svg');

  // Generate 192x192 PNG
  await sharp(Buffer.from(standardSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Saved public/pwa-192x192.png');

  // Generate 512x512 PNG
  await sharp(Buffer.from(standardSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Saved public/pwa-512x512.png');

  // Generate 512x512 Maskable PNG
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Saved public/pwa-maskable-512x512.png');

  // Generate 180x180 Apple Touch Icon PNG
  await sharp(Buffer.from(standardSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Saved public/apple-touch-icon.png');

  // Generate favicon.png
  await sharp(Buffer.from(standardSvg))
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Saved public/favicon.png');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
