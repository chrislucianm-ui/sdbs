const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '..', 'public', 'logo.jpg');
const publicDir = path.join(__dirname, '..', 'public');

async function generate() {
  try {
    console.log('Generating favicon assets from official school logo...');

    // Generate PNG buffers for ICO
    const png16 = await sharp(logoPath).resize(16, 16).png().toBuffer();
    const png32 = await sharp(logoPath).resize(32, 32).png().toBuffer();
    const png48 = await sharp(logoPath).resize(48, 48).png().toBuffer();

    // Create the ICO file buffer
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // Reserved
    header.writeUInt16LE(1, 2); // Type (1 for Icon)
    header.writeUInt16LE(3, 4); // Number of images (3)

    const entry16 = Buffer.alloc(16);
    entry16.writeUInt8(16, 0); // Width
    entry16.writeUInt8(16, 1); // Height
    entry16.writeUInt8(0, 2); // Colors (0 for >256 colors)
    entry16.writeUInt8(0, 3); // Reserved
    entry16.writeUInt16LE(1, 4); // Planes (1)
    entry16.writeUInt16LE(32, 6); // Bits per pixel (32)
    entry16.writeUInt32LE(png16.length, 8); // Image size
    entry16.writeUInt32LE(54, 12); // Image offset

    const entry32 = Buffer.alloc(16);
    entry32.writeUInt8(32, 0);
    entry32.writeUInt8(32, 1);
    entry32.writeUInt8(0, 2);
    entry32.writeUInt8(0, 3);
    entry32.writeUInt16LE(1, 4);
    entry32.writeUInt16LE(32, 6);
    entry32.writeUInt32LE(png32.length, 8);
    entry32.writeUInt32LE(54 + png16.length, 12);

    const entry48 = Buffer.alloc(16);
    entry48.writeUInt8(48, 0);
    entry48.writeUInt8(48, 1);
    entry48.writeUInt8(0, 2);
    entry48.writeUInt8(0, 3);
    entry48.writeUInt16LE(1, 4);
    entry48.writeUInt16LE(32, 6);
    entry48.writeUInt32LE(png48.length, 8);
    entry48.writeUInt32LE(54 + png16.length + png32.length, 12);

    const icoBuffer = Buffer.concat([
      header,
      entry16,
      entry32,
      entry48,
      png16,
      png32,
      png48
    ]);

    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
    console.log('Generated favicon.ico (multi-resolution 16x16, 32x32, 48x48)');

    // Generate icon.png (192x192)
    await sharp(logoPath)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'icon.png'));
    console.log('Generated icon.png (192x192)');

    // Generate apple-touch-icon.png (180x180)
    await sharp(logoPath)
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('Generated apple-touch-icon.png (180x180)');

    // Generate icon-512.png (512x512)
    await sharp(logoPath)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));
    console.log('Generated icon-512.png (512x512)');

    console.log('Icon generation completed successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generate();
