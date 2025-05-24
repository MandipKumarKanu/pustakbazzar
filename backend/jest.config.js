module.exports = {
  testEnvironment: 'node',
  testTimeout: 10000, // Optional: Increase timeout for API tests
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ['controllers/**/*.js', 'routes/**/*.js', 'middleware/**/*.js'],
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
};
