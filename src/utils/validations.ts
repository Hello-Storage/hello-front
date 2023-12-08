/**
 * Checks if a string is a valid email address.
 * @param {string} email - The string to be checked.
 * @returns {boolean} Returns true if the string is a valid email address, otherwise false.
 */
export const isValidEmail = (email: string | undefined): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email) {
        return emailRegex.test(email);
    }
    return false
};
