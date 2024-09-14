import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:9000',
    defaultCommandTimeout: 10000,
    supportFile: false,
  },
});
