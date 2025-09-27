// Runtime environment variable polyfill
// This script makes runtime environment variables available as if they were build-time variables

// Wait for the window._env_ to be available before setting up the polyfill
function setupEnvironmentPolyfill() {
  if (typeof window === 'undefined') return;

  // Create a polyfill for import.meta.env
  if (window._env_) {
    console.log('Environment variables found:', window._env_); // Debug logging
    
    // Create a script to add the environment variables to the global scope
    const envProxy = new Proxy({}, {
      get: function(target, prop) {
        if (prop === 'VITE_OPENWEATHER_API_KEY') {
          const apiKey = window._env_.VITE_OPENWEATHER_API_KEY || '';
          console.log('Accessing VITE_OPENWEATHER_API_KEY, value length:', apiKey.length); // Debug logging
          return apiKey;
        }
        return undefined;
      }
    });

    // Define import.meta.env only if it doesn't exist
    if (typeof import !== 'undefined' && import.meta && !import.meta.env) {
      console.log('Setting import.meta.env for the first time'); // Debug logging
      Object.defineProperty(import.meta, 'env', {
        value: envProxy,
        writable: false,
        configurable: false
      });
    } else if (typeof import !== 'undefined' && import.meta) {
      // If import.meta already exists but not env, add it
      if (!import.meta.env) {
        console.log('Adding import.meta.env'); // Debug logging
        Object.defineProperty(import.meta, 'env', {
          value: envProxy,
          writable: false,
          configurable: false
        });
      } else {
        console.log('import.meta.env already exists'); // Debug logging
      }
    }

    // Alternative: Add it to globalThis as well for broader compatibility
    if (!globalThis.__vite_env__) {
      globalThis.__vite_env__ = envProxy;
      console.log('Added to globalThis.__vite_env__'); // Debug logging
    } else {
      console.log('globalThis.__vite_env__ already exists'); // Debug logging
    }
  } else {
    // If window._env_ is not available yet, wait for it (with a timeout safety)
    console.log('Environment variables not found immediately, will retry...');
    setTimeout(setupEnvironmentPolyfill, 100);
  }
}

// Execute immediately in case env is already loaded
setupEnvironmentPolyfill();

// Also add a window-level accessor for easier debugging
window.getAPIKey = function() {
  if (window._env_ && window._env_.VITE_OPENWEATHER_API_KEY) {
    return window._env_.VITE_OPENWEATHER_API_KEY;
  }
  return undefined;
};