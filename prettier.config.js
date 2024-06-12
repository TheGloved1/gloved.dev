/** @type {import('prettier').Config} */
const config = {
  plugins: [require("prettier-plugin-tailwindcss")],
  semi: false,
  singleQuote: false,
  jsxSingleQuote: false,
  bracketSpacing: true,
  insertPragma: true,
};

export default config;
