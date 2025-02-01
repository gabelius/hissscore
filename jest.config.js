export default {
  transform: {
    '^.+\\.js$': ['babel-jest', { configFile: './babel.config.js' }]
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['js'],
  verbose: true,
  testMatch: ['**/test/**/*.spec.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(module-that-needs-to-be-transformed)/)'
  ]
};