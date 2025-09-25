// Simple test to verify environment variable loading
console.log('Environment variable test:');
console.log('VITE_OPENWEATHER_API_KEY:', import.meta.env.VITE_OPENWEATHER_API_KEY);
console.log('process.env.VITE_OPENWEATHER_API_KEY:', process.env.VITE_OPENWEATHER_API_KEY);
console.log('All env vars with VITE:', Object.keys(import.meta.env).filter(key => key.includes('VITE')));

export default function testEnv() {
  return {
    hasApiKey: !!import.meta.env.VITE_OPENWEATHER_API_KEY,
    apiKeyLength: import.meta.env.VITE_OPENWEATHER_API_KEY?.length || 0,
    isPlaceholder: import.meta.env.VITE_OPENWEATHER_API_KEY === 'YOUR_API_KEY_HERE'
  };
}