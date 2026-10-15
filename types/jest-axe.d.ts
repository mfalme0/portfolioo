// `jest-axe` ships no type declarations and `@types/jest-axe` targets Jest
// globals (not Vitest). Declared as an ambient module so the Vitest setup can
// call `expect.extend(toHaveNoViolations)` without an implicit-any error.
declare module "jest-axe";
