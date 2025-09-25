# Weather App React

A beautiful and responsive weather application built with React and Vite that displays current weather conditions and forecasts.

## Features

- Current weather conditions (temperature, humidity, wind, pressure)
- 5-day weather forecast
- Search for weather in different cities
- Responsive design for all devices
- Beautiful UI with gradient backgrounds and modern styling

## Setup

1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Clone this repository
3. Install dependencies: `npm install`
4. Create a `.env` file in the root directory with your API key:
   ```
   VITE_OPENWEATHER_API_KEY=your_actual_api_key_here
   ```
5. Start the development server: `npm run dev`

## Technologies Used

- React
- Vite
- Axios
- OpenWeatherMap API
- CSS3 with Flexbox/Grid

## API Usage

This app uses the OpenWeatherMap API to fetch real weather data. You can find more information about the API endpoints used:
- Current weather: `/data/2.5/weather`
- 5-day forecast: `/data/2.5/forecast`

## Contributing

Feel free to submit issues or pull requests to improve the application.
