const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '..', 'public', 'logo.jpg');
const publicDir = path.join(__dirname, '..', 'public');

async function generate() {
  try {
    console.log('Generating favicon assets from official school logo...');

    // 16x16
    await sharp(logoPath)
      .resize(16, 16)
      .png()
      .toFile(path.join(publicDir, 'favicon-16x16.png'));
    console.log('Generated favicon-16x16.png');

    // 32x32
    await sharp(logoPath)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'));
    console.log('Generated favicon-32x32.png');

    // 48x48 (Google Search preferred size)
    await sharp(logoPath)
      .resize(48, 48)
      .png()
      .toFile(path.join(publicDir, 'favicon-48x48.png'));
    console.log('Generated favicon-48x48.png');

    // 180x180 (Apple touch icon)
    await sharp(logoPath)
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('Generated apple-touch-icon.png');

    // 512x512 (Android/web manifest icon)
    await sharp(logoPath)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'android-chrome-512x512.png'));
    console.log('Generated android-chrome-512x512.png');

    // generate favicon.ico
    const pngBuf = await sharp(logoPath).resize(48, 48).png().toBuffer();
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), pngBuf);
    console.log('Generated favicon.ico (48x48 PNG format)');

    console.log('Icon generation completed successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generate();
