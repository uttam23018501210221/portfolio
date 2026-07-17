/** @type {import('tailwindcss').Config} */
module.exports = {
  // Only scan the single HTML file — keeps the output tiny and fully purged.
  content: ["./index.html"],
  // Disable Preflight: the site already ships its own reset/design system,
  // so Tailwind is layered on top as additive utilities without clobbering it.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      // Mirror the existing CSS custom properties so utilities match the brand.
      colors: {
        paper: "#f7f6f3",
        ink: { DEFAULT: "#16141a", soft: "#524e58" },
        rose: { DEFAULT: "#e0446b", deep: "#a8294a", tint: "#fbe9ef" },
        night: { DEFAULT: "#171420", card: "#211d2c", text: "#efecf4", soft: "#aaa4b8" },
        line: "#e5e1d9",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        body: ['"Instrument Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
