/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef4ff",
          100: "#d9e7ff",
          500: "#1c4b82",
          700: "#122f52",
          800: "#0d223d",
          900: "#071a31",
        },
        workshop: {
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
      },
      boxShadow: {
        soft: "0 18px 50px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
