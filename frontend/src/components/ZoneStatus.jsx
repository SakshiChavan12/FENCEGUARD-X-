import React, { useState, useEffect } from 'react';
import { getZoneStatus } from '../services/api';
import './ZoneStatus.css';

const STATUS_CONFIG = {
  NORMAL: {
    label: 'Normal',
    className: 'status-normal',
    icon: '✓',
  },
  WARNING: {
    label: 'Warning',
    className: 'status-warning',
    icon: '⚠',
  },
  CRITICAL: {
    label: 'Critical',
    className: 'status-critical',
    icon: '✕',
  },
  OFFLINE: {
    label: 'Offline',
    className: 'status-offline',
    icon: '○',
  },
};

const ZoneCard = ({ zone }) => {
  const statusConfig = STATUS_CONFIG[zone.status] || STATUS_CONFIG.OFFLINE;
  const voltageDisplay = zone.voltage !== null && zone.voltage !== undefined 
    ? `${zone.voltage}V` 
    : 'N/A';
  
  const formattedTime = zone.lastUpdated 
    ? new Date(zone.lastUpdated).toLocaleString()
    : 'Never';

  return (
    <div className={`zone-card ${statusConfig.className}`}>
      <div className="zone-card-header">
        <h3 className="zone-name">{zone.name}</h3>
        <div className="zone-status-badge">
          <span className="status-icon">{statusConfig.icon}</span>
          <span className="status-label">{statusConfig.label}</span>
        </div>
      </div>
      <div className="zone-card-body">
        <div className="zone-metric">
          <span className="metric-label">Voltage</span>
          <span className="metric-value">{voltageDisplay}</span>
        </div>
        <div className="zone-metric">
          <span className="metric-label">Last Updated</span>
          <span className="metric-value time-value">{formattedTime}</span>
        </div>
      </div>
    </div>
  );
};

const ZoneStatus = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [usingMock, setUsingMock] = useState(false);

  const fetchZoneStatus = async () => {
    setLoading(true);
    setError(null);
    
    const result = await getZoneStatus();
    
    if (result.success) {
      setZones(result.data);
      setLastFetch(new Date());
      setUsingMock(result.isMock || false);
      if (result.error) {
        setError(result.error);
      } else {
        setError(null);
      }
    } else {
      setError(result.error);
      setZones([]);
      setUsingMock(false);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchZoneStatus();
    
    const interval = setInterval(fetchZoneStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRetry = () => {
    fetchZoneStatus();
  };

  if (loading && zones.length === 0) {
    return (
      <div className="zone-status-loading">
        <div className="loading-spinner"></div>
        <p>Loading zone status...</p>
      </div>
    );
  }

  if (error && zones.length === 0) {
    return (
      <div className="zone-status-error">
        <div className="error-icon">⚠</div>
        <h3>Unable to Load Zone Status</h3>
        <p>{error}</p>
        <button onClick={handleRetry} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (zones.length === 0) {
    return (
      <div className="zone-status-empty">
        <div className="empty-icon">📡</div>
        <h3>No Zone Data Available</h3>
        <p>No zone status data could be found. Please check the backend.</p>
        <button onClick={handleRetry} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="zone-status-container">
      <div className="zone-status-header">
        <div className="header-left">
          <h2 className="section-title">3-Zone Status</h2>
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
      <div className="zone-cards-grid">
        {zones.map((zone) => (
          <ZoneCard key={zone.id} zone={zone} />
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