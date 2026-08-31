import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "scripts/verify-sources.test.ts",
      "scripts/create-review-record.integration.test.ts",
      "src/data/questionSets/activation.integration.test.ts",
    ],
    testTimeout: 120_000,
  },
});
