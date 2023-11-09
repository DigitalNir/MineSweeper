'use strict'
let gBoard
let gLevels = {
  BEGINNER: { SIZE: 4, MINES: 2 },
  MEDIUM: { SIZE: 8, MINES: 14 },
  EXPERT: { SIZE: 12, MINES: 32 },
}

let gGame = {
  chosenLevel: 'BEGINNER',
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  startTime: 0,
  secsPassed: 0,
  lives: 2,
}
let gFirstClickDone = { status: false, pos: { i: 0, j: 0 } }
let gTimerInterval = 0

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

function onCellClicked(elCell, i, j) {
  const currCell = gBoard[i][j]

  if (currCell.isShown) return // Ignore clicks on a Shown cell

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

function handleHighScore() {
  const elScoreModal = document.querySelector('.score-modal')
  const elScoreModalHeadings = document.querySelectorAll('.score-modal h2 span')

  // console.log('High Score!')
  elScoreModal.classList.remove('hidden')
  elScoreModal.style.display = 'block'
  console.log(elScoreModal)

  // Using a Key Map obj - Key is Level, Value is Score
  // highScore = {EXPERT: 10}
  // highScore = {Beginner: 15}

  const localStorageScoreStr = localStorage.getItem('highScore')
  const parsedJSON = JSON.parse(localStorageScoreStr)

  // Initialize levelScoreMap as an empty object if localStorageHighScoreStr is null
  const levelScoreMap = parsedJSON !== null ? parsedJSON : {}

  // Use nullish coalescing operator (??) to handle null or undefined
  const prevScore = levelScoreMap[gGame.chosenLevel] ?? Infinity

  let msg = ''
  let color = ''

  console.log('prevScore:', prevScore)

  // Check against Infinity because prevScore will never be null at this point
  if (prevScore === Infinity || gGame.secsPassed < prevScore) {
    levelScoreMap[gGame.chosenLevel] = gGame.secsPassed
    const currScore = JSON.stringify(levelScoreMap)
    localStorage.setItem('highScore', currScore)
    console.log(
      `Added currScore: ${currScore}, which is BETTER than prevScore ${prevScore} `
    )

    msg = prevScore === Infinity ? "You're first!" : 'You Rock!'
    color = 'green'
  } else {
    // If we're here it means that gGame.secsPassed is worse than prevScore
    console.log(
      `DID NOT add gGame.secsPassed: ${gGame.secsPassed}, which is WORSE than prevScore ${prevScore} `
    )

    msg = 'You Suck!'
    color = 'red'
  }
  elScoreModalHeadings[0].innerText = msg
  elScoreModalHeadings[1].innerText = gGame.secsPassed
  elScoreModalHeadings[2].textContent =
    prevScore !== Infinity ? prevScore : 'N/A'

  elScoreModalHeadings[0].style.color = color
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
