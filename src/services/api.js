import axios from 'axios';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const AQI_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export const fetchWeatherForecast = async (lat, lon, date = null, timezone = "auto") => {
  const params = {
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
    hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,visibility,wind_speed_10m,wind_direction_10m,uv_index',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant',
    timezone,
  };
  
  if (date) {
    params.start_date = date;
    params.end_date = date;
  } else {
    params.past_days = 0;
    params.forecast_days = 5;
  }

  const response = await axios.get(FORECAST_URL, { params });
  return response.data;
};

export const fetchAirQuality = async (lat, lon, date = null, timezone = "auto") => {
  const params = {
    latitude: lat,
    longitude: lon,
    current: 'european_aqi,pm10,pm2_5,carbon_monoxide,carbon_dioxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,uv_index,uv_index_clear_sky',
    hourly: 'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,european_aqi,ozone',
    timezone
  };

  if (date) {
    params.start_date = date;
    params.end_date = date;
  }

  const response = await axios.get(AQI_URL, { params });
  return response.data;
};

export const fetchHistoricalWeather = async (lat, lon, startDate, endDate, timezone = "auto") => {
  const response = await axios.get(ARCHIVE_URL, {
    params: {
      latitude: lat,
      longitude: lon,
      start_date: startDate, // "YYYY-MM-DD"
      end_date: endDate,
      daily: 'temperature_2m_max,temperature_2m_min,temperature_2m_mean,sunrise,sunset,precipitation_sum,rain_sum,snowfall_sum,wind_speed_10m_max,wind_direction_10m_dominant',
      timezone
    }
  });
  return response.data;
};

export const fetchHistoricalAirQuality = async (lat, lon, startDate, endDate, timezone = "auto") => {
  const response = await axios.get(AQI_URL, {
    params: {
      latitude: lat,
      longitude: lon,
      start_date: startDate,
      end_date: endDate,
      hourly: 'pm10,pm2_5', // Only fetch what's needed for history trends to optimize performance
      timezone
    }
  });
  return response.data;
};

export const fetchLocationName = async (lat, lon) => {
  // We can use a free reverse geocoding API or Open-Meteo's geocoding to find nearest city.
  // Actually, Open-Meteo Geocoding API requires text search. 
  // For reverse geocoding, we can use bigdatacloud free tier without API key for simplicity.
  try {
    const res = await axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    return res.data.city || res.data.locality || res.data.principalSubdivision || "Unknown Location";
  } catch (err) {
    return "Unknown Location";
  }
};
