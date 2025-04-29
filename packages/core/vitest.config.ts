import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.{test,spec}.{js,ts}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/**/*.d.ts",
        "src/**/*.test.ts",
        "src/**/*.spec.ts",
      ],
    },
    testTimeout: 10000, // Increased timeout for integration tests
    hookTimeout: 10000,
    isolate: true, // Ensure tests run in isolation to prevent leakage
  },
});
