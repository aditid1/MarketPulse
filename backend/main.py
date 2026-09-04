from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from datetime import datetime

app = FastAPI()

# In-memory user watchlist
stocks = ["AAPL", "GOOGL", "MSFT", "TSLA"]
market_history = []

# In-memory alert history
alert_history = []


# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"message": "Market Pulse API is running"}


@app.get("/stock/{symbol}")
def get_stock(symbol: str):
    stock = yf.Ticker(symbol)
    data = stock.history(period="2d")

    if data.empty or len(data) < 2:
        return {"error": "Invalid stock symbol or insufficient data"}

    current_price = round(float(data["Close"].iloc[-1]), 2)
    previous_price = round(float(data["Close"].iloc[-2]), 2)

    change = round(current_price - previous_price, 2)
    change_percent = round((change / previous_price) * 100, 2)

    return {
        "symbol": symbol.upper(),
        "current_price": current_price,
        "previous_price": previous_price,
        "change": change,
        "change_percent": change_percent
    }


@app.get("/watchlist")
def get_watchlist():

    result = []

    for symbol in stocks:
        try:
            stock = yf.Ticker(symbol)
            data = stock.history(period="2d")

            if data.empty or len(data) < 2:
                continue

            current_price = round(float(data["Close"].iloc[-1]), 2)
            previous_price = round(float(data["Close"].iloc[-2]), 2)

            change = round(current_price - previous_price, 2)

            change_percent = round(
                (change / previous_price) * 100,
                2
            )

            # Smart meaningful change detection
            if abs(change_percent) >= 3:
                status = "significant"
                attention_level = "high"

                if change_percent > 0:
                    reason = (
                        "Price moved more than 3%, indicating strong upward "
                        "market momentum and requiring immediate attention."
                    )
                else:
                    reason = (
                        "Price dropped more than 3%, indicating significant "
                        "downward movement and potential market risk."
                    )

            elif abs(change_percent) >= 1:
                status = "moderate"
                attention_level = "medium"

                if change_percent > 0:
                    reason = (
                        "Price increased noticeably and is worth monitoring."
                    )
                else:
                    reason = (
                        "Price declined noticeably and should be monitored."
                    )

            else:
                status = "stable"
                attention_level = "low"

                reason = (
                    "Price movement is within the normal range and does not "
                    "require immediate attention."
                )

            # Add meaningful movements to alert history
            if status in ["significant", "moderate"]:

                alert_exists = any(
                    alert["symbol"] == symbol
                    and alert["status"] == status
                    and alert["change_percent"] == change_percent
                    for alert in alert_history
                )

                if not alert_exists:
                    alert_history.insert(0, {
                        "symbol": symbol,
                        "status": status,
                        "change_percent": change_percent,
                        "reason": reason,
                        "detected_at": datetime.now().strftime(
                            "%d %b %Y, %I:%M %p"
                        )
                    })

            result.append({
                "symbol": symbol,
                "current_price": current_price,
                "previous_price": previous_price,
                "change": change,
                "change_percent": change_percent,
                "status": status,
                "attention_level": attention_level,
                "reason": reason
            })

        except Exception as e:
            print(f"Error fetching {symbol}: {e}")

    # Save current watchlist snapshot in history
    if result:
        market_history.append({
            "checked_at": datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
            "stocks": result.copy()
        })

        # Keep only latest 20 history records
        if len(market_history) > 20:
            market_history.pop(0)

    return result




# Clear alert history
@app.delete("/history")
def clear_alert_history():

    alert_history.clear()

    return {
        "message": "Alert history cleared successfully"
    }


@app.post("/watchlist/{symbol}")
def add_to_watchlist(symbol: str):

    symbol = symbol.upper()

    if symbol in stocks:
        return {
            "message": f"{symbol} is already in your watchlist"
        }

    stock = yf.Ticker(symbol)
    data = stock.history(period="5d")

    if data.empty:
        return {
            "error": "Invalid stock symbol"
        }

    stocks.append(symbol)

    return {
        "message": f"{symbol} added successfully",
        "watchlist": stocks
    }


@app.delete("/watchlist/{symbol}")
def remove_from_watchlist(symbol: str):

    symbol = symbol.upper()

    if symbol not in stocks:
        return {
            "error": f"{symbol} is not in your watchlist"
        }

    stocks.remove(symbol)

    return {
        "message": f"{symbol} removed successfully",
        "watchlist": stocks
    }


@app.get("/insights")
def get_market_insights():

    result = []

    for symbol in stocks:
        try:
            stock = yf.Ticker(symbol)
            data = stock.history(period="2d")

            if data.empty or len(data) < 2:
                continue

            current_price = round(float(data["Close"].iloc[-1]), 2)
            previous_price = round(float(data["Close"].iloc[-2]), 2)

            change_percent = round(
                (
                    (current_price - previous_price)
                    / previous_price
                ) * 100,
                2
            )

            # Generate smart recommendation
            if change_percent >= 3:
                status = "significant"
                recommendation = (
                    "Strong upward movement detected. Review recent market "
                    "developments before making an investment decision."
                )

            elif change_percent <= -3:
                status = "significant"
                recommendation = (
                    "Significant downward movement detected. Check recent "
                    "news and assess potential market risk."
                )

            elif abs(change_percent) >= 1:
                status = "moderate"

                if change_percent > 0:
                    recommendation = (
                        "Moderate upward movement detected. Keep monitoring "
                        "this stock for further momentum."
                    )
                else:
                    recommendation = (
                        "Moderate downward movement detected. Monitor the "
                        "stock for further decline or recovery."
                    )

            else:
                status = "stable"
                recommendation = (
                    "Movement is within the normal range. No immediate "
                    "action is required."
                )

            result.append({
                "symbol": symbol,
                "current_price": current_price,
                "change_percent": change_percent,
                "status": status,
                "recommendation": recommendation
            })

        except Exception as e:
            print(f"Error fetching insight for {symbol}: {e}")

    if not result:
        return {
            "error": "Unable to fetch market data"
        }

    top_gainer = max(
        result,
        key=lambda stock: stock["change_percent"]
    )

    top_loser = min(
        result,
        key=lambda stock: stock["change_percent"]
    )

    positive_stocks = len([
        stock for stock in result
        if stock["change_percent"] > 0
    ])

    negative_stocks = len([
        stock for stock in result
        if stock["change_percent"] < 0
    ])

    significant_stocks = len([
        stock for stock in result
        if stock["status"] == "significant"
    ])

    # Generate overall market summary
    if significant_stocks > 0:
        summary = (
            f"{significant_stocks} stock(s) in your watchlist "
            "show significant movement and need attention."
        )

    elif positive_stocks > negative_stocks:
        summary = (
            "Your watchlist is showing mostly positive market momentum."
        )

    elif negative_stocks > positive_stocks:
        summary = (
            "Your watchlist is showing mostly negative market momentum."
        )

    else:
        summary = (
            "Your watchlist is showing mixed or relatively stable movement."
        )

    # Extract actionable recommendations
    recommendations = [
        {
            "symbol": stock["symbol"],
            "status": stock["status"],
            "change_percent": stock["change_percent"],
            "recommendation": stock["recommendation"]
        }
        for stock in result
        if stock["status"] != "stable"
    ]

    return {
        "top_gainer": top_gainer,
        "top_loser": top_loser,
        "positive_stocks": positive_stocks,
        "negative_stocks": negative_stocks,
        "significant_stocks": significant_stocks,
        "summary": summary,
        "recommendations": recommendations
    }
@app.get("/history")
def get_history():
    return market_history

@app.get("/alerts")
def get_alerts():
    return {
        "total_alerts": len(alert_history),
        "alerts": alert_history
    }