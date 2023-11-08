'use strict'
let gBoard
let gLevel = {
  SIZE: 8,
  MINES: 14,
}

const MINE = '💣'
const EXPLOSION = '💥'
const EMPTY = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
const MARK = '🚩'

let gGame = { isOn: false, shownCount: 0, markedCount: 0, SecsPassed: 0 }

function onInit() {
  // onInit() This is called when page loads
  gGame.isOn = true
  gBoard = buildBoard()
  setMinesNegsCount(gBoard)
  renderBoard(gBoard)
  renderCounters()
}

function buildBoard() {
  // Builds the board, Set the mines, Call setMinesNegsCount, Return new board

  let board = []
  for (let i = 0; i < gLevel.SIZE; i++) {
    board[i] = []
    for (let j = 0; j < gLevel.SIZE; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
        hasExploded: false,
      }
    }
  }

  board = addRandomMines(board)

  //   board[1][3].isMine = true
  //   board[2][2].isMine = true
  return board
}

function addRandomMines(board) {
  console.log('hi')
  let randRowIdx = getRandomInt(0, gLevel.SIZE)
  let randColIdx = getRandomInt(0, gLevel.SIZE)
  for (let i = 0; i < gLevel.MINES; i++) {
    let currCell = board[randRowIdx][randColIdx]
    while (currCell.isMine) {
      randRowIdx = getRandomInt(0, gLevel.SIZE)
      randColIdx = getRandomInt(0, gLevel.SIZE)
      currCell = board[randRowIdx][randColIdx]
    }
    currCell.isMine = true
  }

  return board
}

function renderBoard(board) {
  let htmlStr = ''
  let color = ''
  let classStr = ''

  for (let i = 0; i < board.length; i++) {
    htmlStr += '<tr>'
    for (let j = 0; j < board[i].length; j++) {
      let currCell = board[i][j]
      let cellContent = EMPTY

      if (currCell.isShown) {
        classStr = 'class="shown"'
        cellContent = currCell.isMine ? MINE : currCell.minesAroundCount
        if (currCell.minesAroundCount === 0) cellContent = EMPTY
      }
      if (currCell.hasExploded) cellContent = EXPLOSION

      color = getColorForNegs(currCell.minesAroundCount)

      let colorStr = `style="color: ${color}"`
      htmlStr += `<td ${classStr} ${colorStr} onclick="onCellClicked(this, ${i}, ${j})" oncontextmenu="onCellMarked(this, event, ${i}, ${j})">${cellContent}</td>`
    }
    htmlStr += '</tr>'
  }
  const elTBody = document.querySelector('tbody')
  elTBody.innerHTML = htmlStr
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

function onCellClicked(elCell, i, j) {
  //   console.log('Cell clicked')
  const currCell = gBoard[i][j]
  if (currCell.isShown) return // Ignore clicks on a Shown cell

  if (currCell.isMine) {
    // Game over
    currCell.hasExploded = true // Update Model
    gGame.isOn = false
    revealAllCells(gBoard)
    elCell.innerHTML = EXPLOSION // Update DOM
    elCell.style.backgroundColor = 'red'
  } else {
    // A non-mine cell was clicked
    currCell.isShown = true // Update Model
    gGame.shownCount++
    renderCounters()
    // console.log('gGame.shownCount:', gGame.shownCount)
    if (currCell.minesAroundCount > 0)
      elCell.innerText = currCell.minesAroundCount // Update DOM
    elCell.classList.add('shown')
    checkVictory()
  }
}

function onCellMarked(elCell, ev, i, j) {
  const currCell = gBoard[i][j]
  ev.preventDefault() // Prevent the default context menu from appearing

  if (currCell.isShown) return // Ignore attempts to mark a Shown cell

  if (currCell.isMarked) {
    // Remove a Mark from an already Marked cell and update counters
    currCell.isMarked = false // Update Model
    gGame.markedCount--
    elCell.innerHTML = EMPTY // Update DOM
    renderCounters()
    return
  }

  // If we reached this line, it means the cell is NOT marked & NOT shown, so we mark it, update counters and checkVictory
  //   console.log('Marked Cell!')
  currCell.isMarked = true // Update Model
  elCell.innerText = MARK // Update DOM
  gGame.markedCount++
  renderCounters()
  checkVictory()
}

function checkVictory() {
  //Game ends when all mines are marked, and all the other cells are shown

  if (gGame.markedCount + gGame.shownCount === gBoard.length ** 2) {
    console.log('victory!!!')
    return true
  }
  return false
}

function renderCounters() {
  const elShownCount = document.querySelector('.shown-count')
  const elMarkedCount = document.querySelector('.marked-count')
  //   console.log('Render Counters - gGame.shownCount:', gGame.shownCount)
  //   console.log('Render Counters - gGame.markedCount:', gGame.markedCount)
  elShownCount.querySelector('span').innerText = gGame.shownCount
  elMarkedCount.querySelector('span').innerText = gGame.markedCount
}

function revealAllCells(board) {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      // Model - Set each cell to shown
      board[i][j].isShown = true
    }
  }
  // DOM - After updating the model, re-render the board to show the changes
  renderBoard(board)
}

function expandShown(board, elCell, i, j) {}

function setMinesNegsCount(board) {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      let countNegs = countNegsWithMines(board, i, j)
      board[i][j].minesAroundCount = countNegs
    }
  }
}

function countNegsWithMines(board, rowIdx, colIdx) {
  var count = 0

  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (i === rowIdx && j === colIdx) continue
      if (j < 0 || j >= board[0].length) continue
      var currCell = board[i][j]
      if (currCell.isMine) {
        count++
      }
    }
  }
  return count
}
