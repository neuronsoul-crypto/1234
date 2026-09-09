import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1F2933",
        accent: "#2563EB",
      },
    },
  },
  plugins: [],
};

export default config;
