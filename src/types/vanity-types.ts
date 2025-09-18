export interface VanityNumber {
    original: string;
    vanity: string;
    score: number;
}

export interface VanityRecord {
    phoneNumber: string;
    vanityNumbers: VanityNumber[];
    createdAt: string;
    ttl?: number;
}