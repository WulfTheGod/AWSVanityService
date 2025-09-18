import { generateVanityNumbers } from '../src/lambda/vanity-generator/generate-vanity';
import { Dictionary } from '../src/lambda/vanity-generator/types';

// Mock English words dictionary for testing
const mockDictionary: Dictionary = {
    words: {
        'CALL': { digits: '2255', score: 100, category: 'business', length: 4 },
        'HOME': { digits: '4663', score: 90, category: 'general', length: 4 },
        'HELP': { digits: '4357', score: 85, category: 'service', length: 4 },
        'BOOK': { digits: '2665', score: 80, category: 'business', length: 4 }
    }
};

describe('Vanity Number Generation', () => {
    test('Generates vanity numbers with word matches', () => {
        const phoneNumber = '5552255123'; // Contains "CALL" (2255)
        const result = generateVanityNumbers(phoneNumber, mockDictionary);

        expect(result).toHaveLength(1);
        expect(result[0]).toBe('555-CALL-123');
    });

    test('Generates random combinations when no words match', () => {
        const phoneNumber = '5551111111'; // No word matches
        const result = generateVanityNumbers(phoneNumber, mockDictionary);

        expect(result).toHaveLength(5);
        result.forEach(vanity => {
            expect(vanity).toMatch(/^555-[A-Z]{7}$/);
        });
    });

    test('Returns multiple word matches sorted by score', () => {
        const mockDictWithMultiple: Dictionary = {
            words: {
                'CALL': { digits: '2255', score: 100, category: 'business', length: 4 },
                'BALL': { digits: '2255', score: 50, category: 'sports', length: 4 }
            }
        };

        const phoneNumber = '5552255123';
        const result = generateVanityNumbers(phoneNumber, mockDictWithMultiple);

        expect(result).toHaveLength(2);
        expect(result[0]).toBe('555-CALL-123'); // Higher score first
        expect(result[1]).toBe('555-BALL-123');
    });

    test('Limits results to maximum of 5', () => {
        const phoneNumber = '5551111111';
        const result = generateVanityNumbers(phoneNumber, mockDictionary);

        expect(result.length).toBeLessThanOrEqual(5);
    });

    test('Handles phone number with word at end', () => {
        const phoneNumber = '5551234663'; // Ends with "HOME" (4663)
        const result = generateVanityNumbers(phoneNumber, mockDictionary);

        expect(result).toHaveLength(1);
        expect(result[0]).toBe('555-123-HOME');
    });
});