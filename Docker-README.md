# Docker Deployment Guide for Weather App

This repository contains a React-based weather application that has been containerized with Docker. The application can be easily deployed using Docker or Docker Compose.

## Docker Hub Image
The image is available on Docker Hub at: `husnimarwan/weather-app-react`

Tags available:
- `latest` - Latest version of the application
- `v1.0.0` - Stable version 1.0.0
- `v1.0.1` - Fixed version with improved environment variable handling

## Running with Docker

### Basic Usage
```bash
docker run -p 8080:80 husnimarwan/weather-app-react:latest
```

### With OpenWeatherMap API Key (Recommended)
```bash
docker run -p 8080:80 -e VITE_OPENWEATHER_API_KEY=your_api_key_here husnimarwan/weather-app-react:latest
```

Replace `your_api_key_here` with your actual OpenWeatherMap API key. The app will work with mock data if no API key is provided, but using a real API key will provide live weather data.

The application will be accessible at `http://localhost:8080`.

## Running with Docker Compose

Create a `docker-compose.yml` file or use the existing one in this repository:

```yaml
version: '3.8'

services:
  weather-app:
    image: husnimarwan/weather-app-react:latest
    ports:
      - "8080:80"
    environment:
      - VITE_OPENWEATHER_API_KEY=your_api_key_here
    restart: unless-stopped
```

Then run:
```bash
docker-compose up -d
```

## Environment Variables

- `VITE_OPENWEATHER_API_KEY`: OpenWeatherMap API key (optional but recommended)

## Ports

- Port 80 is exposed for the web application
- Maps to port 8080 on the host by default

## Features

- Real-time weather data (with API key)
- 4-day weather forecast
- City search functionality
- Responsive design
- Uses OpenWeatherMap API
- Supports mock data when no API key is provided

## Note on Environment Variables

Version 1.0.1 includes an improved runtime environment variable handling system that ensures API keys are properly loaded in the browser environment. This addresses potential timing issues where the API key might not be available when the application starts.