import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set up global test environment
global.beforeAll(() => {
  // Setup code that runs before all tests
  console.log('Setting up test environment...');
});

global.afterAll(() => {
  // Cleanup code that runs after all tests
  console.log('Cleaning up test environment...');
});
