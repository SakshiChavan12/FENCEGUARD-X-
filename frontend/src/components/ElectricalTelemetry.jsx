import React, { useState, useEffect } from 'react';
import { getFenceStatus } from '../services/api';
import './ElectricalTelemetry.css';

// Status display configuration
const STATUS_CONFIG = {
  online: {
    label: 'Online',
    className: 'status-online',
    color: '#27ae60',
  },
  offline: {
    label: 'Offline',
    className: 'status-offline',
    color: '#95a5a6',
  },
  warning: {
    label: 'Warning',
    className: 'status-warning',
    color: '#f39c12',
  },
  critical: {
    label: 'Critical',
    className: 'status-critical',
    color: '#e74c3c',
  },
};

// Format value for display
const formatValue = (value, unit = '', decimals = 1) => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'number') {
    return `${value.toFixed(decimals)}${unit}`;
  }
  return `${value}${unit}`;
};

const ElectricalTelemetry = () => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [usingMock, setUsingMock] = useState(false);

  const fetchElectricalData = async () => {
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
    fetchElectricalData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchElectricalData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRetry = () => {
    fetchElectricalData();
  };

  // Get sensors with electrical data
  const sensorsWithData = sensors.filter(s => 
    s.voltage !== undefined || s.current !== undefined
  );

  // Calculate aggregate statistics
  const totalSensors = sensors.length;
  const activeSensors = sensors.filter(s => s.status === 'online').length;
  
  // Get latest values across all sensors
  const getLatestValue = (field) => {
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

  const latestVoltage = getLatestValue('voltage');
  const latestCurrent = getLatestValue('current');

  // Get min/max values
  const getMinMax = (field) => {
    const values = sensors
      .map(s => s[field])
      .filter(v => v !== undefined && v !== null);
    
    if (values.length === 0) return { min: null, max: null };
    
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  };

  const voltageRange = getMinMax('voltage');
  const currentRange = getMinMax('current');

  // Get sensors grouped by location with electrical data
  const sensorsByLocation = {};
  sensors.forEach(sensor => {
    const location = sensor.location || 'Unknown';
    if (!sensorsByLocation[location]) {
      sensorsByLocation[location] = [];
    }
    sensorsByLocation[location].push(sensor);
  });

  // Render loading state
  if (loading && sensors.length === 0) {
    return (
      <div className="electrical-container">
        <div className="electrical-loading">
          <div className="loading-spinner"></div>
          <p>Loading electrical data...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && sensors.length === 0) {
    return (
      <div className="electrical-container">
        <div className="electrical-error">
          <div className="error-icon">⚠</div>
          <h3>Unable to Load Electrical Data</h3>
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
      <div className="electrical-container">
        <div className="electrical-header">
          <div className="header-left">
            <h3 className="section-title">Electrical Telemetry</h3>
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
        <div className="electrical-empty">
          <div className="empty-icon">⚡</div>
          <p>No electrical telemetry data available</p>
          <button onClick={handleRetry} className="retry-button">
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="electrical-container">
      <div className="electrical-header">
        <div className="header-left">
          <h3 className="section-title">Electrical Telemetry</h3>
          <span className="section-badge">Live</span>
          <span className="sensor-count">
            {totalSensors} sensor{totalSensors > 1 ? 's' : ''}
          </span>
          <span className="active-count">
            {activeSensors} active
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

      <div className="electrical-body">
        {/* Summary Statistics */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-label">Latest Voltage</div>
            <div className="summary-value">{formatValue(latestVoltage, 'V')}</div>
            {voltageRange.min !== null && voltageRange.max !== null && (
              <div className="summary-range">
                Range: {formatValue(voltageRange.min, 'V')} - {formatValue(voltageRange.max, 'V')}
              </div>
            )}
          </div>
          
          <div className="summary-card">
            <div className="summary-label">Latest Current</div>
            <div className="summary-value">{formatValue(latestCurrent, 'mA')}</div>
            {currentRange.min !== null && currentRange.max !== null && (
              <div className="summary-range">
                Range: {formatValue(currentRange.min, 'mA')} - {formatValue(currentRange.max, 'mA')}
              </div>
            )}
          </div>

          <div className="summary-card">
            <div className="summary-label">Active Sensors</div>
            <div className="summary-value">{activeSensors} / {totalSensors}</div>
            <div className="summary-range">
              {((activeSensors / totalSensors) * 100).toFixed(0)}% online
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-label">Sensors with Data</div>
            <div className="summary-value">{sensorsWithData.length}</div>
            <div className="summary-range">
              {((sensorsWithData.length / totalSensors) * 100).toFixed(0)}% reporting
            </div>
          </div>
        </div>

        {/* Sensors by Location */}
        <div className="locations-electrical">
          <div className="locations-header">
            <span className="locations-icon">📍</span>
            <span className="locations-title">Electrical Readings by Zone</span>
          </div>
          <div className="electrical-grid">
            {Object.keys(sensorsByLocation).sort().map(location => {
              const locationSensors = sensorsByLocation[location];
              const latestVoltage = getLatestValueForSensors(locationSensors, 'voltage');
              const latestCurrent = getLatestValueForSensors(locationSensors, 'current');
              const status = getWorstStatus(locationSensors);
              const statusConfig = status ? STATUS_CONFIG[status] : null;
              
              return (
                <div key={location} className="electrical-card">
                  <div className="electrical-card-header">
                    <span className="location-name">{location}</span>
                    <span className={`location-status ${statusConfig ? statusConfig.className : ''}`}>
                      {statusConfig?.label || 'Unknown'}
                    </span>
                  </div>
                  <div className="electrical-card-body">
                    <div className="electrical-reading">
                      <span className="reading-label">Voltage</span>
                      <span className="reading-value">{formatValue(latestVoltage, 'V')}</span>
                    </div>
                    <div className="electrical-reading">
                      <span className="reading-label">Current</span>
                      <span className="reading-value">{formatValue(latestCurrent, 'mA')}</span>
                    </div>
                    <div className="electrical-reading">
                      <span className="reading-label">Sensors</span>
                      <span className="reading-value">{locationSensors.length}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="electrical-footer">
        <button onClick={handleRetry} className="refresh-button">
          Refresh
        </button>
      </div>
    </div>
  );
};

// Helper function to get latest value for a specific set of sensors
const getLatestValueForSensors = (sensors, field) => {
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

// Helper function to get worst status
const getWorstStatus = (sensors) => {
  if (!sensors || sensors.length === 0) return null;
  
  const STATUS_PRIORITY = {
    critical: 4,
    warning: 3,
    offline: 2,
    online: 1,
  };
  
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

export default ElectricalTelemetry;