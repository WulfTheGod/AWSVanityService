import { KEYPAD_MAP } from './types';

export function generateRandomLetterCombinations(areaCode: string, digits: string, count: number): string[] {
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