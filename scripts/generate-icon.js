const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function makePng(width, height, r, g, b) {
  // Raw RGBA buffer with filter byte 0 at start of each scanline
  const rowSize = 1 + width * 4;
  const raw = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    raw[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      // Circular badge in center
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < width * 0.42) {
        raw[pxOffset] = r;     // R
        raw[pxOffset + 1] = g; // G
        raw[pxOffset + 2] = b; // B
        raw[pxOffset + 3] = 255;
      } else {
        raw[pxOffset] = 255;   // Background
        raw[pxOffset + 1] = 249;
        raw[pxOffset + 2] = 232;
        raw[pxOffset + 3] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(raw);

  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    // Simple CRC32
    const toCrc = Buffer.concat([typeBuf, data]);
    let c = 0xffffffff;
    for (let i = 0; i < toCrc.length; i++) {
      c ^= toCrc[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
      }
    }
    crc.writeUInt32BE((c ^ 0xffffffff) >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crc]);
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk]);
}

const assetsDir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(assetsDir, { recursive: true });

// Warm sunny yellow badge
const iconBuf = makePng(512, 512, 255, 217, 61);
fs.writeFileSync(path.join(assetsDir, 'icon.png'), iconBuf);
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), iconBuf);
console.log('Icon PNG berhasil dibuat di assets/icon.png dan assets/adaptive-icon.png');

