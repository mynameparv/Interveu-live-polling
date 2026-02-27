/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    light: '#7765DA',
                    DEFAULT: '#5757D0',
                    dark: '#4F00C1',
                },
                background: '#F9F9F9',
                surface: '#FFFFFF',
                text: {
                    dark: '#373737',
                    light: '#B5B5B5',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
