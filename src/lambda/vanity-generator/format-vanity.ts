import { WordMatch } from './types';

export function formatVanityNumber(areaCode: string, digits: string, match: WordMatch): string {
    const { word, position, length } = match;
    const before = digits.slice(0, position);
    const after = digits.slice(position + length);

    let parts = [areaCode];
    if (before.length > 0) parts.push(before);
    parts.push(word);
    if (after.length > 0) parts.push(after);

    return parts.join('-');
}