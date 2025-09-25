import { useState, useEffect } from 'react';
import './App.css';

// Test environment variables
const { hasApiKey, apiKeyLength, isPlaceholder } = (function testEnv() {
  return {
    hasApiKey: !!import.meta.env.VITE_OPENWEATHER_API_KEY,
    apiKeyLength: import.meta.env.VITE_OPENWEATHER_API_KEY?.length || 0,
    isPlaceholder: import.meta.env.VITE_OPENWEATHER_API_KEY === 'YOUR_API_KEY_HERE'
  };
})();

function TestApp() {
  const [status, setStatus] = useState('Checking environment...');
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Environment check:', { hasApiKey, apiKeyLength, isPlaceholder });
    console.log('API Key (first 10 chars):', import.meta.env.VITE_OPENWEATHER_API_KEY?.substring(0, 10));
    
    if (!hasApiKey) {
      setStatus('ERROR: No API key found. Check your .env file and restart the server.');
      return;
    }
    
    if (isPlaceholder) {
      setStatus('ERROR: Using placeholder API key. Update your .env file.');
      return;
    }
    
    if (apiKeyLength !== 32) {
      setStatus(`WARNING: API key length is ${apiKeyLength}, expected 32. Check your API key format.`);
      return;
    }
    
    setStatus('API key looks valid, testing connection...');
    
    // Test with a simple API call
    const testApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=London&appid=${testApiKey}&units=metric`)
      .then(response => {
        console.log('Response status:', response.status);
        if (response.status === 401) {
          setStatus('ERROR: API key is invalid or unauthorized (401). Please verify your API key in .env file.');
          throw new Error('Unauthorized');
        } else if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('API call successful:', data);
        setStatus('SUCCESS: API call successful!');
      })
      .catch(err => {
        console.error('API call failed:', err);
        setError(err.message);
        setStatus('ERROR: API call failed. Check browser console for details.');
      });
  }, []);

  return (
    <div className="weather-app">
      <h1>Weather App - API Test</h1>
      <div className="weather-container">
        <h2>Environment Check</h2>
        <p>Has API key: {hasApiKey ? 'YES' : 'NO'}</p>
        <p>API key length: {apiKeyLength}</p>
        <p>Is placeholder: {isPlaceholder ? 'YES' : 'NO'}</p>
        <p>API key (first 10 chars): {import.meta.env.VITE_OPENWEATHER_API_KEY?.substring(0, 10)}</p>
        
        <h2>Test Status</h2>
        <p>{status}</p>
        {error && <p style={{color: 'red'}}>Error: {error}</p>}
        
        <h2>Troubleshooting Steps</h2>
        <ol>
          <li>Verify your API key is 32 characters long</li>
          <li>Make sure the .env file is in the project root</li>
          <li>Ensure the server was restarted after changing .env</li>
          <li>Check if the API key has the proper permissions in OpenWeatherMap</li>
        </ol>
      </div>
    </div>
  );
}

export default TestApp;