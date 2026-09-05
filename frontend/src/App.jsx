import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [changesSinceLastCheck, setChangesSinceLastCheck] = useState([]);
  const [lastChecked, setLastChecked] = useState(null);

  const [newSymbol, setNewSymbol] = useState("");
  const [addingStock, setAddingStock] = useState(false);

  const [activePage, setActivePage] = useState("dashboard");
  const [insights, setInsights] = useState(null);
const [insightsLoading, setInsightsLoading] = useState(true);
const [history, setHistory] = useState([]);
const [historyLoading, setHistoryLoading] = useState(true);
const [alerts, setAlerts] = useState([]);
const [alertsLoading, setAlertsLoading] = useState(true);

  // ================= FETCH STOCKS =================
const fetchStocks = () => {
  setLoading(true);

  fetch("https://marketpulse-backend-q4wg.onrender.com/watchlist")
    .then((response) => response.json())
    .then((data) => {

      // Safely get previous market snapshot
      const storedSnapshot = localStorage.getItem("marketSnapshot");

      let previousSnapshot = [];

      try {
        const parsedSnapshot = storedSnapshot
          ? JSON.parse(storedSnapshot)
          : [];

        previousSnapshot = Array.isArray(parsedSnapshot)
          ? parsedSnapshot
          : [];
      } catch (error) {
        previousSnapshot = [];
      }

      const previousCheckTime =
        localStorage.getItem("lastChecked");

      // Compare current data with previous snapshot
      if (
        Array.isArray(previousSnapshot) &&
        previousSnapshot.length > 0
      ) {
        const detectedChanges = data
          .map((stock) => {
            const previousStock = previousSnapshot.find(
              (item) => item.symbol === stock.symbol
            );

            if (previousStock) {
              const priceDifference =
                stock.current_price -
                previousStock.current_price;

              const percentDifference =
                previousStock.current_price !== 0
                  ? (priceDifference /
                      previousStock.current_price) *
                    100
                  : 0;

              return {
                symbol: stock.symbol,
                previousPrice:
                  previousStock.current_price,
                currentPrice: stock.current_price,
                difference: priceDifference,
                percentDifference:
                  percentDifference,
              };
            }

            return null;
          })
          .filter(Boolean);

        setChangesSinceLastCheck(detectedChanges);
      }

      // Save latest market snapshot
      localStorage.setItem(
        "marketSnapshot",
        JSON.stringify(data)
      );

      const currentTime =
        new Date().toLocaleString();

      localStorage.setItem(
        "lastChecked",
        currentTime
      );

      setLastChecked(previousCheckTime);

      setStocks(data);
      setLoading(false);
    })
    .catch((error) => {
      console.error(
        "Error fetching stocks:",
        error
      );
      setLoading(false);
    });
};
  // ================= FETCH MARKET INSIGHTS =================
const fetchInsights = () => {
  setInsightsLoading(true);

  fetch("https://marketpulse-backend-q4wg.onrender.com/insights")

    .then((response) => response.json())
    .then((data) => {
      setInsights(data);
      setInsightsLoading(false);
    })
    .catch((error) => {
      console.error("Error fetching insights:", error);
      setInsightsLoading(false);
    });
};
// ================= FETCH HISTORY =================
// ================= FETCH MARKET HISTORY =================

const fetchHistory = () => {
  setHistoryLoading(true);

  fetch(" https://marketpulse-backend-q4wg.onrender.com/history")
    .then((response) => response.json())
    .then((data) => {
      setHistory(data);
      setHistoryLoading(false);
    })
    .catch((error) => {
      console.error("Error fetching history:", error);
      setHistory([]);
      setHistoryLoading(false);
    });
};
const fetchAlerts = () => {
  setAlertsLoading(true);

  fetch(" https://marketpulse-backend-q4wg.onrender.com/alerts")
    .then((response) => response.json())
    .then((data) => {
      setAlerts(data.alerts || []);
      setAlertsLoading(false);
    })
    .catch((error) => {
      console.error("Error fetching alerts:", error);
      setAlertsLoading(false);
    });
};
  // ================= ADD STOCK =================
  const addStock = () => {
    if (!newSymbol.trim()) {
      alert("Please enter a stock symbol");
      return;
    }

    setAddingStock(true);

   fetch(
  `https://marketpulse-backend-q4wg.onrender.com/watchlist/${newSymbol.toUpperCase()}`,
  {
    method: "POST",
  }
)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          alert(data.message);
          setNewSymbol("");
          fetchStocks();
        }

        setAddingStock(false);
      })
      .catch((error) => {
        console.error(
          "Error adding stock:",
          error
        );

        alert("Something went wrong");
        setAddingStock(false);
      });
  };

  // ================= REMOVE STOCK =================
  const removeStock = (symbol) => {
    const confirmRemove = window.confirm(
      `Remove ${symbol} from your watchlist?`
    );

    if (!confirmRemove) return;

    fetch(
  `https://marketpulse-backend-q4wg.onrender.com/watchlist/${symbol}`,
  {
    method: "DELETE",
  }
)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          fetchStocks();
        }
      })
      .catch((error) => {
        console.error(
          "Error removing stock:",
          error
        );
      });
  };

  useEffect(() => {
  fetchStocks();
  fetchInsights();
  fetchHistory();
  fetchAlerts();
}, []);
  // =====================================================
  // STOCK CARD COMPONENT
  // =====================================================

  const StockCards = () => {
    if (loading) {
      return (
        <p className="loading">
          Loading market data...
        </p>
      );
    }

    return (
      <div className="stock-grid">
        {stocks.map((stock) => (
          <div
            className={`stock-card ${stock.attention_level}`}
            key={stock.symbol}
          >
            <button
              className="remove-stock-btn"
              onClick={() =>
                removeStock(stock.symbol)
              }
              title="Remove stock"
            >
              ×
            </button>

            <div className="stock-top">
              <div>
                <h3>{stock.symbol}</h3>
                <p>NASDAQ</p>
              </div>

              <span
                className={
                  stock.change_percent >= 0
                    ? "trend up"
                    : "trend down"
                }
              >
                {stock.change_percent >= 0
                  ? "↗"
                  : "↘"}
              </span>
            </div>

            <h2>${stock.current_price}</h2>

            <div
              className={
                stock.change_percent >= 0
                  ? "stock-change positive"
                  : "stock-change negative"
              }
            >
              {stock.change_percent >= 0
                ? "+"
                : ""}
              {stock.change_percent}%
            </div>

            <div
              className={`status-badge ${stock.status}`}
            >
              {stock.status === "significant" &&
                "🚨 "}

              {stock.status === "moderate" &&
                "● "}

              {stock.status === "stable" &&
                "● "}

              {stock.status?.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // =====================================================
  // DASHBOARD PAGE
  // =====================================================

  const DashboardPage = () => (
    <>
      <header>
        <div>
          <p className="welcome">
            GOOD MORNING, ADITI 👋
          </p>

          <h1>Your Market Pulse</h1>

          <p className="subtitle">
            Track what changed. Ignore the noise.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={fetchStocks}
          disabled={loading}
        >
          {loading
            ? "Loading..."
            : "↻ Refresh"}
        </button>
      </header>

      {/* Summary Cards */}

      <section className="summary-grid">
        <div className="summary-card">
          <p>WATCHING</p>
          <h2>{stocks.length}</h2>
          <span>Active stocks</span>
        </div>

        <div className="summary-card">
          <p>MARKET MOVERS</p>

          <h2>
            {
              stocks.filter(
                (stock) =>
                  Math.abs(
                    stock.change_percent
                  ) >= 1
              ).length
            }
          </h2>

          <span>Stocks with movement</span>
        </div>

        <div className="summary-card alert-card">
          <p>NEEDS ATTENTION</p>

          <h2>
            {
              stocks.filter(
                (stock) =>
                  stock.attention_level ===
                  "high"
              ).length
            }
          </h2>

          <span>Significant changes</span>
        </div>
      </section>

      {/* Watchlist Preview */}

      <section className="watchlist-section">
        <div className="section-header">
          <div>
            <h2>Your Watchlist</h2>
            <p>
              Latest meaningful changes in your
              market
            </p>
          </div>

          <button
            className="view-all"
            onClick={() =>
              setActivePage("watchlist")
            }
          >
            View All →
          </button>
        </div>

        <StockCards />
      </section>

      {/* Needs Attention */}

      {stocks.filter(
        (stock) =>
          stock.attention_level === "high"
      ).length > 0 && (
        <section className="attention-section">
          <h2>⚡ Needs Your Attention</h2>

          <p>
            These stocks experienced significant
            market movement.
          </p>

          <div className="attention-list">
            {stocks
              .filter(
                (stock) =>
                  stock.attention_level ===
                  "high"
              )
              .map((stock) => (
                <div
                  className="attention-item"
                  key={stock.symbol}
                >
                  <div>
                    <strong>
                      {stock.symbol}
                    </strong>

                    <p>
                      {stock.reason ||
                        (stock.change_percent >= 0
                          ? "Strong upward movement detected"
                          : "Significant downward movement detected")}
                    </p>
                  </div>

                  <span
                    className={
                      stock.change_percent >= 0
                        ? "positive"
                        : "negative"
                    }
                  >
                    {stock.change_percent >= 0
                      ? "+"
                      : ""}
                    {stock.change_percent}%
                  </span>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Smart Insight */}

      <section className="insight-box">
        <div className="insight-icon">✦</div>

        <div>
          <p className="insight-label">
            MARKET PULSE INSIGHT
          </p>

          <h3>
            We highlight changes that matter,
            not every market movement.
          </h3>

          <p>
            Our system classifies market movements
            into stable, moderate, and significant
            changes so you can focus on what
            deserves attention.
          </p>
        </div>
      </section>
    </>
  );

  // =====================================================
  // WATCHLIST PAGE
  // =====================================================

  const WatchlistPage = () => (
    <>
      <header>
        <div>
          <p className="welcome">
            YOUR PORTFOLIO
          </p>

          <h1>Your Watchlist</h1>

          <p className="subtitle">
            Track your selected stocks in one
            place.
          </p>
        </div>
      </header>

      <section className="watchlist-section">
        <div className="section-header">
          <div>
            <h2>My Stocks</h2>

            <p>
              Add or remove stocks from your
              watchlist
            </p>
          </div>

          <div className="add-stock-box">
            <input
              type="text"
              placeholder="Enter symbol (e.g. NVDA)"
              value={newSymbol}
              onChange={(e) =>
                setNewSymbol(
                  e.target.value.toUpperCase()
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addStock();
                }
              }}
            />

            <button
              className="add-stock-btn"
              onClick={addStock}
              disabled={addingStock}
            >
              {addingStock
                ? "Adding..."
                : "+ Add Stock"}
            </button>
          </div>
        </div>

        <StockCards />
      </section>
    </>
  );

  // =====================================================
  // MARKET INSIGHTS PAGE
  // =====================================================

  const InsightsPage = () => {

  if (insightsLoading) {
    return (
      <div className="loading">
        Loading market insights...
      </div>
    );
  }

  if (!insights || insights.error) {
    return (
      <div className="loading">
        Unable to load market insights.
      </div>
    );
  }

  return (
    <>
      <header>
        <div>
          <p className="welcome">
            MARKET ANALYSIS
          </p>

          <h1>Market Insights</h1>

          <p className="subtitle">
            AI-powered summary of your current watchlist.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={() => {
            fetchStocks();
            fetchInsights();
          }}
        >
          ↻ Refresh Insights
        </button>
      </header>

      {/* Insight Summary Cards */}
      <section className="summary-grid">

        <div className="summary-card">
          <p>TOP GAINER</p>

          <h2>
            {insights.top_gainer?.symbol}
          </h2>

          <span className="positive">
            +{insights.top_gainer?.change_percent}%
          </span>
        </div>


        <div className="summary-card">
          <p>TOP LOSER</p>

          <h2>
            {insights.top_loser?.symbol}
          </h2>

          <span
            className={
              insights.top_loser?.change_percent >= 0
                ? "positive"
                : "negative"
            }
          >
            {insights.top_loser?.change_percent >= 0
              ? "+"
              : ""}
            {insights.top_loser?.change_percent}%
          </span>
        </div>


        <div className="summary-card alert-card">
          <p>NEEDS ATTENTION</p>

          <h2>
            {insights.significant_stocks}
          </h2>

          <span>
            Significant market movements
          </span>
        </div>

      </section>


      {/* Market Summary */}
      <section className="insight-box">

        <div className="insight-icon">
          ✦
        </div>

        <div>
          <p className="insight-label">
            SMART MARKET SUMMARY
          </p>

          <h3>
            {insights.summary}
          </h3>

          <p>
            Based on live price movement across your
            current watchlist.
          </p>
        </div>

      </section>


      {/* Market Statistics */}
      <section
        className="attention-section"
        style={{ marginTop: "35px" }}
      >

        <h2>📊 Market Overview</h2>

        <p>
          Quick breakdown of your current market activity.
        </p>

        <div className="attention-list">

          <div className="attention-item">
            <div>
              <strong>Positive Stocks</strong>

              <p>
                Stocks currently moving upward.
              </p>
            </div>

            <span className="positive">
              {insights.positive_stocks}
            </span>
          </div>


          <div className="attention-item">
            <div>
              <strong>Negative Stocks</strong>

              <p>
                Stocks currently moving downward.
              </p>
            </div>

            <span className="negative">
              {insights.negative_stocks}
            </span>
          </div>


          <div className="attention-item">
            <div>
              <strong>Significant Movement</strong>

              <p>
                Stocks requiring extra attention.
              </p>
            </div>

            <span>
              {insights.significant_stocks}
            </span>
          </div>

        </div>

      </section>
      {/* Recommended Actions */}

{insights.recommendations &&
  insights.recommendations.length > 0 && (
    <section
      className="attention-section"
      style={{ marginTop: "35px" }}
    >
      <h2>💡 Recommended Actions</h2>

      <p>
        Smart suggestions based on significant market movements.
      </p>

      <div className="attention-list">
        {insights.recommendations.map((item) => (
          <div
            className="attention-item"
            key={item.symbol}
          >
            <div>
              <strong>{item.symbol}</strong>

              <p>{item.recommendation}</p>
            </div>

            <span
              className={
                item.change_percent >= 0
                  ? "positive"
                  : "negative"
              }
            >
              {item.change_percent >= 0 ? "+" : ""}
              {item.change_percent}%
            </span>
          </div>
        ))}
      </div>
    </section>
)}
    </>
  );
};

  // =====================================================
  // HISTORY PAGE
  // =====================================================
// =====================================================
// HISTORY PAGE
// =====================================================

const HistoryPage = () => {

  if (historyLoading) {
    return (
      <div className="loading">
        Loading market history...
      </div>
    );
  }

  return (
    <>
      <header>
        <div>
          <p className="welcome">
            MARKET HISTORY
          </p>

          <h1>Your Market History</h1>

          <p className="subtitle">
            Track previous market snapshots and changes.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={() => {
            fetchStocks();
            fetchHistory();
          }}
        >
          ↻ Refresh History
        </button>
      </header>

      <section className="changes-section">

        {!history || history.length === 0 ? (

          <p className="loading">
            No market history available yet.
          </p>

        ) : (

          history
            .slice()
            .reverse()
            .map((entry, index) => (

              <div
                className="attention-section"
                style={{ marginBottom: "25px" }}
                key={index}
              >

                <h2>📅 Market Check</h2>

                <p>
                  Checked at: {entry.checked_at || "Unknown time"}
                </p>

                <div className="changes-grid">

                  {entry.stocks?.map((stock) => (

                    <div
                      className="change-card"
                      key={stock.symbol}
                    >

                      <div>
                        <h3>{stock.symbol}</h3>

                        <p>
                          ${stock.current_price}
                        </p>
                      </div>

                      <div
                        className={
                          stock.change_percent >= 0
                            ? "positive"
                            : "negative"
                        }
                      >
                        {stock.change_percent >= 0 ? "+" : ""}
                        {stock.change_percent}%
                      </div>

                    </div>

                  ))}

                </div>

              </div>

            ))

        )}

      </section>
    </>
  );
};
// =====================================================
// ALERTS PAGE
// =====================================================

const AlertsPage = () => {

  if (alertsLoading) {
    return (
      <div className="loading">
        Loading alerts...
      </div>
    );
  }

  return (
    <>
      <header>
        <div>
          <p className="welcome">
            MARKET ALERTS
          </p>

          <h1>Smart Market Alerts</h1>

          <p className="subtitle">
            Important market movements that need your attention.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={() => {
            fetchStocks();
            fetchAlerts();
          }}
        >
          ↻ Refresh Alerts
        </button>
      </header>

      <section className="changes-section">

        <div className="section-header">
          <div>
            <h2>Recent Alerts</h2>

            <p>
              {alerts.length} meaningful market alerts detected.
            </p>
          </div>
        </div>

        {alerts.length === 0 ? (

          <p className="loading">
            No important market alerts right now.
          </p>

        ) : (

          <div className="attention-list">

            {alerts.map((alert, index) => (

              <div
                className="attention-item"
                key={`${alert.symbol}-${index}`}
              >

                <div>

                  <strong>
                    {alert.status === "significant"
                      ? "🚨 "
                      : "⚠️ "}

                    {alert.symbol}
                  </strong>

                  <p>
                    {alert.reason}
                  </p>

                  <small>
                    Detected: {alert.detected_at}
                  </small>

                </div>

                <span
                  className={
                    alert.change_percent >= 0
                      ? "positive"
                      : "negative"
                  }
                >
                  {alert.change_percent >= 0 ? "+" : ""}
                  {alert.change_percent}%
                </span>

              </div>

            ))}

          </div>

        )}

      </section>
    </>
  );
};
  // =====================================================
  // MAIN RETURN
  // =====================================================

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="logo">
          <span className="logo-icon">
            ◈
          </span>

          <h2>MarketPulse</h2>
        </div>

        <nav>
          <div
            className={`nav-item ${
              activePage === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("dashboard")
            }
          >
            ▦ Dashboard
          </div>

          <div
            className={`nav-item ${
              activePage === "watchlist"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("watchlist")
            }
          >
            ★ Watchlist
          </div>

          <div
            className={`nav-item ${
              activePage === "insights"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("insights")
            }
          >
            ↗ Market Insights
          </div>
<div
  className={`nav-item ${
    activePage === "alerts" ? "active" : ""
  }`}
  onClick={() => setActivePage("alerts")}
>
  <span>🔔</span>
  Alerts
</div>
          <div
            className={`nav-item ${
              activePage === "history"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("history")
            }
          >
            ◷ History
          </div>



        </nav>

        <div className="sidebar-bottom">
          <div className="user">
            <div className="avatar">
              A
            </div>

            <div>
              <strong>Aditi</strong>
              <p>Investor</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}

      <main className="main-content">

        {activePage === "dashboard" && (
          <DashboardPage />
        )}

        {activePage === "watchlist" && (
          <WatchlistPage />
        )}

        {activePage === "insights" && (
          <InsightsPage />
        )}



        {activePage === "history" && (
          <HistoryPage />
        )}
        {activePage === "alerts" && (
  <AlertsPage />
)}
   

      </main>
    </div>
  );
}

export default App;