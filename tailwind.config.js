/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lightcyan: "#dffbf5",
        darkslategray: "#212b36",
        slategray: "#637381",
        white: "#fff",
        mediumseagreen: "#00c897",
        oldlace: "#fff9e6",
        orange: "#f4a100",
        lavenderblush: "#fbeaea",
        firebrick: "#d64545",
      },
      fontFamily: {
        poppins: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};