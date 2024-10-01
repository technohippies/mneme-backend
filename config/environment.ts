export const config = {
  // ... other config options ...
  valkeyHost: process.env.VALKEY_HOST || 'localhost',
  valkeyPort: parseInt(process.env.VALKEY_PORT || '6379', 10),
};