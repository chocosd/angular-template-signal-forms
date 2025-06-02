module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/dist/",
    "<rootDir>/src/test.ts",
  ],
  moduleNameMapper: {
    "^@base/(.*)$": "<rootDir>/src/app/signal-forms/components/base/$1",
    "^@builder/(.*)$": "<rootDir>/src/app/signal-forms/form-builder/$1",
    "^@components/(.*)$": "<rootDir>/src/app/signal-forms/components/$1",
    "^@directives/(.*)$": "<rootDir>/src/app/signal-forms/directives/$1",
    "^@enums/(.*)$": "<rootDir>/src/app/signal-forms/enums/$1",
    "^@models/(.*)$": "<rootDir>/src/app/signal-forms/models/$1",
    "^@renderers/(.*)$":
      "<rootDir>/src/app/signal-forms/components/renderers/$1",
    "^@services/(.*)$": "<rootDir>/src/app/signal-forms/services/$1",
    "^@validators/(.*)$": "<rootDir>/src/app/signal-forms/validators/$1",
    "^@fields/(.*)$": "<rootDir>/src/app/signal-forms/components/fields/$1",
    "^@ui/(.*)$": "<rootDir>/src/app/signal-forms/components/ui/$1",
  },
  moduleDirectories: ["node_modules", "<rootDir>"],
  testEnvironment: "jsdom",
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/app/signal-forms/**/*.ts",
    "!src/app/signal-forms/**/*.spec.ts",
    "!src/app/signal-forms/**/*.module.ts",
    "!src/app/signal-forms/**/index.ts",
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/test/",
    "/dist/",
    "/coverage/",
    "/src/test.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
