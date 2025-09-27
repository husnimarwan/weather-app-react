#!/bin/sh

# Create a small script to inject environment variables at runtime into the JavaScript
# This allows dynamic environment variables to be available at runtime

# First, check if we have environment variables to inject
if [ ! -z "$VITE_OPENWEATHER_API_KEY" ]; then
  echo "/* Generated environment variables */" > /usr/share/nginx/html/env-config.js
  echo "window._env_ = window._env_ || {};" >> /usr/share/nginx/html/env-config.js
  echo "window._env_.VITE_OPENWEATHER_API_KEY = '$VITE_OPENWEATHER_API_KEY';" >> /usr/share/nginx/html/env-config.js
else
  # If no API key is provided, we still create the config with an empty value
  # The app has fallback logic for missing API keys
  echo "/* Generated environment variables */" > /usr/share/nginx/html/env-config.js
  echo "window._env_ = window._env_ || {};" >> /usr/share/nginx/html/env-config.js
  echo "window._env_.VITE_OPENWEATHER_API_KEY = '';" >> /usr/share/nginx/html/env-config.js
fi

# Start nginx
exec nginx -g 'daemon off;'