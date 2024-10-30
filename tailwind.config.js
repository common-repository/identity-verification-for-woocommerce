module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontSize: {
        xs: ".75em",
        sm: ".875em",
        tiny: ".875em",
        base: "1em",
        lg: "1.125em",
        xl: "1.25em",
        "2xl": "1.5em",
        "3xl": "1.875em",
        "4xl": "2.25em",
        "5xl": "3em",
        "6xl": "4em",
        "7xl": "5em",
      },
    },
  },
  plugins: [],
  prefix: "ri-",
  important: true,
  corePlugins: {
    preflight: false,
  },
};
