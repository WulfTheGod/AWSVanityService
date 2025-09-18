import { Context } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const englishWords = require('../../data/english-words.json');

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const tableName = process.env.VANITY_TABLE_NAME!;

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

async function getExistingVanityNumbers(phoneNumber: string) {
    try {
        const command = new GetCommand({
            TableName: tableName,
            Key: { phoneNumber }
        });

        const result = await docClient.send(command);
        return result.Item;
    } catch (error) {
        logger.error('Failed to get existing vanity numbers', { error, phoneNumber: maskPhoneNumber(phoneNumber) });
        return null;
    }
}

async function saveVanityNumbers(phoneNumber: string, vanityNumbers: string[], top3: string[]) {
    try {
        const command = new PutCommand({
            TableName: tableName,
            Item: {
                phoneNumber,
                vanityNumbers,
                top3,
                createdAt: new Date().toISOString(),
                ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days TTL
            }
        });

        await docClient.send(command);
        logger.info('Vanity numbers saved to DynamoDB', {
            phoneNumber: maskPhoneNumber(phoneNumber),
            count: vanityNumbers.length
        });
    } catch (error) {
        logger.error('Failed to save vanity numbers', { error, phoneNumber: maskPhoneNumber(phoneNumber) });
        throw error;
    }
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

        // Check if we already have vanity numbers for this caller
        const existingRecord = await getExistingVanityNumbers(cleanedPhoneNumber);

        if (existingRecord) {
            logger.info('Returning cached vanity numbers', {
                phoneNumber: maskPhoneNumber(cleanedPhoneNumber),
                cachedCount: existingRecord.vanityNumbers?.length || 0
            });

            return {
                vanityNumbers: existingRecord.vanityNumbers || [],
                top3: existingRecord.top3 || [],
                cached: true
            };
        }

        // Generate new vanity numbers
        const vanityNumbers = generateVanityNumbers(cleanedPhoneNumber);
        const top3 = vanityNumbers.slice(0, 3);

        // Save to DynamoDB for future calls
        await saveVanityNumbers(cleanedPhoneNumber, vanityNumbers, top3);

        logger.info('Generated and saved new vanity numbers', {
            phoneNumber: maskPhoneNumber(cleanedPhoneNumber),
            count: vanityNumbers.length,
            top3Count: top3.length
        });

        return {
            vanityNumbers,
            top3,
            cached: false
        };
    } catch (error) {
        logger.error('Failed to process vanity number request', { error });
        return {
            error: 'Failed to process phone number'
        };
    }
};