'use strict'
let gBoard
let gLevels = {
  BEGINNER: { SIZE: 4, MINES: 2 },
  MEDIUM: { SIZE: 8, MINES: 14 },
  EXPERT: { SIZE: 12, MINES: 32 },
}

let gGame = {
  chosenLevel: 'MEDIUM',
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  startTime: 0,
  secsPassed: 0,
  lives: 2,
  isHintOn: false,
  hintStatus: { isHintOn: false, id: 0, elHint: null },
  hasUsedHint: false,
}
let gFirstClickDone = { status: false, pos: { i: 0, j: 0 } }
let gTimerInterval = 0
let gHintTimeout = 0

const MINE = '💣'
const EXPLOSION = '💥'
const MARK = '🚩'

function resetGame() {
  gGame.isOn = false
  clearInterval(gTimerInterval)
  gTimerInterval = 0
  gGame.shownCount = 0
  gGame.markedCount = 0
  gGame.startTime = 0
  gGame.secsPassed = 0
  gGame.lives = 2
  document.querySelector('tbody').classList.remove('disabled-content')
  document.querySelector('.score-modal').classList.add('hidden')
}

function onInit() {
  // onInit() This is called when page loads
  resetGame()

  gGame.isOn = true

  document.querySelector('.btn-smiley').innerText = '😃'

  gBoard = buildBoard()

  // Handle the first click (firstClickDone state is changed to true within the called func addRandomMines)
  if (!gFirstClickDone.status) {
    gBoard = addRandomMines(gBoard, gFirstClickDone.pos)
  }

  setMinesNegsCount(gBoard)
  renderBoard(gBoard)
  renderCounters()
  startTimer()
  document.querySelector('.lives-count span').innerText = gGame.lives
}

function buildBoard() {
  // Builds the board, Set the mines, Call setMinesNegsCount, Return new board

  let board = []
  for (let i = 0; i < gLevels[gGame.chosenLevel].SIZE; i++) {
    board[i] = []
    for (let j = 0; j < gLevels[gGame.chosenLevel].SIZE; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
        hasExploded: false,
      }
    }
  }

  return board
}

function renderBoard(board) {
  let htmlStr = ''
  let color = ''
  let classStr = ''

  // console.log('*** Rendering Board: ***')

  for (let i = 0; i < board.length; i++) {
    htmlStr += '<tr>'
    for (let j = 0; j < board[i].length; j++) {
      let currCell = board[i][j]
      let cellContent = ''

      // Debug: Log the current cell's mine status and coordinates
      console.log(
        `Cell [${i}][${j}] - IsMine: ${currCell.isMine}, IsShown: ${currCell.isShown}, HasExploded: ${currCell.hasExploded}`
      )

      cellContent = currCell.isMine ? MINE : currCell.minesAroundCount

      if (cellContent === 0) cellContent = ''

      if (currCell.isShown) {
        classStr = 'class="shown"'
        if (cellContent === MINE)
          console.log(`cellContent for i=${i} j=${j}:`, cellContent)
      } else {
        cellContent = ''
        console.log(`is not Shown for i=${i} j=${j}:`, currCell.isMine === true)
      }

      if (currCell.hasExploded) cellContent = EXPLOSION

      color = getColorForNegs(currCell.minesAroundCount)

      let colorStr = `style="color: ${color}"`
      htmlStr += `<td data-i="${i}" data-j="${j}" ${classStr} ${colorStr} onclick="onCellClicked(this, ${i}, ${j})" oncontextmenu="onCellMarked(this, event, ${i}, ${j})">${cellContent}</td>`
    }
    htmlStr += '</tr>'
  }
  const elTBody = document.querySelector('tbody')
  elTBody.innerHTML = htmlStr
}

function addRandomMines(board, firstClickPos) {
  let countMinesAdded = 0

  while (countMinesAdded < gLevels[gGame.chosenLevel].MINES) {
    let randRowIdx = getRandomInt(0, gLevels[gGame.chosenLevel].SIZE)
    let randColIdx = getRandomInt(0, gLevels[gGame.chosenLevel].SIZE)
    let currCell = board[randRowIdx][randColIdx]

    if (randRowIdx === firstClickPos.i && randColIdx === firstClickPos.j)
      continue

    if (currCell.isMine) {
      continue
    }
    currCell.isMine = true
    countMinesAdded++
    // console.log('Mine added at: ', randRowIdx, randColIdx)
  }
  return board
}

function blowRandomMines(board, numMinesToBlow) {
  let countMinesBlown = 0

  while (countMinesBlown < numMinesToBlow) {
    let randRowIdx = getRandomInt(0, gLevels[gGame.chosenLevel].SIZE)
    let randColIdx = getRandomInt(0, gLevels[gGame.chosenLevel].SIZE)
    let currCell = board[randRowIdx][randColIdx]

    if (!currCell.isMine) {
      continue
    }

    currCell.isMine = false
    countMinesBlown++
    // console.log('Mine blown at: ', randRowIdx, randColIdx)
  }
  return board
}

function onCellClicked(elCell, i, j) {
  const currCell = gBoard[i][j]

  if (currCell.isShown) return // Ignore clicks on a Shown cell

  if (gGame.hintStatus.isHintOn && gGame.hasUsedHint) return

  if (gGame.hintStatus.isHintOn) {
    clearTimeout(gHintTimeout)
    gHintTimeout = 0
    console.log('Hint mode - Revealing cells ')
    revealSomeCells(gBoard, elCell, i, j)
    gGame.hasUsedHint = true
    gHintTimeout = setTimeout(() => {
      console.log('Hint mode - hiding cells')
      hideSomeCells(gBoard, elCell, i, j)
      gGame.hintStatus.isHintOn = false
      gGame.hasUsedHint = false
      gGame.hintStatus.elHint.style.display = 'none'
    }, 1000)
    return
  }

  if (currCell.isMine) {
    // Clicked on a mine - decrease Lives, increase shownCount and check if GameOver
    gGame.lives--
    gGame.shownCount++
    document.querySelector('.lives-count span').innerText = gGame.lives
    elCell.classList.add('disabled-content')
    currCell.hasExploded = true // Update Model
    elCell.innerHTML = EXPLOSION // Update DOM
    checkGameOver(currCell, elCell)
  } else {
    // A non-mine cell was clicked
    currCell.isShown = true // Update Model

    gGame.shownCount++
    if (currCell.minesAroundCount > 0)
      elCell.innerText = currCell.minesAroundCount // Update DOM
    else {
      expandShown(gBoard, elCell, i, j)
    }
    elCell.classList.add('shown')
    checkVictory()
  }
  renderCounters()
}

function onCellMarked(elCell, ev, i, j) {
  const currCell = gBoard[i][j]
  ev.preventDefault() // Prevent the default context menu from appearing

  if (currCell.isShown) return // Ignore attempts to mark a Shown cell

  if (gGame.hintStatus.isHintOn && gGame.hasUsedHint) return

  if (currCell.isMarked) {
    // Remove a Mark from an already Marked cell and update counters
    currCell.isMarked = false // Update Model
    gGame.markedCount--
    elCell.innerHTML = ''
    renderCounters()
    return
  }

  // If we reached this line, it means the cell is NOT marked & NOT shown, so we mark it, update counters and checkVictory
  currCell.isMarked = true // Update Model
  elCell.innerText = MARK // Update DOM
  gGame.markedCount++
  renderCounters()
  checkVictory()
}

function checkGameOver(currCell, elCell) {
  if (gGame.lives > 0) return // Ignore when the player still has lives left, otherwise proceed to reveal all cells and reset the game

  document.querySelector('.btn-smiley').innerText = '🤯'
  revealAllCells(gBoard)
  resetGame()
}

function checkVictory(elCell) {
  //Game ends when all mines are marked, and all the other cells are shown

  if (gGame.markedCount + gGame.shownCount === gBoard.length ** 2) {
    document.querySelector('.btn-smiley').innerText = '😎'
    handleHighScore()

    // Set the whole tbody to 'disabled content'
    document.querySelector('tbody').classList.add('disabled-content')

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
