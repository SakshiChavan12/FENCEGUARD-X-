import React, { useState, useEffect } from 'react';
import { getPhysicalCondition } from '../services/api';
import './PhysicalCondition.css';

const PhysicalCondition = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [usingMock, setUsingMock] = useState(false);

  const fetchPhysicalCondition = async () => {
    setLoading(true);
    setError(null);
    
    const result = await getPhysicalCondition();
    
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
    fetchPhysicalCondition();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPhysicalCondition, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRetry = () => {
    fetchPhysicalCondition();
  };

  // Format value for display
  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return value.toFixed(2);
  };

  // Render loading state
  if (loading && !data) {
    return (
      <div className="physical-condition-loading">
        <div className="loading-spinner-small"></div>
        <p>Loading physical data...</p>
      </div>
    );
  }

  // Render error state
  if (error && !data) {
    return (
      <div className="physical-condition-error">
        <div className="error-icon">⚠</div>
        <p>{error}</p>
        <button onClick={handleRetry} className="retry-button-small">
          Retry
        </button>
      </div>
    );
  }

  // Render empty state
  if (!data || (data.ax === null && data.ay === null && data.az === null && 
      data.gx === null && data.gy === null && data.gz === null)) {
    return (
      <div className="physical-condition-empty">
        <div className="empty-icon">📡</div>
        <p>No physical condition data available</p>
        <button onClick={handleRetry} className="retry-button-small">
          Retry
        </button>
      </div>
    );
  }

  // Check if we have any accelerometer data
  const hasAccelData = data.ax !== null || data.ay !== null || data.az !== null;
  const hasGyroData = data.gx !== null || data.gy !== null || data.gz !== null;

  return (
    <div className="physical-condition-container">
      <div className="physical-condition-header">
        <div className="header-left">
          <h3 className="section-title">Physical Condition</h3>
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

      <div className="physical-condition-body">
        {/* Physical Status - Only show if backend provides it */}
        {data.status && (
          <div className="physical-status">
            <span className="status-label">Status:</span>
            <span className="status-value">{data.status}</span>
          </div>
        )}

        <div className="sensor-grid">
          {/* Accelerometer Section */}
          {hasAccelData && (
            <div className="sensor-group">
              <div className="sensor-group-header">
                <span className="sensor-icon">📊</span>
                <h4 className="sensor-group-title">Accelerometer</h4>
              </div>
              <div className="sensor-values">
                <div className="sensor-item">
                  <span className="sensor-label">X</span>
                  <span className="sensor-value">{formatValue(data.ax)}</span>
                </div>
                <div className="sensor-item">
                  <span className="sensor-label">Y</span>
                  <span className="sensor-value">{formatValue(data.ay)}</span>
                </div>
                <div className="sensor-item">
                  <span className="sensor-label">Z</span>
                  <span className="sensor-value">{formatValue(data.az)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Gyroscope Section */}
          {hasGyroData && (
            <div className="sensor-group">
              <div className="sensor-group-header">
                <span className="sensor-icon">🔄</span>
                <h4 className="sensor-group-title">Gyroscope</h4>
              </div>
              <div className="sensor-values">
                <div className="sensor-item">
                  <span className="sensor-label">X</span>
                  <span className="sensor-value">{formatValue(data.gx)}</span>
                </div>
                <div className="sensor-item">
                  <span className="sensor-label">Y</span>
                  <span className="sensor-value">{formatValue(data.gy)}</span>
                </div>
                <div className="sensor-item">
                  <span className="sensor-label">Z</span>
                  <span className="sensor-value">{formatValue(data.gz)}</span>
                </div>
              </div>
            </div>
          )}

          {/* If no sensor data is available */}
          {!hasAccelData && !hasGyroData && (
            <div className="no-sensor-data">
              <p>No sensor data available</p>
            </div>
          )}
        </div>

        {/* Timestamp if available */}
        {data.timestamp && (
          <div className="physical-timestamp">
            <span className="timestamp-label">Last reading:</span>
            <span className="timestamp-value">
              {new Date(data.timestamp).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <div className="physical-condition-footer">
        <button onClick={handleRetry} className="refresh-button-small">
          Refresh
        </button>
      </div>
    </div>
  );
};

export default PhysicalCondition;