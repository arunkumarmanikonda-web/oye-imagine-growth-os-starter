import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
    tsconfigRaw: {
      compilerOptions: {
        jsx: "react-jsx",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    setupFiles: ["./tests/setup/node.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
});