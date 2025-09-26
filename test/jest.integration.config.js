module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/integration'],
  moduleNameMapper: {
    '^@common/(.*)$': '<rootDir>/../packages/common/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/*.d.ts'
  ],
  coverageDirectory: '../coverage/integration',
  testTimeout: 30000 // 30 segundos
};
