const fs = require('fs');

const buf = fs.readFileSync('test-slim.apk');
let eocdOffset = -1;
for (let i = buf.length - 22; i >= 0; i--) {
  if (buf.readUInt32LE(i) === 0x06054b50) { eocdOffset = i; break; }
}
const cdOffset = buf.readUInt32LE(eocdOffset + 16);
const cdCount = buf.readUInt16LE(eocdOffset + 10);
let pos = cdOffset;
let manifestLocalHeaderOffset = -1;

for (let i = 0; i < cdCount; i++) {
  const nameLen = buf.readUInt16LE(pos + 28);
  const extraLen = buf.readUInt16LE(pos + 30);
  const commentLen = buf.readUInt16LE(pos + 32);
  const name = buf.toString('utf8', pos + 46, pos + 46 + nameLen);
  if (name === 'AndroidManifest.xml') {
    manifestLocalHeaderOffset = buf.readUInt32LE(pos + 42);
    break;
  }
  pos += 46 + nameLen + extraLen + commentLen;
}

// Read local header
const lhNameLen = buf.readUInt16LE(manifestLocalHeaderOffset + 26);
const lhExtraLen = buf.readUInt16LE(manifestLocalHeaderOffset + 28);
const compMethod = buf.readUInt16LE(manifestLocalHeaderOffset + 8);
const compSize = buf.readUInt32LE(manifestLocalHeaderOffset + 18);
const dataOffset = manifestLocalHeaderOffset + 30 + lhNameLen + lhExtraLen;
const compData = buf.subarray(dataOffset, dataOffset + compSize);

const zlib = require('zlib');
const manifestBuf = compMethod === 8 ? zlib.inflateRawSync(compData) : compData;

// In Android Binary XML: string pool starts at offset 8
const stringCount = manifestBuf.readUInt32LE(16);
const stringsStart = 8 + manifestBuf.readUInt32LE(28);
console.log('Manifest string count:', stringCount);

// Extract strings from binary xml
const strings = [];
let strPos = stringsStart;
while (strPos < manifestBuf.length && strings.length < stringCount) {
  const len = manifestBuf.readUInt16LE(strPos);
  if (len === 0) {
    strPos += 2;
    continue;
  }
  // Try UTF-16
  const str = manifestBuf.toString('utf16le', strPos + 2, strPos + 2 + len * 2);
  strings.push(str);
  strPos += 2 + len * 2 + 2;
}

console.log('Key manifest strings:', strings.filter(s => s.includes('id.bacalah') || s.includes('version') || s.includes('sdk') || s.includes('Activity') || s.includes('permission')));

