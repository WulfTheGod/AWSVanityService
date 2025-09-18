import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { Logger } from '@aws-lambda-powertools/logger';
import { maskPhoneNumber } from './mask-phone';

export async function saveVanityNumbers(
    phoneNumber: string,
    vanityNumbers: string[],
    top3: string[],
    docClient: DynamoDBDocumentClient,
    tableName: string,
    logger: Logger
) {
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