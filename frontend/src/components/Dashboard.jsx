import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <h1 className="app-title">Security Monitoring Dashboard</h1>
        <div className="connection-status">
          <span className="status-dot"></span>
          <span className="status-text">System Connected</span>
        </div>
      </header>

      {/* Dashboard Grid */}
      <main className="dashboard-content">
        <div className="dashboard-grid">
          {/* Section 1: 3-Zone Status */}
          <section className="dashboard-section zone-status">
            <div className="section-header">
              <h2 className="section-title">3-Zone Status</h2>
              <span className="section-badge">Live</span>
            </div>
            <div className="section-content">
              <div className="zone-grid">
                <div className="zone-item">
                  <span className="zone-label">Zone A</span>
                  <span className="zone-value status-normal">Normal</span>
                </div>
                <div className="zone-item">
                  <span className="zone-label">Zone B</span>
                  <span className="zone-value status-normal">Normal</span>
                </div>
                <div className="zone-item">
                  <span className="zone-label">Zone C</span>
                  <span className="zone-value status-warning">Warning</span>
                </div>
              </div>
              <div className="placeholder-text">Live zone status will appear here</div>
            </div>
          </section>

          {/* Section 2: Physical Condition */}
          <section className="dashboard-section physical-condition">
            <div className="section-header">
              <h2 className="section-title">Physical Condition</h2>
              <span className="section-badge">Active</span>
            </div>
            <div className="section-content">
              <div className="metric-grid">
                <div className="metric-item">
                  <span className="metric-label">Temperature</span>
                  <span className="metric-value">23.4 °C</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Humidity</span>
                  <span className="metric-value">45%</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Pressure</span>
                  <span className="metric-value">1013 mbar</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Vibration</span>
                  <span className="metric-value">0.02 g</span>
                </div>
              </div>
              <div className="placeholder-text">Physical sensor data will appear here</div>
            </div>
          </section>

          {/* Section 3: Electrical Telemetry */}
          <section className="dashboard-section electrical-telemetry">
            <div className="section-header">
              <h2 className="section-title">Electrical Telemetry</h2>
              <span className="section-badge">Active</span>
            </div>
            <div className="section-content">
              <div className="metric-grid">
                <div className="metric-item">
                  <span className="metric-label">Voltage</span>
                  <span className="metric-value">24.6 V</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Current</span>
                  <span className="metric-value">1.2 A</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Power</span>
                  <span className="metric-value">29.5 W</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Frequency</span>
                  <span className="metric-value">60 Hz</span>
                </div>
              </div>
              <div className="placeholder-text">Electrical telemetry data will appear here</div>
            </div>
          </section>

          {/* Section 4: Events */}
          <section className="dashboard-section events">
            <div className="section-header">
              <h2 className="section-title">Events</h2>
              <span className="section-badge">Live</span>
            </div>
            <div className="section-content">
              <div className="events-list">
                <div className="event-item">
                  <span className="event-time">14:32:15</span>
                  <span className="event-type event-info">System Initialized</span>
                </div>
                <div className="event-item">
                  <span className="event-time">14:35:42</span>
                  <span className="event-type event-warning">Zone C - Movement Detected</span>
                </div>
                <div className="event-item">
                  <span className="event-time">14:38:07</span>
                  <span className="event-type event-success">Zone A - All Clear</span>
                </div>
                <div className="event-item">
                  <span className="event-time">14:41:33</span>
                  <span className="event-type event-error">Power Fluctuation Detected</span>
                </div>
              </div>
              <div className="placeholder-text">Recent events will appear here</div>
            </div>
          </section>

          {/* Section 5: Event History */}
          <section className="dashboard-section event-history">
            <div className="section-header">
              <h2 className="section-title">Event History</h2>
              <span className="section-badge">Archive</span>
            </div>
            <div className="section-content">
              <div className="history-list">
                <div className="history-item">
                  <span className="history-date">2026-08-20</span>
                  <span className="history-event">System Startup - All zones nominal</span>
                </div>
                <div className="history-item">
                  <span className="history-date">2026-08-19</span>
                  <span className="history-event">Zone B - Scheduled maintenance completed</span>
                </div>
                <div className="history-item">
                  <span className="history-date">2026-08-19</span>
                  <span className="history-event">Network connectivity restored</span>
                </div>
                <div className="history-item">
                  <span className="history-date">2026-08-18</span>
                  <span className="history-event">Sensor calibration performed</span>
                </div>
              </div>
              <div className="placeholder-text">Historical event log will appear here</div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;