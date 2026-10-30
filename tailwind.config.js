/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        muted: "#667085",
        canvas: "#f6f7fb",
        brand: "#5146e5",
        "brand-dark": "#4036c9",
        line: "#e7e9f0",
      },
      boxShadow: {
        card: "0 12px 40px rgba(27, 35, 67, 0.06)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
