import { KEYPAD_MAP } from './types';

export function generateRandomLetterCombinations(areaCode: string, digits: string, count: number): string[] {
    const combinations = new Set<string>();
    let attempts = 0;
    const maxAttempts = count * 10; // Prevent infinite loops

    while (combinations.size < count && attempts < maxAttempts) {
        attempts++;

        const letters = digits.split('').map(digit => {
            const letterOptions = KEYPAD_MAP[digit];
            if (!letterOptions || letterOptions.length === 0) {
                // For digits 0,1 or invalid, use a random letter from any valid digit
                const validOptions = ['A', 'B', 'C']; // From digit 2
                return validOptions[Math.floor(Math.random() * validOptions.length)];
            }
            return letterOptions[Math.floor(Math.random() * letterOptions.length)];
        }).join('');

        combinations.add(`${areaCode}-${letters}`);
    }

    return Array.from(combinations);
}