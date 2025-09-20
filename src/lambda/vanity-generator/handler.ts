import { Context } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Dictionary } from './types';
import { cleanPhoneNumber } from './clean-phone';
import { maskPhoneNumber } from './mask-phone';
import { generateVanityNumbers } from './generate-vanity';
import { getExistingVanityNumbers } from './get-data';
import { saveVanityNumbers } from './save-data';

const englishWords = require('../../data/english-words.json') as Dictionary;

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const tableName = process.env.VANITY_TABLE_NAME!;

const logger = new Logger({ serviceName: 'vanity-generator' });

export const handler = async (event: any, context: Context) => {
    logger.info('Processing vanity number request', {
        eventStructure: JSON.stringify(event, null, 2)
    });

    try {
        const rawPhoneNumber =
            event.Details?.ContactData?.CustomerEndpoint?.Address ||
            event.Details?.ContactData?.SystemEndpoint?.Address || '';

        logger.info('Phone number extraction attempt', {
            hasDetails: !!event.Details,
            hasContactData: !!event.Details?.ContactData,
            hasCustomerEndpoint: !!event.Details?.ContactData?.CustomerEndpoint,
            hasSystemEndpoint: !!event.Details?.ContactData?.SystemEndpoint,
            rawPhoneNumber: rawPhoneNumber ? 'found' : 'not found'
        });

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
        const existingRecord = await getExistingVanityNumbers(cleanedPhoneNumber, docClient, tableName, logger);

        if (existingRecord) {
            logger.info('Returning cached vanity numbers', {
                phoneNumber: maskPhoneNumber(cleanedPhoneNumber),
                cachedCount: existingRecord.vanityNumbers?.length || 0
            });

            const top3 = existingRecord.top3;
            return {
                top3_0: top3[0],
                top3_1: top3[1],
                top3_2: top3[2],
                cached: "true"
            };
        }

        // Generate new vanity numbers
        const vanityNumbers = generateVanityNumbers(cleanedPhoneNumber, englishWords);
        const top3 = vanityNumbers.slice(0, 3);

        // Save to DynamoDB for future calls
        await saveVanityNumbers(cleanedPhoneNumber, vanityNumbers, top3, docClient, tableName, logger);

        logger.info('Generated and saved new vanity numbers', {
            phoneNumber: maskPhoneNumber(cleanedPhoneNumber),
            count: vanityNumbers.length,
            top3Count: top3.length
        });

        return {
            top3_0: top3[0],
            top3_1: top3[1],
            top3_2: top3[2],
            cached: "false"
        };
    } catch (error) {
        logger.error('Failed to process vanity number request', { error });
        return {
            error: 'Failed to process phone number'
        };
    }
};