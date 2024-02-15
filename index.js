let word;

let keyboardArea;
let wordArea;

let enable = true;

const letters = [
    'Q', 'E', 'Ë', 'R', 'T', 'Y', 'Ÿ', 'U', 'Ü', 'I', 'Ï', 'O', 'Ö', 'P', '',
    'A', 'Ä', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '',
    'Z', 'X', 'C', 'Ç', 'V', 'N', 'M'
];

let words = new Set();

let nowWordIndex = 0;
let inputWord = '';
function pressButton(of) {
    wordDiv = wordArea.children[nowWordIndex];
    letterSpan = wordDiv.children[inputWord.length];
    if (letterSpan === undefined) {
        return;
    }

    letterSpan.innerText = of.toUpperCase();
    inputWord += of;
}

function backspace() {
    wordDiv = wordArea.children[nowWordIndex];

    letterSpan = wordDiv.children[inputWord.length - 1];
    if (letterSpan === undefined) {
        return;
    }

    inputWord = inputWord.substring(0, inputWord.length - 1);
    letterSpan.innerText = '';
}

function enter() {
    // if word length is 5
    if (inputWord.length !== 5) {
        return;
    }

    // if word in dictionary
    if (!words.has(inputWord)) {
        return;
    }

    // -- proceed
    wordDiv = wordArea.children[nowWordIndex];

    // count letters
    count = {};
    for (let i = 0; i < 5; i++) {
        if (count[word[i]] !== undefined) {
            count[word[i]] += 1;
        } else {
            count[word[i]] = 1;
        }
    }

    let corrects = 0;

    for (let i = 0; i < 5; i++) {
        let letterSpan = wordDiv.children[i];

        if (letterSpan.innerText === word[i]) {
            letterSpan.classList.add('correct');
            count[letterSpan.innerText] -= 1;
            corrects += 1;
        }
    }

    if (corrects === 5) {
        enable = false;
        return;
    }

    for (let i = 0; i < 5; i++) {
        let letterSpan = wordDiv.children[i];

        if (letterSpan.classList.contains('correct')) {
            continue;
        }

        if (word.indexOf(letterSpan.innerText) !== -1
                && count[letterSpan.innerText] !== undefined
                && count[letterSpan.innerText] > 0) {
            letterSpan.classList.add('exist');
            count[letterSpan.innerText] -= 1;
        } else {
            letterSpan.classList.add('wrong');
        }
    }

    nowWordIndex += 1;
    inputWord = '';
}

document.addEventListener('DOMContentLoaded', () => {
    keyboardArea = document.querySelector('#keyboard-area');
    letters.forEach(letter => {
        if (letter === '') {
            let br = document.createElement('br');
            keyboardArea.appendChild(br)
            return;
        }

        let button = document.createElement('button');

        button.innerText = letter.toUpperCase();
        button.onclick = () => pressButton(letter);

        keyboardArea.appendChild(button);
    });

    wordArea = document.querySelector('#word-area');

    // -- load words
    fetch('./words.json')
        .then(res => res.json())
        .then(json => {
            json.forEach(word => {
                words.add(word);
            });

            // -- set today's word
            let today = new Date();
            let year = today.getYear();
            let month = today.getMonth();
            let day = today.getDay();
            let seed = (day + 42) * year + (month * 6 + 27);
            word = json[seed % json.length];
        });
});

window.addEventListener('keydown', e => {
    if (!enable) {
        return;
    }

    if (e.key === 'Backspace') {
        backspace();
    } else if (e.key === 'Enter') {
        enter();
    }

    let letter = e.key.toUpperCase();

    if (e.shiftKey) {
        if (letter === 'A') {
            letter = 'Ä';
        } else if (letter === 'E') {
            letter = 'Ë';
        } else if (letter === 'I') {
            letter = 'Ï';
        } else if (letter === 'O') {
            letter = 'Ö';
        } else if (letter === 'U') {
            letter = 'Ü';
        } else if (letter === 'Y') {
            letter = 'Ÿ';
        } else if (letter === 'C') {
            letter = 'Ç';
        }
    }

    if (letters.indexOf(letter) === -1) {
        return;
    }

    pressButton(letter);
});
