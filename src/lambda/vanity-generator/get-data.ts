import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { Logger } from '@aws-lambda-powertools/logger';
import { maskPhoneNumber } from './mask-phone';

export async function getExistingVanityNumbers(
    phoneNumber: string,
    docClient: DynamoDBDocumentClient,
    tableName: string,
    logger: Logger
) {
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