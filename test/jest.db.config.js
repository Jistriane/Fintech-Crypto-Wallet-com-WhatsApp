module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/db'],
  moduleNameMapper: {
    '^@common/(.*)$': '<rootDir>/../packages/common/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.db.setup.js'],
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
  coverageDirectory: '../coverage/db',
  testTimeout: 5000 // 5 segundos
};
