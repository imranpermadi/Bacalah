const fs = require('fs');

const buf = fs.readFileSync('test-slim.apk');
// Look for End of Central Directory record (0x06054b50)
let eocdOffset = -1;
for (let i = buf.length - 22; i >= 0; i--) {
  if (buf.readUInt32LE(i) === 0x06054b50) {
    eocdOffset = i;
    break;
  }
}

if (eocdOffset === -1) {
  console.log('EOCD not found');
  process.exit(1);
}

const cdOffset = buf.readUInt32LE(eocdOffset + 16);
const cdCount = buf.readUInt16LE(eocdOffset + 10);

console.log('Total entries:', cdCount);
let pos = cdOffset;
const libEntries = [];
let hasManifest = false;

for (let i = 0; i < cdCount; i++) {
  if (buf.readUInt32LE(pos) !== 0x02014b50) break;
  const nameLen = buf.readUInt16LE(pos + 28);
  const extraLen = buf.readUInt16LE(pos + 30);
  const commentLen = buf.readUInt16LE(pos + 32);
  const name = buf.toString('utf8', pos + 46, pos + 46 + nameLen);
  if (name === 'AndroidManifest.xml') hasManifest = true;
  if (name.startsWith('lib/')) libEntries.push(name);
  pos += 46 + nameLen + extraLen + commentLen;
}

console.log('Has AndroidManifest.xml:', hasManifest);
const abis = [...new Set(libEntries.map(e => e.split('/')[1]))];
console.log('ABIs present in APK:', abis);
console.log('Sample lib entries:', libEntries.slice(0, 10));

