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
  modeTxt = elMode.checked ? 'Dark' : 'Light'
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
