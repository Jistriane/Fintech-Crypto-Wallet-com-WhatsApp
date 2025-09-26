module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/api'],
  moduleNameMapper: {
    '^@common/(.*)$': '<rootDir>/../packages/common/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.api.setup.js'],
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
  coverageDirectory: '../coverage/api',
  testTimeout: 10000 // 10 segundos
};
