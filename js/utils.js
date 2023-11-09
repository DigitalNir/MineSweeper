function getNegsWithoutItems(board, rowIdx, colIdx) {
  let negsLocs = []

  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (i === rowIdx && j === colIdx) continue
      if (j < 0 || j >= board[0].length) continue
      var currCell = board[i][j]
      if (!currCell.isMine && !currCell.isMarked && !currCell.isShown) {
        negsLocs.push({ i, j })
      }
    }
  }
  return negsLocs
}

function getNegsWithMines(board, rowIdx, colIdx) {
  let negsLocs = []

  for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (let j = colIdx - 1; j <= colIdx + 1; j++) {
      if (i === rowIdx && j === colIdx) continue
      if (j < 0 || j >= board[0].length) continue
      let currCell = board[i][j]
      if (currCell.isMine) {
        negsLocs.push({ i, j })
      }
    }
  }
  return negsLocs
}

function setMinesNegsCount(board) {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      let countNegs = getNegsWithMines(board, i, j).length
      board[i][j].minesAroundCount = countNegs
    }
  }
}

function getColorForNegs(minesAroundCount) {
  let color = ''
  switch (minesAroundCount) {
    case 1:
      color = 'blue'
      break
    case 2:
      color = 'green'
      break
    case 3:
      color = 'red'
      break
    case 4:
      color = 'darkblue'
      break
    case 5:
      color = 'maroon'
      break
    case 6:
      color = 'turquoise'
      break
    case 7:
      color = 'black'
      break
    case 8:
      color = 'gray'
      break
  }
  return color
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1) + min) // The maximum is inclusive and the minimum is inclusive
}
