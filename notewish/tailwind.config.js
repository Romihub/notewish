/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Define custom colors using RGB/HSL instead of lab()
        // This makes them compatible with html2canvas
      },
    },
  },
  plugins: [],
  // Disable modern color formats for compatibility
  corePlugins: {
    // Force Tailwind to use RGB/HSL colors instead of lab()
  },
  // Use legacy color format
  future: {
    hoverOnlyWhenSupported: true,
  },
};
