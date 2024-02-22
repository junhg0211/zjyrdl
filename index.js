let year, month, day;

function setCookie(key, value, expire) {
    value = encodeURIComponent(value);
    document.cookie = `${key}=${value}; expires=${expire}; path=/`;
}

let word;

let keyboardArea;
let wordArea;
let notificationDiv;
let notificationTitle;
let notificationContent;

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
    if (!enable) {
        return;
    }

    wordDiv = wordArea.children[nowWordIndex];

    letterSpan = wordDiv.children[inputWord.length - 1];
    if (letterSpan === undefined) {
        return;
    }

    inputWord = inputWord.substring(0, inputWord.length - 1);
    letterSpan.innerText = '';
}

function enter() {
    if (!enable) {
        return;
    }

    // if word length is 5
    if (inputWord.length !== 5) {
        return;
    }

    // if word in dictionary
    if (!words.has(inputWord)) {
        notify('Rardéÿrgo', "Ä Ÿrgo d'iksàhum uä Vapy.")
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

    // check corrects
    let corrects = 0;
    let keyColors = {};

    for (let i = 0; i < 5; i++) {
        let letterSpan = wordDiv.children[i];

        if (letterSpan.innerText === word[i]) {
            letterSpan.classList.add('correct');
            count[letterSpan.innerText] -= 1;
            corrects += 1;

            keyColors[word[i]] = 'correct';
        }
    }

    if (corrects === 5) {
        enable = false;
    }

    // check exists and wrongs
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

            if (keyColors[letterSpan.innerText] === undefined) {
                keyColors[letterSpan.innerText] = 'exist';
            }
        } else {
            letterSpan.classList.add('wrong');
            if (keyColors[letterSpan.innerText] === undefined) {
                keyColors[letterSpan.innerText] = 'wrong';
            }
        }
    }

    // reset buffer
    nowWordIndex += 1;
    inputWord = '';

    // change key color
    for (let i = 0; i < keyboardArea.children.length; i++) {
        let child = keyboardArea.children[i];

        if (keyColors[child.innerText] === undefined) {
            continue;
        }

        if (keyColors[child.innerText] === 'correct') {
            child.classList.remove('wrong');
            child.classList.remove('exist');
            child.classList.add('correct');
            continue;
        }

        if (keyColors[child.innerText] === 'exist') {
            if (child.classList.contains('correct')) {
                continue;
            }

            child.classList.remove('wrong');
            child.classList.add('exist');
            continue;
        }

        if (keyColors[child.innerText] === 'wrong') {
            if (child.classList.contains('correct')
                || child.classList.contains('exist')) {
                continue;
            }

            child.classList.add('wrong');
        }
    }

    // save cookie
    let date = new Date(year, month-1, day, 23, 59, 59);
    let wordCookie = '';
    for (let i = 0; i < nowWordIndex+1; i++) {
        let wordDiv = wordArea.children[i];

        let word = '';
        for (let j = 0; j < 5; j++) {
            word += wordDiv.children[j].innerText;
        }
        word += ' ';

        wordCookie += word;
    }
    setCookie('words', wordCookie, date);
}

const grey = '⬜';
const green = '🟩';
const yellow = '🟨';
function copy() {
    let today = new Date();
    let year = today.getYear() + 1900;
    let month = today.getMonth() + 1;
    let day = today.getDate();
    let result = `${year}. ${month}. ${day} Zÿrdl ${nowWordIndex}/8\n\n`;

    for (let i = 0; i < nowWordIndex; i++) {
        let wordDiv = wordArea.children[i];

        for (let j = 0; j < 5; j++) {
            let letterSpan = wordDiv.children[j];

            if (letterSpan.classList.contains("correct")) {
                result += green;
            } else if (letterSpan.classList.contains("exist")) {
                result += yellow;
            } else {
                result += grey;
            }
        }

        result += '\n';
    }

    result += '\nhttps://me.shtelo.org/zjyrdl';

    // -- copy result
    navigator.clipboard.writeText(result);

    // -- notification
    notify('Sipotaè', "Exitnatanil sipotaè.")
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
            year = today.getYear() + 1900;
            month = today.getMonth() + 1;
            day = today.getDate();
            let seed = (day + 42) * year + (month * 6 + 27);
            word = json[seed % json.length];
        })
        .then(() => {
            // handle cookie
            document.cookie.split('; ').forEach(cookie => {
                let [key, value] = cookie.split('=');

                value = decodeURIComponent(value);
                if (key === 'words') {
                    for (let i = 0; i < value.length; i++) {
                        if (value[i] === ' ') {
                            enter();

                        } else {
                            pressButton(value[i]);
                        }
                    }

                    enter();
                }
            });
        });

    notificationDiv = document.querySelector('#notification');
    notificationTitle = document.querySelector('#notification-title');
    notificationContent = document.querySelector('#notification-content');
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

function notify(title, content) {
    // set title and content
    notificationTitle.innerText = title;

    notificationContent.innerHTML = '';
    content.split('\n').forEach(paragraph => {
        let p = document.createElement('p');
        p.innerText = paragraph;
        notificationContent.appendChild(p);
    });

    // show
    notificationDiv.classList.add('notification-show');

    setTimeout(() => {
        notificationDiv.classList.remove('notification-show');
    }, 2000);
}
