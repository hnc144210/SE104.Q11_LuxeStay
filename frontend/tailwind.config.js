/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#DF6951", // Màu cam đỏ chủ đạo
        secondary: "#F1A501", // Màu vàng
        "text-dark": "#181E4B", // Màu chữ đậm
        "text-light": "#5E6282", // Màu chữ nhạt
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        serif: ["Volkhov", "serif"],
      },
    },
  },
  plugins: [],
};
