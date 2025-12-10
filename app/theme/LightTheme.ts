import type { ThemeTypes } from '@/types/themeTypes/ThemeType';

const BLUE_THEME: ThemeTypes = {
    name: 'BLUE_THEME',
    dark: false,
    variables: {
        'border-color': '#e5eaef'
    },
    colors: {
        primary: '#FF5F00',
        secondary: '#707a82',
        info: '#46caeb',
        success: '#4bd08b',
        warning: '#FF5F00',
        error: '#ff0000ff',
        indigo: '#8763da',
        lightprimary: '#e5f3fb',
        lightinfo: '#e1f5fa',
        lightsecondary: '#e7ecf0',
        lightsuccess: '#dffff3',
        lighterror: '#ffede9',
        lightwarning: '#fff6ea',
        lightindigo: '#f1ebff',
        textPrimary: '#2A3547',
        textSecondary: '#2A3547',
        borderColor: '#efeae5ff',
        inputBorder: '#efe5dfff',
        containerBg: '#ffffffff',
        background: '#000000ff',
        hoverColor: '#FF5F00',
        surface: '#fff',
        grey100: '#707a82',
        grey200: '#111c2d',
        darkbg: '#2a3447',
        bglight: '#e0eef7',
        bgdark: '#111c2d'
    }
};


export { BLUE_THEME };
