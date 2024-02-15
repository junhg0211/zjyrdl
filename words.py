from json import dump


yeses = {
    'A', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
    'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z', 'Ä', 'Ë', 'Ï', 'Ö', 'Ü', 'Ÿ'
}

def main():
    # -- get words
    with open('words.txt', 'r', encoding='utf-8') as file:
        words = file.read() \
            .strip() \
            .upper() \
            .split('\n')

    # -- filter words to be 5 lengthed
    words = list(filter(lambda x: len(x) == 5, words))

    # -- filter forbidden letters
    offset = 0
    for i, word in list(enumerate(words)):
        for letter in word:
            if letter not in yeses:
                words.pop(i - offset)
                offset += 1
                break

    # -- get letters of words
    letters = set()
    for word in words:
        for letter in word:
            letters.add(letter)

    # -- print result
    print(words)
    print(sorted(letters))

    # -- save result
    with open('words.json', 'w', encoding='utf-8') as file:
        dump(words, file, ensure_ascii=False)


if __name__ == '__main__':
    main()
