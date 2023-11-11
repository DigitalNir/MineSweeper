'use strict'
function onChangeLevel(newLevel) {
  gGame.chosenLevel = newLevel
  resetGame()
  onInit()
}

function toggleDarkMode(elMode) {
  document.body.classList.toggle('dark-mode')
  const elModeText = document.querySelector('.mode-text')
  console.log(elModeText)
  console.log('elModeText.checked:', elMode.checked)
  let modeTxt = ''
  modeTxt = elMode.checked ? ' 🌚' : ' 🌞'
  elModeText.innerText = modeTxt
}

function toggleOptionsModal() {
  const elOptionsModal = document
    .querySelector('.options-modal')
    .classList.toggle('hidden')
  //   const isHidden = elOptionsModal.classList.contains('hidden')
  //   if (!isHidden) elOptionsModal.style.display = 'block'
  //   document.querySelector('.score-modal').classList.add('hidden')
}

function closeModal(elModalCloseBtn) {
  // Getting from the close btn to its parent - the modal element itself
  elModalCloseBtn.parentElement.classList.add('hidden')
}

function onHint(elHint) {
  if (gGame.hintStatus.isHintOn) return // Ignore attempts to click Hint when another Hint is active

  gGame.hintStatus.isHintOn = true
  gGame.hintStatus.elHint = elHint

  elHint.querySelector('img').setAttribute('src', 'img/hint-active.png')
}

function handleHighScore() {
  const elScoreModal = document.querySelector('.score-modal')
  const elScoreModalHeadings = document.querySelectorAll('.score-modal h2 span')

  // console.log('High Score!')
  elScoreModal.classList.remove('hidden')
  // elScoreModal.style.display = 'block'
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

function onExterminator(elBtnExterminator) {
  if (gGame.chosenLevel === 'BEGINNER') return
  // console.log('Mines before - countActualMines', countActualMines(gBoard))
  // console.log(
  //   'Mines before - countActualMinesNotShown',
  //   countActualMinesNotShown(gBoard)
  // )

  gBoard = blowRandomMines(gBoard, 3)

  // console.log('Mines after - countActualMines', countActualMines(gBoard))
  // console.log(
  //   'Mines after - countActualMinesNotShown',
  //   countActualMinesNotShown(gBoard)
  // )

  // gGame.shownCount +=
  3
  elBtnExterminator.style.display = 'none'

  setMinesNegsCount(gBoard)
  renderBoard(gBoard)
  checkVictory()
}
