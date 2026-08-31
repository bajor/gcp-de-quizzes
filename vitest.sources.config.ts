import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["scripts/verify-sources.test.ts"],
    testTimeout: 120_000,
  },
});
