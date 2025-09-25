import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const WeatherApp = () => {
  const [weatherData, setWeatherData] = useState(null)
  const [forecastData, setForecastData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [city, setCity] = useState('London') // Default city
  const [inputValue, setInputValue] = useState(city)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [additionalCities, setAdditionalCities] = useState([
    { name: 'New York', country: 'US' },
    { name: 'Tokyo', country: 'JP' },
    { name: 'Sydney', country: 'AU' }
  ])
  const [additionalWeather, setAdditionalWeather] = useState([])

  // Function to fetch weather data
  const fetchWeatherData = async (cityName) => {
    setLoading(true)
    setError(null)
    setShowSuggestions(false) // Hide suggestions after search
    
    try {
      // Log the API key to verify it's loaded correctly (for debugging)
      const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
      console.log('API Key loaded:', API_KEY ? 'Yes' : 'No')
      console.log('API Key length:', API_KEY?.length || 0)
      
      // Check if API key exists and has proper length
      if (!API_KEY || API_KEY.length === 0) {
        // If no API key is provided, use mock data for demonstration
        console.log('Using mock data since no API key was provided. Get your free API key from https://openweathermap.org/api');
        
        // Mock weather data for demonstration
        const mockWeather = {
          name: cityName,
          sys: { country: 'GB' },
          weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
          main: { temp: 22, feels_like: 23, humidity: 65, pressure: 1015, temp_min: 18, temp_max: 25 },
          wind: { speed: 3.5, deg: 180 }
        };
        
        // Create mock forecast data
        const today = new Date();
        const mockForecast = [];
        for (let i = 1; i <= 4; i++) { // 4-day forecast as requested
          const date = new Date(today);
          date.setDate(date.getDate() + i);
          
          const icons = ['01d', '02d', '03d', '04d', '09d', '10d', '11d', '13d', '50d'];
          const descriptions = ['clear sky', 'few clouds', 'scattered clouds', 'broken clouds', 'shower rain', 'rain', 'thunderstorm', 'snow', 'mist'];
          
          mockForecast.push({
            dt: date.getTime() / 1000,
            main: { temp: 22 - Math.floor(Math.random() * 5) },
            weather: [{ 
              icon: icons[Math.floor(Math.random() * icons.length)], 
              description: descriptions[Math.floor(Math.random() * descriptions.length)] 
            }]
          });
        }
        
        setWeatherData(mockWeather);
        setForecastData(mockForecast);
        setLoading(false);
        return;
      }
      
      console.log('Fetching data for city:', cityName);
      
      // Fetch current weather
      const currentWeatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      
      // Fetch forecast
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      
      setWeatherData(currentWeatherResponse.data)
      setForecastData(forecastResponse.data.list.slice(0, 4)) // Get next 4 forecasts as requested
      
      console.log('Weather data fetched successfully', currentWeatherResponse.data);
    } catch (err) {
      console.error('Detailed error:', err.message, err.response ? err.response.status : 'no response', err.response ? err.response.data : 'no data');
      
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 401) {
          setError('Invalid API key. Please verify your OpenWeatherMap API key is correct.');
        } else if (err.response.status === 404) {
          setError('City not found. Please check the city name and try again.');
        } else {
          setError(`Error ${err.response.status}: ${err.response.data.message || 'Failed to fetch weather data'}`);
        }
      } else if (err.request) {
        // Request was made but no response received
        setError('Network error: Unable to connect to weather service. Please check your internet connection.');
      } else {
        // Something else happened
        setError(`Error: ${err.message || 'Failed to fetch weather data'}`);
      }
    } finally {
      setLoading(false)
    }
  }

  // Function to fetch additional city weather
  const fetchAdditionalCityWeather = async (cities) => {
    const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (!API_KEY) return;
    
    const additionalData = [];
    
    for (const city of cities) {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city.name}&appid=${API_KEY}&units=metric`
        );
        additionalData.push({
          ...response.data,
          displayName: city.name
        });
      } catch (err) {
        console.error(`Error fetching weather for ${city.name}:`, err);
      }
    }
    
    setAdditionalWeather(additionalData);
  };

  // Function to fetch city suggestions
  const fetchCitySuggestions = async (input) => {
    if (input.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      // Using OpenWeatherMap's geocoding API for city suggestions
      const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
      if (!API_KEY || API_KEY.length === 0) return

      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=5&appid=${API_KEY}`
      )
      
      if (response.data && Array.isArray(response.data)) {
        setSuggestions(response.data)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (err) {
      console.error('Error fetching city suggestions:', err)
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  useEffect(() => {
    fetchWeatherData(city)
    fetchAdditionalCityWeather(additionalCities)
  }, [city])

  const handleSearch = (e) => {
    e.preventDefault()
    if (inputValue.trim()) {
      setCity(inputValue.trim())
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setInputValue(value)
    
    // Debounce the suggestion fetching to avoid too many API calls
    clearTimeout(window.suggestionTimeout)
    window.suggestionTimeout = setTimeout(() => {
      fetchCitySuggestions(value)
    }, 300)
  }

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.name)
    setCity(suggestion.name)
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (window.suggestionTimeout) {
        clearTimeout(window.suggestionTimeout)
      }
    }
  }, [])

  return (
    <div className="weather-app">
      <div className="app-header">
        <h1>🌤️ Weather App</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input 
            type="text" 
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder="Search for a city..." 
            className="search-input"
            autoComplete="off"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <span>{suggestion.name}</span>
                  <span className="suggestion-country">{suggestion.country}</span>
                </div>
              ))}
            </div>
          )}
          <button type="submit" className="search-button">🔍</button>
        </form>
      </div>
      
      {loading && <div className="loading">Loading weather data...</div>}
      
      {error && <div className="error">{error}</div>}
      
      {!error && weatherData && !loading && (
        <div className="main-content">
          <div className="main-weather-panel">
            <div className="current-weather">
              <div className="location">
                <h2>{weatherData.name}, {weatherData.sys.country}</h2>
                <p className="date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              
              <div className="weather-overview">
                <img 
                  src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`} 
                  alt={weatherData.weather[0].description}
                  className="weather-icon-large"
                />
                <div className="temperature-main">
                  <span className="temp-value">{Math.round(weatherData.main.temp)}°</span>
                </div>
              </div>
              
              <div className="weather-description">
                <p className="description">{weatherData.weather[0].description}</p>
                <div className="temp-range">
                  <span>↑ {Math.round(weatherData.main.temp_max)}°</span>
                  <span>↓ {Math.round(weatherData.main.temp_min)}°</span>
                </div>
              </div>
              
              <div className="weather-details">
                <div className="detail-item">
                  <span className="detail-label">Wind</span>
                  <span className="detail-value">{weatherData.wind.speed} m/s</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Humidity</span>
                  <span className="detail-value">{weatherData.main.humidity}%</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Air Quality</span>
                  <span className="detail-value">Good</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="forecast-panel">
            <h3>4-Day Forecast</h3>
            <div className="forecast-container">
              {forecastData.map((day, index) => (
                <div key={index} className="forecast-day">
                  <div className="forecast-date">{new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <img 
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`} 
                    alt={day.weather[0].description}
                    className="forecast-icon"
                  />
                  <div className="forecast-temp">{Math.round(day.main.temp)}°</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="bottom-cards">
        {additionalWeather.map((weather, index) => (
          <div key={index} className="city-card">
            <div className="city-name">{weather.displayName}</div>
            <img 
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} 
              alt={weather.weather[0].description}
              className="bottom-weather-icon"
            />
            <div className="bottom-temp">{Math.round(weather.main.temp)}°</div>
            <div className="bottom-details">
              <span>Humidity: {weather.main.humidity}%</span>
              <span>Wind: {weather.wind.speed} m/s</span>
            </div>
          </div>
        ))}
      </div>
      
      {!weatherData && !error && !loading && (
        <div className="no-data">
          <p>Please enter your API key in the .env file to see real weather data.</p>
          <p>Get a free API key from: <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer">OpenWeatherMap</a></p>
        </div>
      )}
    </div>
  )
}

export default WeatherApp
