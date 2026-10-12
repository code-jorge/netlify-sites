import { useMemo } from 'react'
import * as THREE from 'three'

const CUBIE_SIZE = 0.95
const WHITE = '#ffffff'

export default function Cubie({ position, colors }) {
  const [x, y, z] = position

  // Face materials - colors array is [+x, -x, +y, -y, +z, -z]
  // Three.js box face order: [+x, -x, +y, -y, +z, -z]
  const materials = useMemo(() => {
    return colors.map((color, index) => {
      // Add slight emissive to white faces to make them appear brighter
      const isWhite = color === WHITE
      return (
        <meshStandardMaterial
          key={index}
          attach={`material-${index}`}
          color={color}
          emissive={isWhite ? '#333333' : '#000000'}
        />
      )
    })
  }, [colors])

  const edgesGeometry = useMemo(() => {
    return new THREE.EdgesGeometry(new THREE.BoxGeometry(CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE))
  }, [])

  return (
    <group position={[x, y, z]}>
      <mesh>
        <boxGeometry args={[CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE]} />
        {materials}
      </mesh>
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial color="#000000" />
      </lineSegments>
    </group>
  )
}
