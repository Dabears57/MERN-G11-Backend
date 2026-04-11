module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.{js,ts}',
    '**/*.{spec,test}.{js,ts}'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/frontend/'
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/frontend/'
  ],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  globalSetup: '<rootDir>/tests/global-setup.js',
  globalTeardown: '<rootDir>/tests/global-teardown.js',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/frontend/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!babel.config.js'
  ],
  coverageDirectory: 'coverage'
};
