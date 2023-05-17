const API_BASE_URL = 'https://words.dev-apis.com';
const VALIDATE_WORD_API = `${API_BASE_URL}/validate-word`;
const WORD_OF_THE_DAY_API = `${API_BASE_URL}/word-of-the-day`;

const ANSWER_LENGTH = 5;
const ROUNDS = 6;
const letters = document.querySelectorAll('.scoreboard-letter')
const loadingDiv = document.querySelector('.info-bar')

async function fetchWordOfTheDay() {
  const response = await fetch(WORD_OF_THE_DAY_API);
  const data = await response.json();
  return data.word.toUpperCase();
}

async function validateWord(word) {
  const response = await fetch(VALIDATE_WORD_API, {
    method: 'POST',
    body: JSON.stringify({ word }),
  });
  const data = await response.json();
  return data.validWord;
}

async function init() {
  let currentGuess = '';
  let currentRow = 0;
  let isLoading = true;

  const word = await fetchWordOfTheDay();
  const wordParts = word.split('');

  setLoading(false);
  isLoading = false;

  document.addEventListener('keydown', function handleKeyPress(e) {
    if (isLoading) return;

    const action = e.key;
    if (action === 'Enter') {
      commit();
    } else if (action === 'Backspace') {
      backspace();
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase());
    }
  });
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading) {
  loadingDiv.classList.toggle('hidden', !isLoading);
}


// make sure we get the correct amount of letters marked close instead
// of just wrong or correct
function makeMap(array) {
  const obj = {};
  for (let i = 0; i < array.length; i++) {
    if (obj[array[i]]) {
      obj[array[i]]++;
    } else {
      obj[array[i]] = 1;
    }
  }
  return obj;
}

init()
