import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4F654F",
        moss: "#4F654F",
        sage: "#7D8E7A",
        cream: "#EFECE3",
        deepMoss: "#344934",
        primarySoft: "#E2E8DE",
        secondary: "#C68B77",
        tertiary: "#D9B382",
        neutralText: "#5F625C",
        ink: "#1F211E",
        paper: "#F7F6F1",
        surface: "#FBFAF6",
        line: "#D8D6CE",
        muted: "#E9E7DF",
        danger: "#B3261E",
        success: "#4F654F",
        warning: "#A6783A",

        oceanInk: "#063B65",
        oceanDeep: "#052F59",
        oceanBlue: "#0875C1",
        oceanRoyal: "#176BD2",
        aqua: "#08AAA8",
        cyanSoft: "#DDF8FF",
        skySoft: "#EAF7FF",
        oceanSurface: "#F5FCFF",
        oceanLine: "#D7EDF6",
        oceanMuted: "#668298",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        paper: "0 14px 40px rgba(31,33,30,0.06)",
        soft: "0 18px 60px rgba(31,33,30,0.08)",
        ocean: "0 24px 70px rgba(31,111,164,0.14)",
        glow: "0 20px 55px rgba(22,117,193,0.22)",
      },
      borderRadius: {
        xl2: "1.15rem",
      },
    },
  },
  plugins: [],
};

export default config;
