import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Smoky BBQ palette
        smoke: "#1a1512",
        ember: "#c1440e",
        flame: "#e8722a",
        brisket: "#8b3a1e",
        cream: "#f5efe4",
        char: "#2b241f",
        bark: "#4a3427",
      },
      fontFamily: {
        display: ['"Rye"', "Georgia", "serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
