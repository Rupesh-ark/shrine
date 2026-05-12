import fs from 'fs';

const PATH = 'public/models/table/table_with_cusions.glb';
const buf = fs.readFileSync(PATH);

const jsonLen = buf.readUInt32LE(12);
const jsonStr = buf.slice(20, 20 + jsonLen).toString('utf8');
const json = JSON.parse(jsonStr);

const binOffset = 20 + jsonLen;
const binLen = buf.readUInt32LE(binOffset);
const binChunk = buf.slice(binOffset, binOffset + 8 + binLen);

// Modify material 4 (fabric on cushions)
const mat = json.materials[4];
if (mat) {
  delete mat.pbrMetallicRoughness.baseColorTexture;
  mat.pbrMetallicRoughness.baseColorFactor = [0.404, 0.005, 0.005, 1.0];
  mat.pbrMetallicRoughness.metallicFactor = 0.0;
  mat.pbrMetallicRoughness.roughnessFactor = 0.88;
  mat.name = 'fabric_blood';
  console.log('Updated material:', mat.name);
}

const newJsonStr = JSON.stringify(json);
const newJsonBuf = Buffer.from(newJsonStr, 'utf8');

// Pad to 4-byte alignment
const pad = (4 - (newJsonBuf.length % 4)) % 4;
const paddedJsonLen = newJsonBuf.length + pad;

const newBuf = Buffer.alloc(20 + paddedJsonLen + binChunk.length);

// Header
newBuf.write('glTF', 0);
newBuf.writeUInt32LE(2, 4);
newBuf.writeUInt32LE(newBuf.length, 8);

// JSON chunk
newBuf.writeUInt32LE(paddedJsonLen, 12);
newBuf.writeUInt32LE(0x4E4F534A, 16);
newJsonBuf.copy(newBuf, 20);
for (let i = 0; i < pad; i++) {
  newBuf[20 + newJsonBuf.length + i] = 0x20; // space padding
}

// BIN chunk
binChunk.copy(newBuf, 20 + paddedJsonLen);

fs.writeFileSync(PATH, newBuf);
console.log('Wrote modified GLB. Old JSON:', jsonLen, 'New JSON:', paddedJsonLen);
