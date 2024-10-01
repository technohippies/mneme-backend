console.log('Loading environment variables in config/environment.ts...');
console.log('VALKEY_HOST:', process.env.VALKEY_HOST);
console.log('VALKEY_PORT:', process.env.VALKEY_PORT);
console.log('VALKEY_PASSWORD:', process.env.VALKEY_PASSWORD ? '[SET]' : '[NOT SET]');

export const config = {
  valkeyHost: process.env.VALKEY_HOST || 'localhost',
  valkeyPort: parseInt(process.env.VALKEY_PORT || '6379', 10),
  valkeyPassword: process.env.VALKEY_PASSWORD || '',
};

console.log('Config loaded:', JSON.stringify(config, null, 2));