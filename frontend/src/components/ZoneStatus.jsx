import React, { useState, useEffect } from 'react';
import { getFenceStatus } from '../services/api';
import './ZoneStatus.css';

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
  },
  offline: {
    label: 'Offline',
    className: 'status-offline',
    icon: '○',
    color: '#95a5a6',
  },
  warning: {
    label: 'Warning',
    className: 'status-warning',
    icon: '⚠',
    color: '#f39c12',
  },
  critical: {
    label: 'Critical',
    className: 'status-critical',
    icon: '✕',
    color: '#e74c3c',
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

// Get the latest value from sensors (most recent lastUpdate)
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

// Zone Card Component
const ZoneCard = ({ zoneName, sensors }) => {
  const hasSensors = sensors && sensors.length > 0;
  const sensorCount = hasSensors ? sensors.length : 0;
  
  // Calculate aggregated values
  const worstStatus = hasSensors ? getWorstStatus(sensors) : null;
  const statusConfig = worstStatus ? STATUS_CONFIG[worstStatus] : null;
  
  const voltage = hasSensors ? getLatestValue(sensors, 'voltage') : null;
  const current = hasSensors ? getLatestValue(sensors, 'current') : null;
  const temperature = hasSensors ? getLatestValue(sensors, 'temperature') : null;
  const relayState = hasSensors ? getLatestValue(sensors, 'relayState') : null;
  const lastUpdate = hasSensors ? getLatestTimestamp(sensors) : null;

  return (
    <div className={`zone-card ${statusConfig ? statusConfig.className : 'zone-empty'}`}>
      <div className="zone-card-header">
        <h3 className="zone-name">{zoneName}</h3>
        <div className="zone-status-badge">
          {hasSensors ? (
            <>
              <span className="status-icon">{statusConfig?.icon || '?'}</span>
              <span className="status-label">{statusConfig?.label || 'Unknown'}</span>
              <span className="sensor-count">({sensorCount} sensor{sensorCount > 1 ? 's' : ''})</span>
            </>
          ) : (
            <span className="status-label status-no-sensor">No Sensor</span>
          )}
        </div>
      </div>
      
      <div className="zone-card-body">
        {hasSensors ? (
          <>
            <div className="zone-metrics-grid">
              <div className="zone-metric">
                <span className="metric-label">Voltage</span>
                <span className="metric-value">{formatValue(voltage, 'V')}</span>
              </div>
              <div className="zone-metric">
                <span className="metric-label">Current</span>
                <span className="metric-value">{formatValue(current, 'mA')}</span>
              </div>
              <div className="zone-metric">
                <span className="metric-label">Temperature</span>
                <span className="metric-value">{formatValue(temperature, '°C')}</span>
              </div>
              <div className="zone-metric">
                <span className="metric-label">Relay</span>
                <span className="metric-value relay-state">
                  {relayState !== null && relayState !== undefined 
                    ? (relayState ? 'ON' : 'OFF') 
                    : 'N/A'}
                </span>
              </div>
            </div>
            <div className="zone-timestamp">
              <span className="timestamp-label">Last Update:</span>
              <span className="timestamp-value">{formatTimestamp(lastUpdate)}</span>
            </div>
          </>
        ) : (
          <div className="zone-no-sensor">
            <span className="no-sensor-icon">📡</span>
            <p>No sensor connected</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main ZoneStatus Component
const ZoneStatus = () => {
  const [zones, setZones] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [usingMock, setUsingMock] = useState(false);

  const fetchZoneStatus = async () => {
    setLoading(true);
    setError(null);
    
    const result = await getFenceStatus();
    
    if (result.success) {
      // Group sensors by location
      const groupedZones = {};
      
      result.data.forEach(sensor => {
        const location = sensor.location || 'Unknown';
        if (!groupedZones[location]) {
          groupedZones[location] = [];
        }
        groupedZones[location].push(sensor);
      });
      
      setZones(groupedZones);
      setLastFetch(new Date());
      setUsingMock(result.isMock || false);
      if (result.error) {
        setError(result.error);
      } else {
        setError(null);
      }
    } else {
      setError(result.message);
      setZones({});
      setUsingMock(false);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchZoneStatus();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchZoneStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRetry = () => {
    fetchZoneStatus();
  };

  // Get zone names sorted
  const zoneNames = Object.keys(zones).sort();

  // Render loading state
  if (loading && Object.keys(zones).length === 0) {
    return (
      <div className="zone-status-container">
        <div className="zone-status-loading">
          <div className="loading-spinner"></div>
          <p>Loading sensor status...</p>
        </div>
      </div>
    );
  }

 // Render error state
if (error && Object.keys(zones).length === 0) {
  const errorMessage = typeof error === 'string' ? error : (error?.message || 'Unable to load data');
  
  return (
    <div className="zone-status-container">
      <div className="zone-status-error">
        <div className="error-icon">⚠</div>
        <h3>Unable to Load Zone Status</h3>
        <p>{errorMessage}</p>
        <button onClick={handleRetry} className="retry-button">
          Retry
        </button>
      </div>
    </div>
  );
}

  // Render empty state
 if (error && Object.keys(zones).length === 0) {
  // Extract the error message safely
  const errorMessage = typeof error === 'string' ? error : (error?.message || 'Unable to load data');
  
  return (
    <div className="zone-status-error">
      <div className="error-icon">⚠</div>
      <h3>Unable to Load Zone Status</h3>
      <p>{errorMessage}</p>  {/* ✅ Now renders only the message string */}
      <button onClick={handleRetry} className="retry-button">
        Retry
      </button>
    </div>
  );
}
  // Render zones
  return (
    <div className="zone-status-container">
      <div className="zone-status-header">
        <div className="header-left">
          <h2 className="section-title">3-Zone Status</h2>
          <span className="section-badge">Live</span>
          <span className="zone-count">
            {zoneNames.length} zone{zoneNames.length > 1 ? 's' : ''}
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

      <div className="zone-cards-grid">
        {zoneNames.map((zoneName) => (
          <ZoneCard 
            key={zoneName} 
            zoneName={zoneName} 
            sensors={zones[zoneName]} 
          />
        ))}
      </div>

      <div className="zone-status-footer">
        <button onClick={handleRetry} className="refresh-button">
          Refresh
        </button>
      </div>
    </div>
  );
};

export default ZoneStatus;