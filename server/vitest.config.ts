import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    testTimeout: 10000,
    hookTimeout: 30000, // Increased to accommodate serialized DB cleanup with advisory locks
    threads: true, // Use worker threads for isolation
    maxThreads: 4, // Limit to 4 threads to reduce lock contention
    minThreads: 1,
  },
});
