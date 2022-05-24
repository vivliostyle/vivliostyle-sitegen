module.exports = {
  testEnvironment: 'jest-environment-node-single-context',
  verbose: true,
  testTimeout: 10000,
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};
