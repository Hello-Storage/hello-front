export const caesarCipher = (text: string, shift: number) => {
    return text.split('').map(char => {
        const code = char.charCodeAt(0);
        // Shift all ASCII codes (from 32 to 126) to create a cipher that includes special characters and numbers.
        if (code >= 32 && code <= 126) {
            // To keep the cipher within printable characters, we subtract 32, add the shift, apply modulo 95, then add 32 back.
            return String.fromCharCode(((code - 32 + shift) % 95) + 32);
        }
        return char;
    }).join('');
};