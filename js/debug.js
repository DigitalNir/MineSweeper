function countActualMinesNotShown(board) {
  let actualMineNotShownCount = 0
  for (let row of board) {
    for (let cell of row) {
      if (cell.isMine && !cell.isShown) {
        actualMineNotShownCount++
      }
    }
  }
  return actualMineNotShownCount
}

function countActualMines(board) {
  let actualMineCount = 0
  for (let row of board) {
    for (let cell of row) {
      if (cell.isMine) {
        actualMineCount++
      }
    }
  }
  return actualMineCount
}
