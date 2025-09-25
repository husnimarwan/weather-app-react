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
          main: { temp: 22, feels_like: 23, humidity: 65, pressure: 1015 },
          wind: { speed: 3.5 }
        };
        
        // Create mock forecast data
        const today = new Date();
        const mockForecast = [];
        for (let i = 1; i <= 5; i++) {
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
      setForecastData(forecastResponse.data.list.slice(0, 5)) // Get next 5 forecasts
      
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
    setInputValue(`${suggestion.name}, ${suggestion.country}`)
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
      <h1>Weather Forecast App</h1>
      
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-container">
          <input 
            type="text" 
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder="Enter city name" 
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
                  {suggestion.name}, {suggestion.country}
                </div>
              ))}
            </div>
          )}
        </div>
        <button type="submit" className="search-button">Search</button>
      </form>
      
      {loading && <div className="loading">Loading weather data...</div>}
      
      {error && <div className="error">{error}</div>}
      
      {!error && weatherData && !loading && (
        <div className="weather-container">
          <div className="current-weather">
            <h2>{weatherData.name}, {weatherData.sys.country}</h2>
            <div className="weather-main">
              <img 
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`} 
                alt={weatherData.weather[0].description}
                className="weather-icon"
              />
              <div className="temperature">
                {Math.round(weatherData.main.temp)}°C
              </div>
            </div>
            <div className="weather-details">
              <p className="description">{weatherData.weather[0].description}</p>
              <div className="weather-stats">
                <p>Feels like: {Math.round(weatherData.main.feels_like)}°C</p>
                <p>Humidity: {weatherData.main.humidity}%</p>
                <p>Wind: {weatherData.wind.speed} m/s</p>
                <p>Pressure: {weatherData.main.pressure} hPa</p>
              </div>
            </div>
          </div>
          
          {forecastData.length > 0 && (
            <div className="forecast">
              <h3>5-Day Forecast</h3>
              <div className="forecast-container">
                {forecastData.map((day, index) => (
                  <div key={index} className="forecast-day">
                    <p>{new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                    <img 
                      src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`} 
                      alt={day.weather[0].description}
                      className="forecast-icon"
                    />
                    <p>{Math.round(day.main.temp)}°C</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
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
