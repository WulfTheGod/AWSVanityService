import { KEYPAD_MAP } from '../src/lambda/vanity-generator/types';

function getLettersForDigit(digit: string): string[] {
    return KEYPAD_MAP[digit] || [];
}

describe('Phone Keypad Mapping', () => {
    test('Digit 2 maps to ABC', () => {
        expect(getLettersForDigit('2')).toEqual(['A', 'B', 'C']);
    });

    test('Digit 3 maps to DEF', () => {
        expect(getLettersForDigit('3')).toEqual(['D', 'E', 'F']);
    });

    test('Digit 4 maps to GHI', () => {
        expect(getLettersForDigit('4')).toEqual(['G', 'H', 'I']);
    });

    test('Digit 5 maps to JKL', () => {
        expect(getLettersForDigit('5')).toEqual(['J', 'K', 'L']);
    });

    test('Digit 6 maps to MNO', () => {
        expect(getLettersForDigit('6')).toEqual(['M', 'N', 'O']);
    });

    test('Digit 7 maps to PQRS', () => {
        expect(getLettersForDigit('7')).toEqual(['P', 'Q', 'R', 'S']);
    });

    test('Digit 8 maps to TUV', () => {
        expect(getLettersForDigit('8')).toEqual(['T', 'U', 'V']);
    });

    test('Digit 9 maps to WXYZ', () => {
        expect(getLettersForDigit('9')).toEqual(['W', 'X', 'Y', 'Z']);
    });

    test('Digit 0 returns empty (no letters)', () => {
        expect(getLettersForDigit('0')).toEqual([]);
    });

    test('Digit 1 returns empty (no letters)', () => {
        expect(getLettersForDigit('1')).toEqual([]);
    });

    test('Invalid digit returns empty', () => {
        expect(getLettersForDigit('X')).toEqual([]);
    });

    test('Example combinations for "555"', () => {
        const fives = getLettersForDigit('5');
        expect(fives).toEqual(['J', 'K', 'L']);

        // Test that we can generate combinations
        const combinations: string[] = [];
        fives.forEach(first => {
            fives.forEach(second => {
                fives.forEach(third => {
                    combinations.push(`${first}${second}${third}`);
                });
            });
        });

        expect(combinations).toContain('JJJ');
        expect(combinations).toContain('KKK');
        expect(combinations).toContain('LLL');
        expect(combinations).toHaveLength(27); // 3^3 combinations
    });
});