import { WordMatch, Dictionary } from './types';

export function findWordMatches(digits: string, englishWords: Dictionary): WordMatch[] {
    const matches: WordMatch[] = [];

    for (const [word, data] of Object.entries(englishWords.words)) {
        const wordDigits = data.digits;
        const position = digits.indexOf(wordDigits);
        if (position !== -1) {
            matches.push({
                word,
                digits: wordDigits,
                score: data.score,
                position,
                length: data.length
            });
        }
    }

    return matches.sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        if (a.length !== b.length) return b.length - a.length;
        return a.position - b.position;
    });
}