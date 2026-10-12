import { useState, useCallback, useRef } from 'react'

// Face colors: white (U), yellow (D), green (F), blue (B), red (R), orange (L)
const COLORS = {
  U: '#ffffff', // pure white - top
  D: '#ffff00', // yellow - bottom
  F: '#00ff00', // green - front
  B: '#0000ff', // blue - back
  R: '#ff0000', // red - right
  L: '#ff8c00', // orange - left
  X: '#1a1a1a', // black - internal faces
}

// Create initial solved cube state
// Each cubie has position (x, y, z) and face colors
function createSolvedCube() {
  const cubies = []

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        // Skip center cubie (not visible)
        if (x === 0 && y === 0 && z === 0) continue

        const cubie = {
          position: [x, y, z],
          // Face colors: [+x, -x, +y, -y, +z, -z] = [R, L, U, D, F, B]
          colors: [
            x === 1 ? COLORS.R : COLORS.X,  // +x (right)
            x === -1 ? COLORS.L : COLORS.X, // -x (left)
            y === 1 ? COLORS.U : COLORS.X,  // +y (up)
            y === -1 ? COLORS.D : COLORS.X, // -y (down)
            z === 1 ? COLORS.F : COLORS.X,  // +z (front)
            z === -1 ? COLORS.B : COLORS.X, // -z (back)
          ],
        }
        cubies.push(cubie)
      }
    }
  }

  return cubies
}

// Rotate a point around an axis
function rotatePoint(point, axis, angle) {
  const [x, y, z] = point
  const rad = (angle * Math.PI) / 180
  const cos = Math.round(Math.cos(rad))
  const sin = Math.round(Math.sin(rad))

  switch (axis) {
    case 'x':
      return [x, y * cos - z * sin, y * sin + z * cos]
    case 'y':
      return [x * cos + z * sin, y, -x * sin + z * cos]
    case 'z':
      return [x * cos - y * sin, x * sin + y * cos, z]
    default:
      return point
  }
}

// Rotate face colors when cubie rotates
// Each 90° CCW rotation (positive angle) cycles the face colors
function rotateColors(colors, axis, angle) {
  // colors: [+x, -x, +y, -y, +z, -z]
  const times = ((angle / 90) % 4 + 4) % 4

  let result = [...colors]
  for (let i = 0; i < times; i++) {
    const [rpx, rnx, rpy, rny, rpz, rnz] = result
    switch (axis) {
      case 'x':
        // Around x-axis: +y→+z, +z→-y, -y→-z, -z→+y
        result = [rpx, rnx, rnz, rpz, rpy, rny]
        break
      case 'y':
        // Around y-axis: +z→+x, +x→-z, -z→-x, -x→+z
        result = [rpz, rnz, rpy, rny, rnx, rpx]
        break
      case 'z':
        // Around z-axis: -y→+x, +x→+y, +y→-x, -x→-y
        result = [rny, rpy, rpx, rnx, rpz, rnz]
        break
    }
  }
  return result
}

// Move definitions: which cubies to rotate and how
const MOVES = {
  R: { axis: 'x', layer: 1, angle: -90 },
  "R'": { axis: 'x', layer: 1, angle: 90 },
  L: { axis: 'x', layer: -1, angle: 90 },
  "L'": { axis: 'x', layer: -1, angle: -90 },
  U: { axis: 'y', layer: 1, angle: -90 },
  "U'": { axis: 'y', layer: 1, angle: 90 },
  D: { axis: 'y', layer: -1, angle: 90 },
  "D'": { axis: 'y', layer: -1, angle: -90 },
  F: { axis: 'z', layer: 1, angle: -90 },
  "F'": { axis: 'z', layer: 1, angle: 90 },
  B: { axis: 'z', layer: -1, angle: 90 },
  "B'": { axis: 'z', layer: -1, angle: -90 },
}

export function useRubiksCube() {
  const [cubies, setCubies] = useState(createSolvedCube)
  const [animating, setAnimating] = useState(null) // { axis, layer, angle, progress }
  const animationRef = useRef(null)

  const applyMove = useCallback((moveName) => {
    const move = MOVES[moveName]
    if (!move) return

    setCubies(prevCubies => {
      return prevCubies.map(cubie => {
        const [x, y, z] = cubie.position
        const axisIndex = { x: 0, y: 1, z: 2 }[move.axis]

        // Check if this cubie is in the rotating layer
        if (cubie.position[axisIndex] !== move.layer) {
          return cubie
        }

        // Rotate position and colors
        const newPosition = rotatePoint(cubie.position, move.axis, move.angle)
        const newColors = rotateColors(cubie.colors, move.axis, move.angle)

        return {
          position: newPosition,
          colors: newColors,
        }
      })
    })
  }, [])

  const executeMove = useCallback((moveName) => {
    if (animating) return

    const move = MOVES[moveName]
    if (!move) return

    // Start animation
    setAnimating({
      axis: move.axis,
      layer: move.layer,
      targetAngle: move.angle,
      currentAngle: 0,
    })

    const duration = 200 // ms
    const startTime = performance.now()

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3)
      const currentAngle = move.angle * eased

      setAnimating(prev => prev ? { ...prev, currentAngle } : null)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Animation complete, apply the move to state
        applyMove(moveName)
        setAnimating(null)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [animating, applyMove])

  const shuffle = useCallback(() => {
    if (animating) return

    const moveNames = Object.keys(MOVES)
    let newCubies = [...cubies]

    // Apply 20 random moves instantly
    for (let i = 0; i < 20; i++) {
      const randomMove = moveNames[Math.floor(Math.random() * moveNames.length)]
      const move = MOVES[randomMove]

      newCubies = newCubies.map(cubie => {
        const axisIndex = { x: 0, y: 1, z: 2 }[move.axis]

        if (cubie.position[axisIndex] !== move.layer) {
          return cubie
        }

        return {
          position: rotatePoint(cubie.position, move.axis, move.angle),
          colors: rotateColors(cubie.colors, move.axis, move.angle),
        }
      })
    }

    setCubies(newCubies)
  }, [animating, cubies])

  const reset = useCallback(() => {
    if (animating) return
    setCubies(createSolvedCube())
  }, [animating])

  return {
    cubies,
    animating,
    executeMove,
    shuffle,
    reset,
  }
}

export { COLORS, MOVES }
