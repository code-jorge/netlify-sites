import { useState } from "react"
import Board from "../components/Board";
import TilesMetric from "../components/TilesMetric";
import MovesMetric from "../components/MovesMetric";
import { flipTiles, generateBoard } from "../utils/game";

const SiteBuildGame = () => {

  const [board, setBoard] = useState(generateBoard())
  const [moves, setMoves] = useState(0)

  const isGameWon = board.flat().every(Boolean)

  const currentScore = board.flat().filter(Boolean).length
  const maxScore = board.flat().length

  const handleClick = (rowIndex: number, colIndex: number) => {
    if (isGameWon) return
    flipTiles(board, rowIndex, colIndex)
    setBoard([...board])
    setMoves(moves + 1)
  }

  return (
    <div>
      <div className="tw-text-md tw-mb-4">
        <div className="tw-grid tw-gap-4 tw-grid-cols-2">
          <TilesMetric value={currentScore} max={maxScore} />
          <MovesMetric moves={moves} />
        </div>
        <Board 
          board={board} 
          onClick={handleClick}
        />
      </div>
    </div>
  )
}

export default SiteBuildGame;