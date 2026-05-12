import { NodeIO } from '@gltf-transform/core';
import { KHRDracoMeshCompression } from '@gltf-transform/extensions';
import draco3d from 'draco3d';

const io = new NodeIO().registerExtensions([KHRDracoMeshCompression]);
const doc = await io.read('public/models/table/table_with_cusions.glb');

const targetMeshes = ['Line35', 'Line35001', 'Line35002', 'Line35003'];
const root = doc.getRoot();
const meshes = root.listMeshes();

console.log('Meshes in file:');
for (const mesh of meshes) {
  console.log(`  ${mesh.getName()} — primitives: ${mesh.listPrimitives().length}`);
}

// Find which materials are used by target meshes
const materialsToChange = new Set();
for (const mesh of meshes) {
  if (targetMeshes.includes(mesh.getName())) {
    for (const prim of mesh.listPrimitives()) {
      const mat = prim.getMaterial();
      if (mat) {
        materialsToChange.add(mat);
        console.log(`Target mesh: ${mesh.getName()} uses material: ${mat.getName() || '(unnamed)'}`);
        console.log('  Current baseColorFactor:', mat.getBaseColorFactor());
      }
    }
  }
}

// Change material to a warm Japanese red
for (const mat of materialsToChange) {
  mat.setBaseColorFactor([0.72, 0.27, 0.24, 1.0]); // #B8443C
  mat.setRoughnessFactor(0.92);
  mat.setMetallicFactor(0.0);
  console.log(`Updated material ${mat.getName() || '(unnamed)'} to #B8443C`);
}

await io.write('public/models/table/table_with_cusions.glb', doc);
console.log('Wrote modified GLB.');
