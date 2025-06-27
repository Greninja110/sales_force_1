# Sales Dashboard Analyzer

An interactive sales dashboard and forecasting tool built with a Python FastAPI backend and React frontend. This project analyzes the Superstore Sales Dataset to provide visualizations, trends, and forecasts.

## Features

- **Sales Dashboard**: Overview of key metrics, trends, and KPIs
- **Sales Analysis**: Detailed sales trends by time periods with filtering options
- **Regional Analysis**: Geographic breakdown of sales performance
- **Product Analysis**: Product and category performance metrics
- **Sales Forecasting**: Statistical forecasting of future sales with confidence intervals
- **Interactive Visualizations**: Responsive charts and graphs for data exploration

## Tech Stack

### Backend
- **FastAPI**: High-performance API framework
- **SQLite**: Lightweight database for storing sales data
- **Pandas**: Data manipulation and analysis
- **Statsmodels/Prophet**: Statistical forecasting
- **Docker**: Containerization for consistent environments

### Frontend
- **React**: UI library for building interactive interfaces
- **Recharts**: Responsive charting library
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests

## Project Structure

```
sales-dashboard/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # Entry point
│   │   ├── database.py      # Database connection
│   │   ├── config.py        # Configuration settings
│   │   ├── models/          # Data models
│   │   │   ├── __init__.py
│   │   │   └── schemas.py
│   │   ├── routers/         # API routes
│   │   │   ├── __init__.py
│   │   │   ├── sales.py
│   │   │   └── forecasts.py
│   │   ├── services/        # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── data_service.py
│   │   │   └── forecast_service.py
│   │   ├── utils/           # Utility functions
│   │   │   ├── __init__.py
│   │   │   ├── logger.py
│   │   │   └── helpers.py
│   │   └── logs/            # Log files directory
│   ├── requirements.txt     # Python dependencies
│   └── README.md
├── frontend/                # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── charts/
│   │   │   │   ├── SalesChart.jsx
│   │   │   │   ├── RegionalMap.jsx
│   │   │   │   ├── ForecastChart.jsx
│   │   │   │   └── CategoryBreakdown.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── KPICard.jsx
│   │   │   │   ├── FilterPanel.jsx
│   │   │   │   └── StatCard.jsx
│   │   │   └── common/
│   │   │       ├── Button.jsx
│   │   │       ├── Dropdown.jsx
│   │   │       └── DateRangePicker.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SalesAnalysis.jsx
│   │   │   ├── RegionalAnalysis.jsx
│   │   │   ├── ProductAnalysis.jsx
│   │   │   └── Forecasting.jsx
│   │   ├── services/        # API services
│   │   │   ├── api.js
│   │   │   └── dataService.js
│   │   ├── utils/           # Utility functions
│   │   │   ├── dateUtils.js
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   └── index.css        # Tailwind imports
│   ├── package.json
│   ├── tailwind.config.js
│   └── README.md
├── data/                    # Data directory
│   └── superstore.csv       # The dataset
├── Dockerfile
├── docker-compose.yml
└── README.md                # Project documentation
```

## Setup and Installation

### Prerequisites

- Docker and Docker Compose
- Superstore Sales Dataset (placed in the `data` directory)

### Using Docker Compose

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd sales-dashboard
   ```

2. Place the Superstore Sales Dataset in the `data` directory:
   ```bash
   mkdir -p data
   # Copy the dataset to data/superstore.csv
   ```

3. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/api/docs

### Manual Setup (Development)

#### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

#### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## API Endpoints

### Sales Endpoints

- `GET /api/sales/dashboard`: Get complete dashboard data
- `GET /api/sales/summary`: Get sales summary
- `GET /api/sales/by-category`: Get sales breakdown by category
- `GET /api/sales/by-region`: Get sales breakdown by region
- `GET /api/sales/time-series`: Get sales time series data
- `GET /api/sales/top-products`: Get top-selling products

### Forecast Endpoints

- `GET /api/forecasts/sales`: Generate a sales forecast
- `GET /api/forecasts/by-category`: Generate forecasts for each product category
- `GET /api/forecasts/by-region`: Generate forecasts for each region
- `GET /api/forecasts/seasonality`: Analyze sales seasonality

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [Recharts](https://recharts.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prophet](https://facebook.github.io/prophet/)