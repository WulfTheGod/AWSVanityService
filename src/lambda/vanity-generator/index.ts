import { Context } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';

const englishWords = require('../../data/english-words.json');

const logger = new Logger({ serviceName: 'vanity-generator' });

interface WordData {
    digits: string;
    score: number;
    category: string;
    length: number;
}

interface Dictionary {
    words: { [word: string]: WordData };
}

const KEYPAD_MAP: { [key: string]: string[] } = {
    '2': ['A', 'B', 'C'],
    '3': ['D', 'E', 'F'],
    '4': ['G', 'H', 'I'],
    '5': ['J', 'K', 'L'],
    '6': ['M', 'N', 'O'],
    '7': ['P', 'Q', 'R', 'S'],
    '8': ['T', 'U', 'V'],
    '9': ['W', 'X', 'Y', 'Z']
};


function cleanPhoneNumber(phoneNumber: string): string {
    const digitsOnly = phoneNumber.replace(/[^0-9]/g, '');

    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
        return digitsOnly.substring(1);
    }

    if (digitsOnly.length !== 10) {
        throw new Error(`Invalid phone number length: ${digitsOnly.length} digits`);
    }

    return digitsOnly;
}

function maskPhoneNumber(phoneNumber: string): string {
    if (phoneNumber.length !== 10) return phoneNumber;
    return `${phoneNumber.slice(0, 3)}****${phoneNumber.slice(-3)}`;
}

function generateVanityNumbers(phoneNumber: string): string[] {
    const last7Digits = phoneNumber.slice(-7);
    const areaCode = phoneNumber.slice(0, 3);

    const wordMatches = findWordMatches(last7Digits);

    if (wordMatches.length > 0) {
        return wordMatches.slice(0, 5).map(match =>
            formatVanityNumber(areaCode, last7Digits, match)
        );
    } else {
        return generateRandomLetterCombinations(areaCode, last7Digits, 5);
    }
}

interface WordMatch {
    word: string;
    digits: string;
    score: number;
    position: number;
    length: number;
}

function findWordMatches(digits: string): WordMatch[] {
    const matches: WordMatch[] = [];
    const dictionary = englishWords as Dictionary;

    for (const [word, data] of Object.entries(dictionary.words)) {
        const wordDigits = data.digits;
        const position = digits.indexOf(wordDigits);
        if (position !== -1) {
            matches.push({
                word,
                digits: wordDigits,
                score: data.score,
                position,
                length: data.length
            });
        }
    }

    return matches.sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        if (a.length !== b.length) return b.length - a.length;
        return a.position - b.position;
    });
}

function formatVanityNumber(areaCode: string, digits: string, match: WordMatch): string {
    const { word, position, length } = match;
    const before = digits.slice(0, position);
    const after = digits.slice(position + length);

    let parts = [areaCode];
    if (before.length > 0) parts.push(before);
    parts.push(word);
    if (after.length > 0) parts.push(after);

    return parts.join('-');
}

function generateRandomLetterCombinations(areaCode: string, digits: string, count: number): string[] {
    const combinations = new Set<string>();

    while (combinations.size < count) {
        const letters = digits.split('').map(digit => {
            const letterOptions = KEYPAD_MAP[digit];
            if (!letterOptions) return digit;
            return letterOptions[Math.floor(Math.random() * letterOptions.length)];
        }).join('');

        combinations.add(`${areaCode}-${letters}`);
    }

    return Array.from(combinations);
}

export const handler = async (event: any, context: Context) => {
    logger.info('Processing vanity number request');

    try {
        const rawPhoneNumber =
            event.Details?.ContactData?.CustomerEndpoint?.Address ||
            event.Details?.ContactData?.SystemEndpoint?.Address || '';

        if (!rawPhoneNumber) {
            throw new Error('No phone number found in Connect event');
        }

        const cleanedPhoneNumber = cleanPhoneNumber(rawPhoneNumber);

        logger.info('Phone number processed', {
            rawPhoneNumber: maskPhoneNumber(rawPhoneNumber.replace(/[^0-9]/g, '')),
            cleanedPhoneNumber: maskPhoneNumber(cleanedPhoneNumber),
            last7Digits: maskPhoneNumber('000' + cleanedPhoneNumber.slice(-7))
        });

        const vanityNumbers = generateVanityNumbers(cleanedPhoneNumber);
        const top3 = vanityNumbers.slice(0, 3);

        logger.info('Generated vanity numbers', {
            count: vanityNumbers.length,
            top3Count: top3.length
        });

        return {
            vanityNumbers,
            top3
        };
    } catch (error) {
        logger.error('Failed to process vanity number request', { error });
        return {
            error: 'Failed to process phone number'
        };
    }
};