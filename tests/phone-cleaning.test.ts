import { cleanPhoneNumber } from '../src/lambda/vanity-generator/clean-phone';

describe('Phone Number Cleaning', () => {
    test('Amazon Connect format', () => {
        expect(cleanPhoneNumber('+15551234567')).toBe('5551234567');
    });

    test('US format with parentheses', () => {
        expect(cleanPhoneNumber('(555) 123-4567')).toBe('5551234567');
    });

    test('Dash format', () => {
        expect(cleanPhoneNumber('555-123-4567')).toBe('5551234567');
    });

    test('Dot format', () => {
        expect(cleanPhoneNumber('555.123.4567')).toBe('5551234567');
    });

    test('Already clean digits', () => {
        expect(cleanPhoneNumber('5551234567')).toBe('5551234567');
    });

    test('Format with spaces', () => {
        expect(cleanPhoneNumber('+1 555 123 4567')).toBe('5551234567');
    });

    test('Country code with dashes', () => {
        expect(cleanPhoneNumber('1-555-123-4567')).toBe('5551234567');
    });

    test('No country code needed', () => {
        expect(cleanPhoneNumber('5551234567')).toBe('5551234567');
    });

    test('Throws error for invalid length', () => {
        expect(() => cleanPhoneNumber('123456789')).toThrow('Invalid phone number length: 9 digits');
    });

    test('Throws error for too long without country code', () => {
        expect(() => cleanPhoneNumber('123456789012')).toThrow('Invalid phone number length: 12 digits');
    });
});