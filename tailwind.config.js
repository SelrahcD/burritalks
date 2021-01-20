module.exports = {
    purge: {
        enabled: process.env.HUGO_ENVIRONMENT === 'production',
        content: [
            './layouts/**/*.html',
            './content/**/*.html'
        ],
        options: {
            safelist: [
                "type", // [type='checkbox']
            ],
        }
    },
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {},
    },
    variants: {
        extend: {},
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}
