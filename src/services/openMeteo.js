const BASE_WEATHER_URL = "https://api.open-meteo.com/v1";
const BASE_AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1";
const BASE_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1";

export const fetchHistoricalData = async (lat, lon, startDate, endDate) => {
  // Change dominant_wind_direction to wind_direction_10m_dominant
const url = `${BASE_ARCHIVE_URL}/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,sunrise,sunset,wind_speed_10m_max,wind_direction_10m_dominant&timezone=auto`;

  try {
    const response = await fetch(url);
    const data = await response.json(); // Read the body ONCE here

    if (!response.ok) {
      // This catches the 400 error (e.g., date too recent) and gives the specific reason
      throw new Error(data.reason || "Failed to fetch historical data");
    }
    
    return data;
  } catch (error) {
    console.error("Historical Fetch Error:", error);
    throw error;
  }
};

export const fetchWeatherData = async (lat, lon, date = null) => {
  // If a specific date is picked on Page 1, we use start/end parameters
  const dateParam = date ? `&start_date=${date}&end_date=${date}` : "";

  const weatherUrl = `${BASE_WEATHER_URL}/forecast?latitude=${lat}&longitude=${lon}${dateParam}&hourly=temperature_2m,relative_humidity_2m,precipitation,visibility,wind_speed_10m,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

  const airQualityUrl = `${BASE_AIR_QUALITY_URL}/air-quality?latitude=${lat}&longitude=${lon}&hourly=european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide&timezone=auto`;

  try {
    // Parallel execution for < 500ms performance
    const [weatherRes, aqRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(airQualityUrl)
    ]);

    if (!weatherRes.ok || !aqRes.ok) throw new Error("API calls failed");

    const weatherData = await weatherRes.json();
    const aqData = await aqRes.json();

    // Merge air quality into the main weather object
    return { ...weatherData, air_quality: aqData.hourly };
  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error;
  }
};