import { Dictionary } from './types';
import { findWordMatches } from './find-words';
import { formatVanityNumber } from './format-vanity';
import { generateRandomLetterCombinations } from './random-letters';

export function generateVanityNumbers(phoneNumber: string, englishWords: Dictionary): string[] {
    const last7Digits = phoneNumber.slice(-7);
    const areaCode = phoneNumber.slice(0, 3);

    const wordMatches = findWordMatches(last7Digits, englishWords);

    if (wordMatches.length > 0) {
        return wordMatches.slice(0, 5).map(match =>
            formatVanityNumber(areaCode, last7Digits, match)
        );
    } else {
        return generateRandomLetterCombinations(areaCode, last7Digits, 5);
    }
}