export function cleanPhoneNumber(phoneNumber: string): string {
    const digitsOnly = phoneNumber.replace(/[^0-9]/g, '');

    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
        return digitsOnly.substring(1);
    }

    if (digitsOnly.length !== 10) {
        throw new Error(`Invalid phone number length: ${digitsOnly.length} digits`);
    }

    return digitsOnly;
}