module.exports = {
    purge: {
        enabled: process.env.HUGO_ENVIRONMENT === 'production',
        content: [
            './layouts/**/*.html'
        ]
    },
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {},
    },
    variants: {
        extend: {},
    },
    plugins: [],
}
