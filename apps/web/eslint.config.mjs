import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  { ignores: ["components/ui/**/*", "components/data-table/**/*"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // {
  //   files: ["components/ui/**/*", "components/data-table/**/*"],
  //   rules: {
  //     "@typescript-eslint/ban-ts-comment": "off",
  //   },
  // },
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off", // disables 'any' usage warning
    },
  },
];

export default eslintConfig;
