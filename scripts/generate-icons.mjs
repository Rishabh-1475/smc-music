import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SOURCE_IMAGE = 'C:/Users/dell/.gemini/antigravity/brain/537aa377-33b2-42d7-bd41-c07c0005bad9/.user_uploaded/media_1795288083998_14190a04.jpg';

const BG_COLOR = { r: 8, g: 8, b: 9, alpha: 1 }; // #080809

async function generateAllIcons() {
  console.log('[IconGenerator] Loading source:', SOURCE_IMAGE);
  if (!fs.existsSync(SOURCE_IMAGE)) {
    throw new Error(`Source image not found: ${SOURCE_IMAGE}`);
  }

  // 1. Create a master 1024x1024 canvas with #080809 background
  // The source is 712x622. Scale it so it fits comfortably within 960x960 (so edge glows blend smoothly).
  const emblemResized = await sharp(SOURCE_IMAGE)
    .resize(960, 840, { fit: 'inside' })
    .toBuffer();

  const master1024Buffer = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: BG_COLOR
    }
  })
    .composite([
      {
        input: emblemResized,
        gravity: 'center'
      }
    ])
    .png()
    .toBuffer();

  // Save master 1024
  const publicDir = path.join(rootDir, 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  const webIcons = [
    { name: 'rythemx-icon-1024.png', size: 1024 },
    { name: 'icon-512.png', size: 512 },
    { name: 'icon-192.png', size: 192 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon.png', size: 64 },
    { name: 'favicon-32x32.png', size: 32 }
  ];

  console.log('[IconGenerator] Generating Web & PWA icons...');
  for (const { name, size } of webIcons) {
    const outPath = path.join(publicDir, name);
    await sharp(master1024Buffer)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(outPath);
    console.log(`  ✓ ${name} (${size}x${size})`);
  }

  // Also remove old favicon.ico files if any
  const staleFavicons = [
    path.join(rootDir, 'src', 'app', 'favicon.ico'),
    path.join(rootDir, 'public', 'favicon.ico')
  ];
  for (const f of staleFavicons) {
    if (fs.existsSync(f)) {
      fs.unlinkSync(f);
      console.log(`  ✓ Removed stale ${f}`);
    }
  }

  // 2. Android Density Buckets
  const androidResDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res');
  const buckets = [
    { dir: 'mipmap-mdpi', launcherSize: 48, fgSize: 108 },
    { dir: 'mipmap-hdpi', launcherSize: 72, fgSize: 162 },
    { dir: 'mipmap-xhdpi', launcherSize: 96, fgSize: 216 },
    { dir: 'mipmap-xxhdpi', launcherSize: 144, fgSize: 324 },
    { dir: 'mipmap-xxxhdpi', launcherSize: 192, fgSize: 432 }
  ];

  console.log('[IconGenerator] Generating Android launcher and adaptive icons...');

  for (const bucket of buckets) {
    const bucketDir = path.join(androidResDir, bucket.dir);
    if (!fs.existsSync(bucketDir)) fs.mkdirSync(bucketDir, { recursive: true });

    // A. ic_launcher.png (Square with small corner radius / full canvas)
    const launcherBuf = await sharp(master1024Buffer)
      .resize(bucket.launcherSize, bucket.launcherSize, { fit: 'cover' })
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(bucketDir, 'ic_launcher.png'), launcherBuf);

    // B. ic_launcher_round.png (Circular mask for round icons)
    const radius = Math.floor(bucket.launcherSize / 2);
    const circleSvg = Buffer.from(
      `<svg width="${bucket.launcherSize}" height="${bucket.launcherSize}">
        <circle cx="${radius}" cy="${radius}" r="${radius}" fill="#ffffff"/>
      </svg>`
    );

    const roundBuf = await sharp(launcherBuf)
      .composite([{ input: circleSvg, blend: 'dest-in' }])
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(bucketDir, 'ic_launcher_round.png'), roundBuf);

    // C. ic_launcher_foreground.png (Safe Zone = ~68% of fgSize)
    const emblemTargetSize = Math.round(bucket.fgSize * 0.68);
    const emblemFg = await sharp(master1024Buffer)
      .resize(emblemTargetSize, emblemTargetSize, { fit: 'contain' })
      .toBuffer();

    const fgBuf = await sharp({
      create: {
        width: bucket.fgSize,
        height: bucket.fgSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent
      }
    })
      .composite([{ input: emblemFg, gravity: 'center' }])
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(bucketDir, 'ic_launcher_foreground.png'), fgBuf);
    console.log(`  ✓ ${bucket.dir}: ic_launcher (${bucket.launcherSize}px), round (${bucket.launcherSize}px), fg (${bucket.fgSize}px with safe zone ${emblemTargetSize}px)`);
  }

  // 3. Update Splash Screens
  console.log('[IconGenerator] Generating splash screens...');
  const splashDirs = [
    { dir: 'drawable', w: 480, h: 800 },
    { dir: 'drawable-land-mdpi', w: 480, h: 320 },
    { dir: 'drawable-land-hdpi', w: 800, h: 480 },
    { dir: 'drawable-land-xhdpi', w: 1280, h: 720 },
    { dir: 'drawable-land-xxhdpi', w: 1600, h: 960 },
    { dir: 'drawable-land-xxxhdpi', w: 1920, h: 1080 },
    { dir: 'drawable-port-mdpi', w: 320, h: 480 },
    { dir: 'drawable-port-hdpi', w: 480, h: 800 },
    { dir: 'drawable-port-xhdpi', w: 720, h: 1280 },
    { dir: 'drawable-port-xxhdpi', w: 960, h: 1600 },
    { dir: 'drawable-port-xxxhdpi', w: 1080, h: 1920 }
  ];

  for (const { dir, w, h } of splashDirs) {
    const targetDir = path.join(androidResDir, dir);
    if (!fs.existsSync(targetDir)) continue;

    const emblemSize = Math.round(Math.min(w, h) * 0.45);
    const emblemSplash = await sharp(master1024Buffer)
      .resize(emblemSize, emblemSize, { fit: 'contain' })
      .toBuffer();

    await sharp({
      create: {
        width: w,
        height: h,
        channels: 4,
        background: BG_COLOR
      }
    })
      .composite([{ input: emblemSplash, gravity: 'center' }])
      .png()
      .toFile(path.join(targetDir, 'splash.png'));
  }
  console.log('  ✓ Updated all Android splash drawables');

  console.log('[IconGenerator] Done! All icons generated cleanly.');
}

generateAllIcons().catch((err) => {
  console.error('[IconGenerator] Error:', err);
  process.exit(1);
});
