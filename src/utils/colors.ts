/**
 * Generates a random hexadecimal color.
 * @returns {string} Random hexadecimal color.
 */
export const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

/**
 * Generates a random hexadecimal color in dark tones.
 * @returns {string} Random hexadecimal color in dark tones.
 */
export const generateDarkRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * 14) + 1;
        color += letters[randomIndex];
    }
    return color;
};
