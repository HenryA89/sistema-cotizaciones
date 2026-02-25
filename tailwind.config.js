/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary-green": "#172A41",
        "accent-orange": "#F3B056",
        "accent-cyan": "#26B7C8",
        "cream-bg": "#F2F1E7",
        "text-primary": "#172A41",
        "text-muted": "#6B7280",
        "border-subtle": "#E5E7EB",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".btn-primary": {
          backgroundColor: "#172A41",
          color: "#FFFFFF",
          padding: "0.5rem 1.5rem",
          borderRadius: "0.75rem",
          fontWeight: "700",
          fontSize: "0.625rem",
          textTransform: "uppercase",
          transition: "all 0.2s",
          "&:hover": {
            backgroundColor: "#26B7C8",
          },
        },
        ".btn-accent": {
          backgroundColor: "#26B7C8",
          color: "#172A41",
          padding: "0.5rem 2rem",
          borderRadius: "0.75rem",
          fontWeight: "700",
          fontSize: "0.625rem",
          textTransform: "uppercase",
          boxShadow: "0 10px 15px -3px rgba(38, 183, 200, 0.3)",
          transition: "all 0.2s",
          "&:hover": {
            backgroundColor: "#F3B056",
          },
        },
        ".no-print": {
          "@media print": {
            display: "none !important",
          },
        },
        ".animate-in": {
          animation: "fadeIn 0.3s ease-in-out",
        },
        ".fade-in": {
          animation: "fadeIn 0.3s ease-in-out",
        },
      };

      addUtilities(newUtilities);
    },
  ],
};
