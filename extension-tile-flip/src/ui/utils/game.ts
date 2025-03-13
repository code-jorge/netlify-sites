export const generateBoard = ()=> {
  const size = 5;
  const board = Array(size).fill(null).map(() => Array(size).fill(false))
  for (let i=0; i<size*size; i++) {
    if (Math.random() > 0.5) {
      flipTiles(board, Math.floor(i/size), i%size)
    }
  }
  return board
}

export const flipTiles = (board: boolean[][], row: number, col: number)=> {
  const size = board.length
  board[row][col] = !board[row][col]
  if (row > 0) board[row - 1][col] = !board[row - 1][col]
  if (row < size - 1) board[row + 1][col] = !board[row + 1][col]
  if (col > 0) board[row][col - 1] = !board[row][col - 1]
  if (col < size - 1) board[row][col + 1] = !board[row][col + 1]
}

