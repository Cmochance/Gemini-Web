/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: [
        // Or if using `src` directory:
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
        },
    },
    corePlugins: {
        preflight: false,
    },
    plugins: [],
};
