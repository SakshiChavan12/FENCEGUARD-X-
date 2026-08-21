import React, { useState, useEffect } from 'react';
import { getFenceStatus } from '../services/api';
import './PhysicalCondition.css';

// Status priority order (highest to lowest)
const STATUS_PRIORITY = {
  critical: 4,
  warning: 3,
  offline: 2,
  online: 1,
};

// Status display configuration
const STATUS_CONFIG = {
  online: {
    label: 'Online',
    className: 'status-online',
    icon: '✓',
    color: '#27ae60',
    bgColor: '#eafaf1',
  },
  offline: {
    label: 'Offline',
    className: 'status-offline',
    icon: '○',
    color: '#95a5a6',
    bgColor: '#ecf0f1',
  },
  warning: {
    label: 'Warning',
    className: 'status-warning',
    icon: '⚠',
    color: '#f39c12',
    bgColor: '#fef9e7',
  },
  critical: {
    label: 'Critical',
    className: 'status-critical',
    icon: '✕',
    color: '#e74c3c',
    bgColor: '#fdedec',
  },
};

// Get the worst status from a list of sensors
const getWorstStatus = (sensors) => {
  if (!sensors || sensors.length === 0) return null;
  
  let worstStatus = null;
  let worstPriority = 0;
  
  sensors.forEach(sensor => {
    const status = sensor.status || 'offline';
    const priority = STATUS_PRIORITY[status] || 0;
    if (priority > worstPriority) {
      worstPriority = priority;
      worstStatus = status;
    }
  });
  
  return worstStatus;
};

// Get the latest value from sensors
const getLatestValue = (sensors, field) => {
  if (!sensors || sensors.length === 0) return null;
  
  let latest = null;
  let latestTime = null;
  
  sensors.forEach(sensor => {
    const value = sensor[field];
    const time = sensor.lastUpdate || sensor.lastHeartbeat;
    
    if (value !== undefined && value !== null) {
      if (!latestTime || (time && new Date(time) > new Date(latestTime))) {
        latest = value;
        latestTime = time;
      }
    }
  });
  
  return latest;
};

// Get the latest timestamp from sensors
const getLatestTimestamp = (sensors) => {
  if (!sensors || sensors.length === 0) return null;
  
  let latest = null;
  
  sensors.forEach(sensor => {
    const time = sensor.lastUpdate || sensor.lastHeartbeat;
    if (time && (!latest || new Date(time) > new Date(latest))) {
      latest = time;
    }
  });
  
  return latest;
};

// Format timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Never';
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return 'Invalid date';
  }
};

// Format value for display
const formatValue = (value, unit = '') => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'number') {
    return `${value.toFixed(1)}${unit}`;
  }
  return `${value}${unit}`;
};

// Normalize relay state
const normalizeRelayState = (relayState) => {
  if (relayState === null || relayState === undefined) return null;
  // Handle both boolean and string/number representations
  if (typeof relayState === 'boolean') return relayState;
  if (typeof relayState === 'string') {
    return relayState.toLowerCase() === 'true' || relayState === '1' || relayState === 'on';
  }
  if (typeof relayState === 'number') {
    return relayState === 1;
  }
  return Boolean(relayState);
};

// Get sensor count by location
const getSensorCountByLocation = (sensors) => {
  if (!sensors || sensors.length === 0) return 0;
  const locations = new Set();
  sensors.forEach(sensor => {
    if (sensor.location) locations.add(sensor.location);
  });
  return locations.size;
};

// Get total sensors count
const getTotalSensors = (sensors) => {
  return sensors ? sensors.length : 0;
};

// Get sensors by status
const getSensorsByStatus = (sensors, status) => {
  if (!sensors || sensors.length === 0) return [];
  return sensors.filter(s => s.status === status);
};

const PhysicalCondition = () => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [usingMock, setUsingMock] = useState(false);

  const fetchPhysicalCondition = async () => {
    setLoading(true);
    setError(null);
    
    const result = await getFenceStatus();
    
    if (result.success) {
      setSensors(result.data);
      setLastFetch(new Date());
      setUsingMock(result.isMock || false);
      if (result.error) {
        setError(result.error);
      } else {
        setError(null);
      }
    } else {
      setError(result.message);
      setSensors([]);
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

  // Calculate aggregated metrics
  const totalSensors = getTotalSensors(sensors);
  const totalLocations = getSensorCountByLocation(sensors);
  const overallStatus = getWorstStatus(sensors);
  const statusConfig = overallStatus ? STATUS_CONFIG[overallStatus] : null;
  
  const latestTemperature = getLatestValue(sensors, 'temperature');
  const latestRelayState = normalizeRelayState(getLatestValue(sensors, 'relayState'));
  const latestHeartbeat = getLatestTimestamp(sensors);
  const latestUpdate = getLatestTimestamp(sensors);

  // Count sensors by status
  const onlineCount = getSensorsByStatus(sensors, 'online').length;
  const offlineCount = getSensorsByStatus(sensors, 'offline').length;
  const warningCount = getSensorsByStatus(sensors, 'warning').length;
  const criticalCount = getSensorsByStatus(sensors, 'critical').length;

  // Check if thresholds exist
  const hasThresholds = sensors.some(s => s.thresholds && s.thresholds.temperature);

  // Render loading state
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

  // Render error state
  if (error && sensors.length === 0) {
    return (
      <div className="physical-condition-container">
        <div className="physical-condition-error">
          <div className="error-icon">⚠</div>
          <h3>Unable to Load Physical Data</h3>
          <p>{error}</p>
          <button onClick={handleRetry} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render empty state
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
          <span className="location-count">
            {totalLocations} zone{totalLocations > 1 ? 's' : ''}
          </span>
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
            {hasThresholds && (
              <div className="metric-threshold">
                <span className="threshold-label">Thresholds available</span>
              </div>
            )}
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
            <div className="metric-sub">
              {latestRelayState !== null 
                ? (latestRelayState ? 'Active' : 'Inactive')
                : 'No relay data'}
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
            <div className="metric-sub">
              {latestHeartbeat ? 'Sensor communication active' : 'No heartbeat data'}
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
            <div className="metric-sub">
              {latestUpdate ? 'Data received' : 'No update data'}
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