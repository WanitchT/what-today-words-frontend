// tailwind.config.js
module.exports = {
    content: ['./app/**/*.{js,ts,jsx,tsx}'],
    theme: {
      extend: {
        fontFamily: {
          mitr: ['"Mitr"', 'sans-serif'],
          ibmthai: ['"IBM Plex Sans Thai"', 'sans-serif'],
          anuphan: ['"Anuphan"', 'sans-serif'],
        },
      },
    },
    plugins: [],
  };