import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        sunflower: {
          darkGreen: "#000000",
          mediumGreen: "#1E5128",
          lightGreen: "#4E9F3D",
          yellow: "#FFC93C",
          gold: "#F4B41A",
          cream: "#F8F9FA",
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
