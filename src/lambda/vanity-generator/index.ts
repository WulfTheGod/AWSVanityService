import { Context, Callback } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({ serviceName: 'vanity-generator' });

// Phone keypad mapping
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

function getLettersForDigit(digit: string): string[] {
    return KEYPAD_MAP[digit] || [];
}

function cleanPhoneNumber(phoneNumber: string): string {
    // Remove all non-digits
    const digitsOnly = phoneNumber.replace(/[^0-9]/g, '');

    // Remove country code
    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
        return digitsOnly.substring(1);
    }

    return digitsOnly;
}

export const handler = async (event: any, context: Context, callback: Callback) => {
    logger.info('Processing vanity number request', { event });

    try {
        // Extract phone number from Connect event
        const rawPhoneNumber = event.Details?.ContactData?.CustomerEndpoint?.Address || '';
        const cleanedPhoneNumber = cleanPhoneNumber(rawPhoneNumber);

        logger.info('Phone number processed', {
            rawPhoneNumber,
            cleanedPhoneNumber,
            last7Digits: cleanedPhoneNumber.slice(-7)
        });

        // TODO: Generate vanity numbers from cleanedPhoneNumber

        callback(null, {
            statusCode: 200,
            vanityNumbers: []
        });
    } catch (error) {
        logger.error('Failed to process vanity number request', { error });
        callback(null, {
            statusCode: 500,
            error: 'Failed to process phone number'
        });
    }
};