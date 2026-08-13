/**
 * Jest config for the backend test suites.
 *
 * Suites are split by what they need to run:
 *   test/unit/        - pure logic, no I/O, no Nest container
 *   test/integration/ - Nest services wired against mocked Prisma/Storage
 *   test/e2e/         - black-box HTTP against a running backend + real DB
 *
 * e2e is excluded from the default `pnpm test` run because it needs a live
 * server and database; run it explicitly with `pnpm test:e2e`.
 */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  roots: ["<rootDir>/test", "<rootDir>/src"],
  testMatch: ["**/*.spec.ts"],
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/test/e2e/"],
  moduleFileExtensions: ["ts", "js", "json"],
  setupFiles: ["<rootDir>/test/jest.setup.ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json", isolatedModules: true }],
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.module.ts",
    "!src/main.ts",
    "!src/**/*.dto.ts",
  ],
  coverageDirectory: "<rootDir>/coverage",
  testTimeout: 15000,
};
