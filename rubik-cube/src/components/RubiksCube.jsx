import { useMemo, useRef, useImperativeHandle, forwardRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Cubie from './Cubie'

function CubeGroup({ cubies, animating }) {
  const { rotatingCubies, stationaryCubies } = useMemo(() => {
    const rotating = []
    const stationary = []

    const axisIndex = animating ? { x: 0, y: 1, z: 2 }[animating.axis] : null

    cubies.forEach((cubie, index) => {
      const cubieWithIndex = { ...cubie, index }
      if (animating && cubie.position[axisIndex] === animating.layer) {
        rotating.push(cubieWithIndex)
      } else {
        stationary.push(cubieWithIndex)
      }
    })

    return { rotatingCubies: rotating, stationaryCubies: stationary }
  }, [cubies, animating])

  const layerRotation = useMemo(() => {
    if (!animating) return [0, 0, 0]

    const angle = (animating.currentAngle * Math.PI) / 180
    switch (animating.axis) {
      case 'x': return [angle, 0, 0]
      case 'y': return [0, angle, 0]
      case 'z': return [0, 0, angle]
      default: return [0, 0, 0]
    }
  }, [animating])

  return (
    <group>
      {stationaryCubies.map((cubie) => (
        <Cubie
          key={cubie.index}
          position={cubie.position}
          colors={cubie.colors}
        />
      ))}

      <group rotation={layerRotation}>
        {rotatingCubies.map((cubie) => (
          <Cubie
            key={cubie.index}
            position={cubie.position}
            colors={cubie.colors}
          />
        ))}
      </group>
    </group>
  )
}

const DEFAULT_CAMERA_POSITION = [5, 5, 5]

function Scene({ cubies, animating, controlsRef }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={0.8} />
      <directionalLight position={[-10, -10, -10]} intensity={0.4} />

      <CubeGroup cubies={cubies} animating={animating} />

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        minDistance={5}
        maxDistance={15}
      />
    </>
  )
}

const RubiksCube = forwardRef(function RubiksCube({ cubies, animating }, ref) {
  const controlsRef = useRef()
  const cameraRef = useRef()

  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      if (controlsRef.current) {
        controlsRef.current.reset()
      }
    }
  }))

  return (
    <div className="canvas-container">
      <Canvas
        camera={{ position: DEFAULT_CAMERA_POSITION, fov: 50 }}
        style={{ background: '#1a1a2e' }}
        onCreated={({ camera }) => {
          cameraRef.current = camera
        }}
      >
        <Scene cubies={cubies} animating={animating} controlsRef={controlsRef} />
      </Canvas>
    </div>
  )
})

export default RubiksCube
