import React, { useState, useEffect } from 'react';
import { getFenceStatus } from '../services/api';
import {
  getWorstStatus,
  getLatestValue,
  getLatestTimestamp,
  normalizeRelayState,
  formatTimestamp,
  formatValue,
  STATUS_CONFIG,
} from '../utils/helpers';
import './PhysicalCondition.css';

const PhysicalCondition = () => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchPhysicalCondition = async () => {
    setLoading(true);
    setError(null);
    
    const result = await getFenceStatus();
    
    if (result.success) {
      setSensors(result.data);
      setLastFetch(new Date());
      if (result.error) {
        setError(result.error);
      } else {
        setError(null);
      }
    } else {
      const errorMessage = typeof result.message === 'string' 
        ? result.message 
        : 'Failed to load physical data';
      setError(errorMessage);
      setSensors([]);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchPhysicalCondition();
    const interval = setInterval(fetchPhysicalCondition, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRetry = () => {
    fetchPhysicalCondition();
  };

  // Calculate aggregated metrics
  const totalSensors = sensors.length;
  const overallStatus = getWorstStatus(sensors);
  const statusConfig = overallStatus ? STATUS_CONFIG[overallStatus] : null;
  
  const latestTemperature = getLatestValue(sensors, 'temperature');
  const latestRelayState = normalizeRelayState(getLatestValue(sensors, 'relayState'));
  const latestHeartbeat = getLatestTimestamp(sensors);
  const latestUpdate = getLatestTimestamp(sensors);

  // Count sensors by status
  const onlineCount = sensors.filter(s => s.status === 'online').length;
  const offlineCount = sensors.filter(s => s.status === 'offline').length;
  const warningCount = sensors.filter(s => s.status === 'warning').length;
  const criticalCount = sensors.filter(s => s.status === 'critical').length;

  // Loading state
  if (loading && sensors.length === 0) {
    return (
      <div className="physical-condition-container">
        <div className="physical-condition-loading">
          <div className="loading-spinner"></div>
          <p>Loading physical condition data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && sensors.length === 0) {
    const errorMessage = typeof error === 'string' ? error : (error?.message || 'Unable to load data');
    
    return (
      <div className="physical-condition-container">
        <div className="physical-condition-error">
          <div className="error-icon">⚠</div>
          <h3>Unable to Load Physical Data</h3>
          <p>{errorMessage}</p>
          <button onClick={handleRetry} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (sensors.length === 0) {
    return (
      <div className="physical-condition-container">
        <div className="physical-condition-header">
          <div className="header-left">
            <h3 className="section-title">Physical Condition</h3>
            <span className="section-badge">Active</span>
          </div>
          <div className="header-right">
            {lastFetch && (
              <span className="last-fetch">
                Updated: {lastFetch.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="physical-condition-empty">
          <div className="empty-icon">📡</div>
          <p>No physical condition data available</p>
          <button onClick={handleRetry} className="retry-button">
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="physical-condition-container">
      <div className="physical-condition-header">
        <div className="header-left">
          <h3 className="section-title">Physical Condition</h3>
          <span className="section-badge">Active</span>
          <span className="sensor-count">
            {totalSensors} sensor{totalSensors > 1 ? 's' : ''}
          </span>
        </div>
        <div className="header-right">
          {lastFetch && (
            <span className="last-fetch">
              Updated: {lastFetch.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="physical-condition-body">
        {/* Overall Health */}
        <div className="health-section">
          <div className="health-status">
            <span className="health-label">Overall Health</span>
            <div className={`health-badge ${statusConfig ? statusConfig.className : 'status-unknown'}`}>
              <span className="health-icon">{statusConfig?.icon || '?'}</span>
              <span className="health-value">{statusConfig?.label || 'Unknown'}</span>
            </div>
          </div>
          
          <div className="status-distribution">
            <div className="status-item status-online">
              <span className="status-dot"></span>
              <span className="status-label">Online</span>
              <span className="status-count">{onlineCount}</span>
            </div>
            <div className="status-item status-warning">
              <span className="status-dot"></span>
              <span className="status-label">Warning</span>
              <span className="status-count">{warningCount}</span>
            </div>
            <div className="status-item status-critical">
              <span className="status-dot"></span>
              <span className="status-label">Critical</span>
              <span className="status-count">{criticalCount}</span>
            </div>
            <div className="status-item status-offline">
              <span className="status-dot"></span>
              <span className="status-label">Offline</span>
              <span className="status-count">{offlineCount}</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="metrics-grid">
          {/* Temperature */}
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">🌡️</span>
              <span className="metric-title">Temperature</span>
            </div>
            <div className="metric-value-large">
              {formatValue(latestTemperature, '°C')}
            </div>
          </div>

          {/* Relay State */}
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">🔌</span>
              <span className="metric-title">Relay State</span>
            </div>
            <div className={`metric-value-large relay-state ${latestRelayState !== null ? (latestRelayState ? 'relay-on' : 'relay-off') : ''}`}>
              {latestRelayState !== null 
                ? (latestRelayState ? 'ON' : 'OFF')
                : 'N/A'}
            </div>
          </div>

          {/* Last Heartbeat */}
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">💓</span>
              <span className="metric-title">Last Heartbeat</span>
            </div>
            <div className="metric-value-large timestamp-value">
              {formatTimestamp(latestHeartbeat)}
            </div>
          </div>

          {/* Last Update */}
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">🔄</span>
              <span className="metric-title">Last Update</span>
            </div>
            <div className="metric-value-large timestamp-value">
              {formatTimestamp(latestUpdate)}
            </div>
          </div>
        </div>

        {/* Sensor Locations Summary */}
        <div className="locations-summary">
          <div className="locations-header">
            <span className="locations-icon">📍</span>
            <span className="locations-title">Sensor Locations</span>
          </div>
          <div className="locations-list">
            {[...new Set(sensors.map(s => s.location).filter(Boolean))].sort().map(location => {
              const locationSensors = sensors.filter(s => s.location === location);
              const locationStatus = getWorstStatus(locationSensors);
              const statusConfig = locationStatus ? STATUS_CONFIG[locationStatus] : null;
              return (
                <div key={location} className="location-item">
                  <span className="location-name">{location}</span>
                  <span className={`location-status ${statusConfig ? statusConfig.className : ''}`}>
                    {statusConfig?.label || 'Unknown'}
                  </span>
                  <span className="location-count">
                    {locationSensors.length} sensor{locationSensors.length > 1 ? 's' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="physical-condition-footer">
        <button onClick={handleRetry} className="refresh-button">
          Refresh
        </button>
      </div>
    </div>
  );
};

export default PhysicalCondition;