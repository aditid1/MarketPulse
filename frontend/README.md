# MarketPulse

MarketPulse is an intelligent financial market monitoring and insight platform designed to help users track global stock market movements and identify significant market changes.

## Problem Statement

Financial markets generate large amounts of data, making it difficult for users to continuously monitor important price movements and identify meaningful changes quickly.

MarketPulse simplifies this process by monitoring selected global stocks, analyzing price changes, generating market insights, and highlighting significant movements through an alert system.

## Featurescd frontend

- Real-time stock market monitoring
- Watchlist management
- Market Insights
- Intelligent market alerts
- Historical market tracking
- Significant price movement detection
- Attention level classification for market changes
- Clean and interactive dashboard

## Unique Feature

MarketPulse includes an intelligent alert and attention classification system that analyzes stock price movements and categorizes them based on their significance.

Stocks are classified into different attention levels such as:

- Low Attention
- Medium Attention
- High Attention

This helps users quickly identify important market movements instead of manually analyzing every stock.

## Tech Stack

### Frontend
- React.js
- Vite
- CSS
- JavaScript

### Backend
- Python
- FastAPI
- Uvicorn

## Project Modules

### Dashboard
Provides an overview of market performance and stock movements.

### Watchlist
Allows users to track selected stock symbols.

### Market Insights
Provides meaningful insights based on market price changes.

### Alerts
Detects significant market movements and classifies them according to their attention level.

### History
Stores previous market snapshots so users can analyze historical market changes.

## API Endpoints

- `/stocks` - Fetch current stock data
- `/insights` - Generate market insights
- `/history` - Retrieve market history
- `/alerts` - Retrieve significant market alerts

## How It Works

1. Market data is fetched and processed by the backend.
2. Price changes are calculated for selected stocks.
3. The system analyzes the percentage change.
4. Significant movements are classified into attention levels.
5. Alerts and insights are generated.
6. Market snapshots are stored in history.
7. The React frontend displays the results through an interactive dashboard.

## Screens

- Dashboard
- Watchlist
- Market Insights
- Alerts
- History

## Future Scope

- Integration with live market data APIs
- Personalized user watchlists
- Portfolio tracking
- AI-based market trend prediction
- Email and push notifications
- Advanced analytics and visualizations

## Author

Aditi Dwivedi