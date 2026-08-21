import React, { useState, useEffect } from 'react';
import { getEvents } from '../services/api';
import './Events.css';

// Event type display configuration
const EVENT_TYPE_CONFIG = {
  normal: { label: 'Normal', className: 'event-normal', icon: 'ℹ️' },
  alert: { label: 'Alert', className: 'event-alert', icon: '⚠️' },
  critical: { label: 'Critical', className: 'event-critical', icon: '🚨' },
  heartbeat: { label: 'Heartbeat', className: 'event-heartbeat', icon: '💓' },
  relay_action: { label: 'Relay Action', className: 'event-relay', icon: '🔌' },
};

// ML Classification display configuration
const ML_CLASSIFICATION_CONFIG = {
  normal: { label: 'Normal', className: 'ml-normal' },
  anomaly: { label: 'Anomaly', className: 'ml-anomaly' },
  critical: { label: 'Critical', className: 'ml-critical' },
};

// Format timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return 'Invalid date';
  }
};

// Format value for display
const formatValue = (value, unit = '', decimals = 1) => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'number') {
    return `${value.toFixed(decimals)}${unit}`;
  }
  return `${value}${unit}`;
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [usingMock, setUsingMock] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    
    const result = await getEvents({ page: 1, limit: 20 });
    
    if (result.success) {
      setEvents(result.data);
      setLastFetch(new Date());
      setUsingMock(result.isMock || false);
      if (result.error) {
        setError(result.error);
      } else {
        setError(null);
      }
    } else {
      const errorMessage = typeof result.message === 'string' 
        ? result.message 
        : 'Failed to load events';
      setError(errorMessage);
      setEvents([]);
      setUsingMock(false);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchEvents, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRetry = () => {
    fetchEvents();
  };

  // Render loading state
  if (loading && events.length === 0) {
    return (
      <div className="events-container">
        <div className="events-loading">
          <div className="loading-spinner-small"></div>
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  // Render error state - Fixed: Never render error object directly
  if (error && events.length === 0) {
    const errorMessage = typeof error === 'string' 
      ? error 
      : (error?.message || 'Unable to load events');
    
    return (
      <div className="events-container">
        <div className="events-error">
          <div className="error-icon">⚠</div>
          <p>{errorMessage}</p>
          <button onClick={handleRetry} className="retry-button-small">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render empty state
  if (events.length === 0) {
    return (
      <div className="events-container">
        <div className="events-header">
          <div className="header-left">
            <h3 className="section-title">Events</h3>
            <span className="section-badge">Live</span>
            <span className="event-count">0 events</span>
          </div>
          <div className="header-right">
            {lastFetch && (
              <span className="last-fetch">
                Updated: {lastFetch.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="events-empty">
          <div className="empty-icon">📭</div>
          <p>No events found</p>
          <button onClick={handleRetry} className="retry-button-small">
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="events-container">
      <div className="events-header">
        <div className="header-left">
          <h3 className="section-title">Events</h3>
          <span className="section-badge">Live</span>
          <span className="event-count">{events.length} events</span>
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

      <div className="events-body">
        <div className="events-list">
          {events.map((event, index) => {
            const eventConfig = EVENT_TYPE_CONFIG[event.eventType] || EVENT_TYPE_CONFIG.normal;
            const mlConfig = event.mlClassification 
              ? ML_CLASSIFICATION_CONFIG[event.mlClassification] 
              : null;

            return (
              <div 
                key={event.id || index} 
                className={`event-item ${eventConfig.className}`}
              >
                <div className="event-icon">
                  {eventConfig.icon}
                </div>
                
                <div className="event-content">
                  <div className="event-header-row">
                    <span className="event-type">
                      {eventConfig.label}
                    </span>
                    <span className="event-sensor">
                      📡 {event.sensorId || 'Unknown Sensor'}
                    </span>
                    {event.mlClassification && mlConfig && (
                      <span className={`event-ml ${mlConfig.className}`}>
                        ML: {mlConfig.label}
                      </span>
                    )}
                  </div>
                  
                  <div className="event-details">
                    {event.voltage !== undefined && event.voltage !== null && (
                      <span className="event-metric">
                        ⚡ {formatValue(event.voltage, 'V')}
                      </span>
                    )}
                    {event.current !== undefined && event.current !== null && (
                      <span className="event-metric">
                        🔌 {formatValue(event.current, 'mA')}
                      </span>
                    )}
                    {event.temperature !== undefined && event.temperature !== null && (
                      <span className="event-metric">
                        🌡️ {formatValue(event.temperature, '°C')}
                      </span>
                    )}
                    {event.anomalyScore !== undefined && event.anomalyScore !== null && (
                      <span className="event-metric event-score">
                        📊 Score: {formatValue(event.anomalyScore, '', 2)}
                      </span>
                    )}
                    {event.action && event.action !== 'none' && (
                      <span className="event-metric event-action">
                        ⚙️ Action: {event.action}
                      </span>
                    )}
                  </div>
                  
                  <div className="event-footer-row">
                    <span className="event-timestamp">
                      🕐 {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="events-footer">
        <button onClick={handleRetry} className="refresh-button-small">
          Refresh
        </button>
      </div>
    </div>
  );
};

export default Events;