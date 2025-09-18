export interface WordData {
    digits: string;
    score: number;
    category: string;
    length: number;
}

export interface Dictionary {
    words: { [word: string]: WordData };
}

export interface WordMatch {
    word: string;
    digits: string;
    score: number;
    position: number;
    length: number;
}

export const KEYPAD_MAP: { [key: string]: string[] } = {
    '2': ['A', 'B', 'C'],
    '3': ['D', 'E', 'F'],
    '4': ['G', 'H', 'I'],
    '5': ['J', 'K', 'L'],
    '6': ['M', 'N', 'O'],
    '7': ['P', 'Q', 'R', 'S'],
    '8': ['T', 'U', 'V'],
    '9': ['W', 'X', 'Y', 'Z']
};