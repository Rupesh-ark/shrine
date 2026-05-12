import { readFileSync, writeFileSync } from 'fs'
import { WebIO } from '@gltf-transform/core'

const PATH = 'public/models/final_house/Bamboo.glb'

async function main() {
  const io = new WebIO()
  const doc = await io.readBinary(readFileSync(PATH))
  const root = doc.getRoot()

  for (const node of root.listNodes()) {
    const t = node.getTranslation()
    if (t[0] === 0 && t[1] === 0 && t[2] === 0) continue

    console.log(`Fixing node "${node.getName()}": translation [${t.join(', ')}] → [0, 0, 0]`)

    const mesh = node.getMesh()
    if (mesh) {
      for (const prim of mesh.listPrimitives()) {
        const pos = prim.getAttribute('POSITION')
        if (!pos) continue
        for (let i = 0; i < pos.getCount(); i++) {
          const x = pos.getScalar(i * 3) + t[0]
          const y = pos.getScalar(i * 3 + 1) + t[1]
          const z = pos.getScalar(i * 3 + 2) + t[2]
          pos.setScalar(i * 3, x)
          pos.setScalar(i * 3 + 1, y)
          pos.setScalar(i * 3 + 2, z)
        }
      }
      console.log(`  Baked translation into mesh geometry`)
    }

    node.setTranslation([0, 0, 0])
  }

  const out = await io.writeBinary(doc)
  writeFileSync(PATH, out)
  console.log(`Written: ${PATH}`)
}

main().catch(console.error)
