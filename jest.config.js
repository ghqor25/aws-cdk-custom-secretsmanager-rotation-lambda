module.exports = {
   testEnvironment: 'node',
   testMatch: ['**/*.test.ts'],
   transform: {
      '\\.ts$': 'ts-jest',
   },
   collectCoverage: true,
   collectCoverageFrom: ['src/**/*.ts'],
};
