import { Context, Callback } from 'aws-lambda';

export const handler = async (event: any, context: Context, callback: Callback) => {
    console.log('Event:', JSON.stringify(event, null, 2));

    // TODO: Retrieve existing vanity numbers from DynamoDB

    callback(null, {
        statusCode: 200,
        vanityNumbers: []
    });
};