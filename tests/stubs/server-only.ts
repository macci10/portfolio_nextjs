/**
 * `server-only` throws unless resolved under the `react-server` condition, which
 * neither Vitest nor Playwright sets. The guard exists to catch an accidental
 * client import in the app build — it has nothing to say about a test runner
 * importing the loader directly, which is exactly what the content tests do.
 */
export {};
