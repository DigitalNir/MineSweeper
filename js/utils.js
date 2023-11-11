function revealAllCells(board) {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      // Model - Set each cell to shown
      let currCell = board[i][j]
      currCell.isShown = true
    }
  }
  // DOM - After updating the model, re-render the board to show the changes
  renderBoard(board)
}

function expandShown(board, elCell, i, j) {
  const negsLocs = getNegsWithoutItems(board, i, j)
  console.log(negsLocs)
  for (let negLoc of negsLocs) {
    const currCell = board[negLoc.i][negLoc.j]
    currCell.isShown = true
    gGame.shownCount++

    console.log('currCell:', currCell)
    const selector = `[data-i="${negLoc.i}"][data-j="${negLoc.j}"]`
    console.log(selector)
    const elNeg = document.querySelector(selector)
    elNeg.classList.add('shown')
  }
}

function hideSomeCells(board, elCell, i, j) {
  const negsLoc = getNegsWithoutItems(board, i, j)

  // Model - Hide the current cell
  board[i][j].isShown = false
  // gGame.shownCount--

  // DOM - Hide the current cell
  elCell.classList.remove('shown')
  elCell.style.backgroundColor = '#bebebe'
  elCell.isShown = false

  // Model - Set each Neg cell to NOT shown
  console.log('num of negs', negsLoc.length)
  for (let neg of negsLoc) {
    let currCell = board[neg.i][neg.j]
    currCell.isShown = false
    // gGame.shownCount--
    const selector = `[data-i="${neg.i}"][data-j="${neg.j}"]`
    const elNeg = document.querySelector(selector)
    elNeg.classList.remove('shown')
    elNeg.style.backgroundColor = '#bebebe'
  }
  renderBoard(board)
  // DOM - After updating the model, re-render the board to show the changes
  // renderBoard(board)

  for (let neg of negsLoc) {
    const selector = `[data-i="${neg.i}"][data-j="${neg.j}"]`
    const elNeg = document.querySelector(selector)
    elNeg.classList.remove('shown')
    elNeg.style.backgroundColor = '#bebebe'
  }
  renderBoard(board)
}

function revealSomeCells(board, elCell, i, j) {
  const negsLoc = getNegsWithMines(board, i, j)

  // Model - Show the current cell
  board[i][j].isShown = true
  // gGame.shownCount++

  // DOM - Show the current cell
  elCell.classList.add('shown')
  elCell.isShown = true

  for (let neg of negsLoc) {
    // Model - Set each Neg cell to shown

    let currCell = board[neg.i][neg.j]
    currCell.isShown = true
    // gGame.shownCount++
    const selector = `[data-i="${neg.i}"][data-j="${neg.j}"]`
    const elNeg = document.querySelector(selector)
    elNeg.classList.add('shown')
  }

  // DOM - After updating the model, re-render the board to show the changes
  renderBoard(board)
  // renderCounters()
}

function startTimer() {
  gGame.startTime = Date.now()

  clearInterval(gTimerInterval)
  gTimerInterval = 0

  gTimerInterval = setInterval(() => {
    let elaspedTime = Date.now() - gGame.startTime
    const elTimer = document.querySelector('.timer span')
    gGame.secsPassed = parseInt(elaspedTime / 1000) // Update Model
    elTimer.innerHTML = parseInt(elaspedTime / 1000) // Update Dom
  }, 1000)
}

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

function getNegsWithoutItems(board, rowIdx, colIdx) {
  let negsLocs = []

  for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (let j = colIdx - 1; j <= colIdx + 1; j++) {
      if (i === rowIdx && j === colIdx) continue
      if (j < 0 || j >= board[0].length) continue
      let currCell = board[i][j]
      negsLocs.push({ i, j })
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
