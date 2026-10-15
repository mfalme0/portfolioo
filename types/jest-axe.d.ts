/**
 * `jest-axe` ships no type declarations, and `@types/jest-axe` targets Jest
 * globals rather than Vitest.
 *
 * Only the matcher is declared here. Extending Vitest's `Assertion` interface
 * would require augmenting the "vitest" module, and a `declare module "vitest"`
 * block in a file this way *replaces* the module rather than merging with it
 * — which silently strips `describe`, `it` and `expect` from every import in
 * the project. That failure mode is worth the comment.
 *
 * Tests use the custom matcher via the global `expect` set up in
 * vitest.setup.ts, typed by adding `"types": ["vitest/globals"]` plus this
 * file to tsconfig.
 */
declare module "jest-axe" {
  export interface AxeViolation {
    id: string;
    impact?: string | null;
    tags: string[];
    description: string;
    help: string;
    helpUrl: string;
    nodes: Array<Record<string, unknown>>;
  }

  export function axe(
    context?: unknown,
    options?: Record<string, unknown>,
    config?: unknown,
  ): Promise<{
    violations: AxeViolation[];
    passes: unknown[];
    incomplete: unknown[];
    inapplicable: unknown[];
    testEngine: { name: string; version: string };
    url?: string;
    timestamp?: string;
  }>;

  export function configureAxe(options: Record<string, unknown>): void;

  export function getViolations(
    results: { violations: AxeViolation[] },
    impact?: string | null,
  ): AxeViolation[];

  export const toHaveNoViolations: unknown;
}