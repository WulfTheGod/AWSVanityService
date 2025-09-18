import { Context, Callback } from 'aws-lambda';

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
    console.log('Event:', JSON.stringify(event, null, 2));

    try {
        // Extract phone number from Connect event
        const rawPhoneNumber = event.Details?.ContactData?.CustomerEndpoint?.Address || '';
        const cleanedPhoneNumber = cleanPhoneNumber(rawPhoneNumber);

        console.log('Raw phone number:', rawPhoneNumber);
        console.log('Cleaned phone number:', cleanedPhoneNumber);

        // TODO: Generate vanity numbers from cleanedPhoneNumber

        callback(null, {
            statusCode: 200,
            vanityNumbers: []
        });
    } catch (error) {
        console.error('Error processing phone number:', error);
        callback(null, {
            statusCode: 500,
            error: 'Failed to process phone number'
        });
    }
};