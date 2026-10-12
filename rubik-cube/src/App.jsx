import { useState, useRef } from 'react'
import RubiksCube from './components/RubiksCube'
import Controls from './components/Controls'
import { useRubiksCube } from './hooks/useRubiksCube'

export default function App() {
  const { cubies, animating, executeMove, shuffle, reset } = useRubiksCube()
  const [language, setLanguage] = useState('en')
  const cubeRef = useRef()

  const handleResetCamera = () => {
    cubeRef.current?.resetCamera()
  }

  return (
    <div className="app">
      <main className="main">
        <RubiksCube ref={cubeRef} cubies={cubies} animating={animating} />
        <Controls
          onMove={executeMove}
          onShuffle={shuffle}
          onReset={reset}
          onResetCamera={handleResetCamera}
          disabled={!!animating}
          language={language}
          onLanguageChange={setLanguage}
        />
      </main>
    </div>
  )
}
