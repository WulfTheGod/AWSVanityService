const KEYPAD_MAP = {
    '2': ['A', 'B', 'C'],
    '3': ['D', 'E', 'F'],
    '4': ['G', 'H', 'I'],
    '5': ['J', 'K', 'L'],
    '6': ['M', 'N', 'O'],
    '7': ['P', 'Q', 'R', 'S'],
    '8': ['T', 'U', 'V'],
    '9': ['W', 'X', 'Y', 'Z']
};

function getLettersForDigit(digit) {
    return KEYPAD_MAP[digit] || [];
}

// Test runner
function runTest(description, digit, expected) {
    const result = getLettersForDigit(digit);
    const passed = JSON.stringify(result) === JSON.stringify(expected);

    console.log(`${passed ? '✅' : '❌'} ${description}`);
    console.log(`   Digit: "${digit}"`);
    console.log(`   Expected: [${expected.join(', ')}]`);
    console.log(`   Got: [${result.join(', ')}]`);
    console.log('');

    return passed;
}

console.log('🔢 Phone Keypad Mapping Test Suite\n');

let passed = 0;
let total = 0;

// Test each digit
total++; if (runTest('Digit 2 maps to ABC', '2', ['A', 'B', 'C'])) passed++;
total++; if (runTest('Digit 3 maps to DEF', '3', ['D', 'E', 'F'])) passed++;
total++; if (runTest('Digit 4 maps to GHI', '4', ['G', 'H', 'I'])) passed++;
total++; if (runTest('Digit 5 maps to JKL', '5', ['J', 'K', 'L'])) passed++;
total++; if (runTest('Digit 6 maps to MNO', '6', ['M', 'N', 'O'])) passed++;
total++; if (runTest('Digit 7 maps to PQRS', '7', ['P', 'Q', 'R', 'S'])) passed++;
total++; if (runTest('Digit 8 maps to TUV', '8', ['T', 'U', 'V'])) passed++;
total++; if (runTest('Digit 9 maps to WXYZ', '9', ['W', 'X', 'Y', 'Z'])) passed++;

// Test edge cases
total++; if (runTest('Digit 0 returns empty (no letters)', '0', [])) passed++;
total++; if (runTest('Digit 1 returns empty (no letters)', '1', [])) passed++;
total++; if (runTest('Invalid digit returns empty', 'X', [])) passed++;

// Show example combinations
console.log('💡 Example: Phone number "555" could make:');
const fives = getLettersForDigit('5');
fives.forEach(first => {
    fives.forEach(second => {
        fives.forEach(third => {
            console.log(`   ${first}${second}${third}`);
        });
    });
});

console.log(`\n📊 Results: ${passed}/${total} tests passed`);
if (passed === total) {
    console.log('🎉 All keypad mapping tests passed!');
} else {
    console.log('⚠️  Some tests failed.');
}