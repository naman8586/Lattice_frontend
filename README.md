# Weather Insights Dashboard

A powerful, highly responsive, and meticulously designed React Weather application that leverages the Open-Meteo API to bring users real-time weather information, detailed hourly forecasts, and extensive historical environmental trends up to 2 years back.

## 🌟 Key Features

*   **Location Inference**: Automatically detects user location (latitude/longitude) via browser Geolocation on landing for instant hyper-localized data.
*   **Comprehensive Current Metrics**: Displays detailed live conditions including Temperature, Precipitation, Humidity, UV Index, Sun Cycle (Sunrise/Sunset), Wind Speed, and specific Air Quality values (CO, CO2, NO2, SO2, PM10, PM2.5).
*   **Dynamic Hourly Visualizations**: Features six beautifully designed `Recharts` area and line graphs mapping out exactly 24 hours of data. Includes interactive horizontal scrolling and zoom brushes for tracking trends.
*   **Customizable Chart Units**: Toggle seamlessly between Celsius (°C) and Fahrenheit (°F) scales on the hourly temperature chart.
*   **Historical Trends Analysis**: Dedicated page to fetch, aggregate, and visualize up to two years of daily weather and Air Quality (peak PM10 / PM2.5) data.
*   **Adaptive Theming**: Fully integrated Light and Dark mode using Tailwind's v4 class-based toggle system that respects the design aesthetics perfectly across both modes.
*   **Mobile First**: The UI elegantly adapts to any screen size. Desktop offers sidebars and extended views, while mobile switches to bottom-navigation bars and horizontally scrollable flex-containers to maintain native-app UX.

## 🛠 Tech Stack

*   **Framework**: [ReactJS 18](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Charting**: [Recharts](https://recharts.org/) (AreaChart, BarChart, LineChart)
*   **Icons & Animation**: [Lucide React](https://lucide.dev/) + [Framer Motion](https://www.framer.com/motion/)
*   **Data APIs**: [Open-Meteo](https://open-meteo.com) (Forecast, Air Quality, and Archive Endpoints)
*   **Date Utility**: `date-fns`

## 🗂 Project Structure

```text
src/
├── components/          # Reusable UI components
│   ├── charts/
│   │   └── HourlyChart.jsx
│   ├── common/
│   │   └── Navbar.jsx
│   └── weather/
│       └── WeatherCard.jsx
├── hooks/               # Custom React hooks (Geolocation)
│   ├── useGeolocation.js
│   └── useLocation.js
├── pages/               # Main page routing components
│   ├── Dashboard.jsx
│   └── Historical.jsx
├── services/            # API integration files
│   └── api.js
├── App.jsx              # Main router & layout entry point
├── index.css            # Tailwind V4 configuration
└── main.jsx             # React DOM renderer
```

## 🚀 Getting Started

To run this project locally:

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/Lattice_frontend.git
    cd Lattice_frontend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

4.  **View in Browser**
    Open `http://localhost:5173/` in your browser. (Accept the location API prompt to automatically pull your local weather data).

## ⚡ Performance
The app is engineered to execute all Open-Meteo endpoint API queries via optimized `Promise.all` concurrency, ensuring the entire dataset loads well within the `<500ms` technical requirement target.
