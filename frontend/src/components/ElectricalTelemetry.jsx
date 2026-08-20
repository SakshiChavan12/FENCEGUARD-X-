import React, { useState, useEffect } from 'react';
import { getElectricalTelemetry } from '../services/api';
import './ElectricalTelemetry.css';

const ElectricalTelemetry = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [usingMock, setUsingMock] = useState(false);

  const fetchElectricalTelemetry = async () => {
    setLoading(true);
    setError(null);
    
    const result = await getElectricalTelemetry();
    
    if (result.success) {
      setData(result.data);
      setLastFetch(new Date());
      setUsingMock(result.isMock || false);
      if (result.error) {
        setError(result.error);
      } else {
        setError(null);
      }
    } else {
      setError(result.error);
      setData(null);
      setUsingMock(false);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchElectricalTelemetry();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchElectricalTelemetry, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRetry = () => {
    fetchElectricalTelemetry();
  };

  // Format value for display
  const formatValue = (value, decimals = 2) => {
    if (value === null || value === undefined) return 'N/A';
    return Number(value).toFixed(decimals);
  };

  // Check if we have any electrical data
  const hasData = data && (
    data.zone1_v !== null || data.zone2_v !== null || data.zone3_v !== null ||
    data.bus_voltage_v !== null || data.current_ma !== null || data.power_mw !== null
  );

  // Render loading state
  if (loading && !data) {
    return (
      <div className="electrical-loading">
        <div className="loading-spinner-small"></div>
        <p>Loading electrical data...</p>
      </div>
    );
  }

  // Render error state
  if (error && !data) {
    return (
      <div className="electrical-error">
        <div className="error-icon">⚠</div>
        <p>{error}</p>
        <button onClick={handleRetry} className="retry-button-small">
          Retry
        </button>
      </div>
    );
  }

  // Render empty state
  if (!hasData) {
    return (
      <div className="electrical-empty">
        <div className="empty-icon">⚡</div>
        <p>No electrical telemetry data available</p>
        <button onClick={handleRetry} className="retry-button-small">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="electrical-container">
      <div className="electrical-header">
        <div className="header-left">
          <h3 className="section-title">Electrical Telemetry</h3>
          <span className="section-badge">Live</span>
        </div>
        <div className="header-right">
          {usingMock && (
            <span className="mock-badge" title="Using mock data (no backend)">
              📊 Mock Data
            </span>
          )}
          {lastFetch && (
            <span className="last-fetch">
              Updated: {lastFetch.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="electrical-body">
        {/* Zone Voltages */}
        <div className="electrical-group">
          <div className="group-header">
            <span className="group-icon">⚡</span>
            <h4 className="group-title">Zone Voltages</h4>
          </div>
          <div className="electrical-grid">
            <div className="electrical-item">
              <span className="electrical-label">Zone 1</span>
              <span className="electrical-value voltage-value">
                {formatValue(data.zone1_v, 1)}V
              </span>
            </div>
            <div className="electrical-item">
              <span className="electrical-label">Zone 2</span>
              <span className="electrical-value voltage-value">
                {formatValue(data.zone2_v, 1)}V
              </span>
            </div>
            <div className="electrical-item">
              <span className="electrical-label">Zone 3</span>
              <span className="electrical-value voltage-value">
                {formatValue(data.zone3_v, 1)}V
              </span>
            </div>
          </div>
        </div>

        {/* System Electricals */}
        <div className="electrical-group">
          <div className="group-header">
            <span className="group-icon">🔌</span>
            <h4 className="group-title">System Electricals</h4>
          </div>
          <div className="electrical-grid">
            <div className="electrical-item">
              <span className="electrical-label">Bus Voltage</span>
              <span className="electrical-value bus-value">
                {formatValue(data.bus_voltage_v, 1)}V
              </span>
            </div>
            <div className="electrical-item">
              <span className="electrical-label">Current</span>
              <span className="electrical-value current-value">
                {formatValue(data.current_ma, 1)}mA
              </span>
            </div>
            <div className="electrical-item">
              <span className="electrical-label">Power</span>
              <span className="electrical-value power-value">
                {formatValue(data.power_mw, 0)}mW
              </span>
            </div>
          </div>
        </div>

        {/* Timestamp if available */}
        {data.timestamp && (
          <div className="electrical-timestamp">
            <span className="timestamp-label">Last reading:</span>
            <span className="timestamp-value">
              {new Date(data.timestamp).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <div className="electrical-footer">
        <button onClick={handleRetry} className="refresh-button-small">
          Refresh
        </button>
      </div>
    </div>
  );
};

export default ElectricalTelemetry;