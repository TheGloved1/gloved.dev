/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  semi: false,
  singleQuote: false,
  jsxSingleQuote: false,
  bracketSpacing: true,
  insertPragma: true,
};

export default config;
