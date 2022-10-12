const ANSWER_LENGTH = 5;
const ROUNDS = 6;
const letters = document.querySelectorAll('.scoreboard-letter')
const loadingDiv = document.querySelector('.info-bar')


async function init() {
  let currentGuess = ''
  let currentRow = 0
  let isLoading = true
  const res = await fetch('https://words.dev-apis.com/word-of-the-day');
  const resObj = await res.json();
  const word = resObj.word.toUpperCase();
  const wordParts = word.split('');
  let done = false;

  setLoading(false)
  isLoading = false


  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH) {
      currentGuess += letter;
    } else {
      currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
    }

    letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;
  }

  // use tries to enter a guess
  async function commit() {
    if (currentGuess.length !== ANSWER_LENGTH) {
      //do nothing
      return;
    }


    // check the API to see if it's a valid word
    isLoading = true;
    setLoading(isLoading);
    const res = await fetch('https://words.dev-apis.com/validate-word', {
      method: 'POST',
      body: JSON.stringify({word: currentGuess}),
    });
    const {validWord} = await res.json();
    isLoading = false;
    setLoading(isLoading);

    // not valid, mark the word as invalid and return
    if (!validWord) {
      markInvalidWord();
      return;
    }

    const guessParts = currentGuess.split('')
    const map = makeMap(wordParts);

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        // mark as correct
        letters[currentRow * ANSWER_LENGTH + i].classList.add('correct');
        map[guessParts[i]]--;
      }
    }

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        // do nothing
      } else if (map[guessParts[i]] && map[guessParts[i]] > 0) {
        // mark as close
        letters[currentRow * ANSWER_LENGTH + i].classList.add('close');
        map[guessParts[i]]--;
      } else {
        // wrong
        letters[currentRow * ANSWER_LENGTH + i].classList.add('wrong');
      }
    }


    currentRow++;
    if (currentGuess === word) {
      //win
      document.querySelector('.brand').classList.add('winner');
      done = true
      alert('you win');
      return;
    } else if (currentRow === ROUNDS) {
      alert(`you lose, the word was ${word}`)
      done = true;
    }
    currentGuess = '';

  }

  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = '';
  }

  function markInvalidWord() {
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      letters[currentRow * ANSWER_LENGTH + i].classList.remove('invalid');

      setTimeout(
        () => letters[currentRow * ANSWER_LENGTH + i].classList.add('invalid'),
        10
      );
    }
  }

  document.addEventListener('keydown', function handleKeyPress(e) {
    if (done || isLoading) {
      //do nothing
      return;
    }

    const action = e.key;
    console.log(action);
    if (action === 'Enter') {
      commit();
    } else if (action === 'Backspace') {
      backspace();
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase());
    } else {
      //do nothing
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
