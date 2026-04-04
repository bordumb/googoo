const { colors, radii } = require("@googoo/ui");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        accent: colors.accent,
        neutral: colors.neutral,
        success: colors.success,
        error: colors.error,
        warning: colors.warning,
        background: colors.background,
      },
      borderRadius: {
        card: `${radii.card}px`,
        button: `${radii.button}px`,
      },
    },
  },
  plugins: [],
};
