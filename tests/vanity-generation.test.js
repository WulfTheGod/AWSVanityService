/**
 * Interactive Vanity Number Generator Test
 * Enter phone numbers to see what vanity numbers our system would generate
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load the business dictionary
const dictionaryPath = path.join(__dirname, '../src/data/business-words.json');
const dictionary = JSON.parse(fs.readFileSync(dictionaryPath, 'utf8'));

// Phone cleaning function
function cleanPhoneNumber(phoneNumber) {
    const digitsOnly = phoneNumber.replace(/[^0-9]/g, '');
    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
        return digitsOnly.substring(1);
    }
    return digitsOnly;
}

// Basic word matching function
function findWordMatches(phoneNumber) {
    const cleaned = cleanPhoneNumber(phoneNumber);
    const last7 = cleaned.slice(-7);

    console.log(`\n🔍 Processing: ${phoneNumber}`);
    console.log(`   Cleaned: ${cleaned}`);
    console.log(`   Last 7 digits: ${last7}`);

    const matches = [];

    // Check each word in dictionary
    Object.entries(dictionary.words).forEach(([word, data]) => {
        const wordDigits = data.digits;

        // Check if word digits appear anywhere in last 7 digits
        if (last7.includes(wordDigits)) {
            const position = last7.indexOf(wordDigits);
            matches.push({
                word,
                digits: wordDigits,
                score: data.score,
                category: data.category,
                position,
                vanityFormat: formatVanityNumber(cleaned, wordDigits, word, position, last7)
            });
        }
    });

    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);

    return matches;
}

function formatVanityNumber(fullNumber, wordDigits, word, position, last7) {
    const prefix = fullNumber.slice(0, 3);  // Area code

    if (position === 0) {
        // Word at start: 555-WORD-123
        const remaining = last7.slice(wordDigits.length);
        if (remaining.length > 0) {
            return `${prefix}-${word}-${remaining}`;
        } else {
            return `${prefix}-${word}`;
        }
    } else {
        // Word in middle/end: 555-123-WORD
        const before = last7.slice(0, position);
        const after = last7.slice(position + wordDigits.length);

        if (before.length > 0 && after.length > 0) {
            return `${prefix}-${before}-${word}-${after}`;
        } else if (before.length > 0) {
            return `${prefix}-${before}-${word}`;
        } else {
            return `${prefix}-${word}-${after}`;
        }
    }
}

function analyzePhoneNumber(phoneNumber) {
    console.log('\n' + '='.repeat(60));

    const matches = findWordMatches(phoneNumber);

    if (matches.length === 0) {
        console.log('❌ No word matches found in our business dictionary');
        console.log('💡 This number would need our fallback strategy');
        console.log('   (Generate pronounceable letter combinations)');
        return [];
    }

    console.log(`✅ Found ${matches.length} word match(es):`);

    // Show top 5 matches
    const topMatches = matches.slice(0, 5);
    topMatches.forEach((match, index) => {
        console.log(`\n   ${index + 1}. ${match.vanityFormat}`);
        console.log(`      📝 Word: "${match.word}" (${match.category})`);
        console.log(`      🏆 Score: ${match.score}`);
        console.log(`      📍 Position: ${match.position} in last 7 digits`);
    });

    if (matches.length > 5) {
        console.log(`\n   ... and ${matches.length - 5} more matches`);
    }

    return topMatches;
}

// Interactive interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('📱 Interactive Vanity Number Generator');
console.log(`📚 Dictionary loaded: ${Object.keys(dictionary.words).length} business words`);
console.log('\nEnter phone numbers to see what vanity numbers we can generate!');
console.log('Examples: 970-462-5226, 555-CALL-NOW, 800-555-HOME');
console.log('Type "quit" to exit\n');

function promptUser() {
    rl.question('Enter phone number: ', (input) => {
        if (input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
            console.log('\n👋 Thanks for testing the vanity number generator!');
            rl.close();
            return;
        }

        if (input.trim() === '') {
            promptUser();
            return;
        }

        analyzePhoneNumber(input.trim());

        console.log('\n' + '-'.repeat(60));
        promptUser();
    });
}

promptUser();