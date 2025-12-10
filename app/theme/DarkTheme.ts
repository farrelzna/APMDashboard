import type { ThemeTypes } from '@/types/themeTypes/ThemeType';

const DARK_THEME: ThemeTypes = {
    name: 'DARK_THEME',
    dark: true,
    variables: {
        'border-color': '#707a82', // Use a lighter color for borders
    },
    colors: {
        primary: '#0085db', // Can keep the primary color
        secondary: '#46caeb', // Consider a slightly lighter secondary
        info: '#707a82', // Tone down for dark theme
        success: '#4bd08b', // Can keep success color
        warning: '#f8c076', // Consider a less saturated tone
        error: '#ff0000ff', // Can keep error color
        indigo: '#8763da', // Can keep indigo color
        lightprimary: '#46caeb', // Use a darker version of primary
        lightinfo: '#707a82', // Use info color
        lightsecondary: '#46caeb', // Use a darker version of secondary
        lightsuccess: '#707a82', // Use info color
        lighterror: '#993e3e', // Darken error color
        lightwarning: '#f2b264', // Darken warning color
        lightindigo: '#a085d9', // Darken indigo color
        textPrimary: '#fff', // White for better contrast
        textSecondary: '#e5eaef', // Lighter grey for secondary text
        borderColor: '#46caeb', // Use a darker border color
        inputBorder: '#333b47', // Even darker for inputs
        containerBg: '#2a3447', // Dark background for main content
        background: '#111c2d', // Darkest background
        hoverColor: '#333b47', // Darker hover color
        surface: '#2a3447', // Dark surface color
        grey100: '#e5eaef', // Lighter grey for elements
        grey200: '#fff', // White for very light elements
        darkbg: '#111c2d', // Use background color for dark areas
        bglight: '#46caeb', // Use a lighter accent color
        bgdark: '#000000', // True black for darkest areas
    },
};

export { DARK_THEME };