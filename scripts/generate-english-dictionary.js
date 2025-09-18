const fs = require('fs');
const path = require('path');
const words = require('an-array-of-english-words');

const KEYPAD_MAP = {
    'A': '2', 'B': '2', 'C': '2',
    'D': '3', 'E': '3', 'F': '3',
    'G': '4', 'H': '4', 'I': '4',
    'J': '5', 'K': '5', 'L': '5',
    'M': '6', 'N': '6', 'O': '6',
    'P': '7', 'Q': '7', 'R': '7', 'S': '7',
    'T': '8', 'U': '8', 'V': '8',
    'W': '9', 'X': '9', 'Y': '9', 'Z': '9'
};

function convertWordToDigits(word) {
    return word.toUpperCase()
        .split('')
        .map(letter => KEYPAD_MAP[letter] || '')
        .join('');
}

function scoreWord(word) {
    let score = 50;

    if (word.length === 4) score += 15;
    else if (word.length === 5) score += 12;
    else if (word.length === 6) score += 8;
    else if (word.length === 3) score += 10;
    else if (word.length === 7) score += 5;
    else if (word.length < 3 || word.length > 7) score -= 10;

    if (word.length <= 5 && /^[a-z]+$/.test(word.toLowerCase())) {
        score += 5;
    }

    if (word.includes('Q') || word.includes('X') || word.includes('Z')) {
        score -= 3;
    }

    return Math.max(0, score);
}

function isValidWord(word) {
    if (word.length < 3 || word.length > 7) return false;
    if (!/^[a-zA-Z]+$/.test(word)) return false;

    if (/(.)\1{2,}/.test(word)) return false;

    if (/^(aa|oo|ii|uu|zz)/i.test(word)) return false;

    if (/[qxz]/i.test(word)) return false;

    const digits = convertWordToDigits(word);
    return digits.length === word.length && !digits.split('').includes('');
}

console.log(`Starting with ${words.length.toLocaleString()} English words...`);

console.log('Testing first few words:');
const testWords = words.slice(0, 20);
for (const word of testWords) {
    const valid = isValidWord(word);
    console.log(`  ${word} (len:${word.length}) → valid: ${valid}`);
    if (valid) {
        console.log(`    digits: ${convertWordToDigits(word)}, score: ${scoreWord(word)}`);
    }
}

const validWords = [];
let duplicateCount = 0;

for (const word of words) {
    if (!isValidWord(word)) continue;

    const upperWord = word.toUpperCase();
    const digits = convertWordToDigits(upperWord);
    const score = scoreWord(word);

    validWords.push({
        word: upperWord,
        digits,
        score,
        category: 'english',
        length: word.length
    });
}

validWords.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return a.length - b.length;
});

const MAX_WORDS = 15000;
const WORDS_PER_LETTER = Math.floor(MAX_WORDS / 26);
const processedWords = {};
let validCount = 0;

const wordsByLetter = {};
for (const wordData of validWords) {
    const firstLetter = wordData.word[0];
    if (!wordsByLetter[firstLetter]) wordsByLetter[firstLetter] = [];
    wordsByLetter[firstLetter].push(wordData);
}

for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    if (!wordsByLetter[letter]) continue;

    const letterWords = wordsByLetter[letter];
    const wordsToTake = Math.min(letterWords.length, WORDS_PER_LETTER);

    for (let i = 0; i < wordsToTake && validCount < MAX_WORDS; i++) {
        const wordData = letterWords[i];

        if (processedWords[wordData.word]) {
            duplicateCount++;
            continue;
        }

        processedWords[wordData.word] = {
            digits: wordData.digits,
            score: wordData.score,
            category: wordData.category,
            length: wordData.length
        };

        validCount++;
    }
}

console.log(`✅ Processed ${validCount.toLocaleString()} valid words`);
console.log(`🔄 Skipped ${duplicateCount.toLocaleString()} duplicates`);
console.log(`❌ Filtered out ${(words.length - validCount - duplicateCount).toLocaleString()} invalid words`);

const dictionary = {
    metadata: {
        description: "English word dictionary optimized for vanity number generation",
        generation_method: "Generated from an-array-of-english-words package, filtered and pre-computed",
        focus: "Common English words 3-7 characters, pre-mapped to T9 digits for fast lookup",
        last_updated: new Date().toISOString().split('T')[0],
        total_words: validCount
    },
    matching_rules: {
        allow_inside_number: true,
        prefer_trailing_match: false,
        max_words_per_number: 3,
        min_word_length: 3,
        max_word_length: 7,
        skip_digits: ["0", "1"],
        boundary_digits: ["0", "1"]
    },
    scoring_weights: {
        word_score: 0.6,
        length_bonus: 0.2,
        position_bonus: 0.1,
        completeness: 0.1
    },
    words: processedWords
};

const outputPath = path.join(__dirname, '../src/data/english-words.json');
fs.writeFileSync(outputPath, JSON.stringify(dictionary, null, 2));

const stats = fs.statSync(outputPath);
const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

console.log(`📁 Generated dictionary: ${outputPath}`);
console.log(`📊 File size: ${fileSizeMB}MB`);
console.log(`🎯 Ready for Lambda integration!`);

console.log('\n📝 Sample words generated:');
const sampleWords = Object.entries(processedWords).slice(0, 10);
for (const [word, data] of sampleWords) {
    console.log(`   ${word} → ${data.digits} (score: ${data.score})`);
}