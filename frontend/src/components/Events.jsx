import React, { useState, useEffect } from 'react';
import { getEvents } from '../services/api';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [usingMock, setUsingMock] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    
    const result = await getEvents();
    
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
      setError(result.error);
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

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  // Get event type display name
  const getEventTypeDisplay = (eventType) => {
    const displayNames = {
      'NORMAL': 'Normal',
      'ELECTRICAL_FAULT': 'Electrical Fault',
      'PHYSICAL_TAMPER': 'Physical Tamper',
      'BREACH': 'Breach',
    };
    return displayNames[eventType] || eventType;
  };

  // Get severity badge class
  const getSeverityClass = (severity) => {
    const classes = {
      'NORMAL': 'severity-normal',
      'WARNING': 'severity-warning',
      'CRITICAL': 'severity-critical',
    };
    return classes[severity] || 'severity-normal';
  };

  // Get event type icon
  const getEventTypeIcon = (eventType) => {
    const icons = {
      'NORMAL': '✅',
      'ELECTRICAL_FAULT': '⚡',
      'PHYSICAL_TAMPER': '🔧',
      'BREACH': '🚨',
    };
    return icons[eventType] || '📋';
  };

  // Get resolved status display
  const getResolvedDisplay = (resolved) => {
    return resolved ? '✅ Resolved' : '🔄 Active';
  };

  // Render loading state
  if (loading && events.length === 0) {
    return (
      <div className="events-loading">
        <div className="loading-spinner-small"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  // Render error state
  if (error && events.length === 0) {
    return (
      <div className="events-error">
        <div className="error-icon">⚠</div>
        <p>{error}</p>
        <button onClick={handleRetry} className="retry-button-small">
          Retry
        </button>
      </div>
    );
  }

  // Render empty state
  if (events.length === 0) {
    return (
      <div className="events-empty">
        <div className="empty-icon">📭</div>
        <p>No events found</p>
        <button onClick={handleRetry} className="retry-button-small">
          Refresh
        </button>
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
          {events.map((event, index) => (
            <div 
              key={event.id || index} 
              className={`event-item ${event.resolved ? 'event-resolved' : 'event-active'}`}
            >
              <div className="event-icon">
                {getEventTypeIcon(event.eventType)}
              </div>
              
              <div className="event-content">
                <div className="event-header-row">
                  <span className="event-type">
                    {getEventTypeDisplay(event.eventType)}
                  </span>
                  <span className={`event-severity ${getSeverityClass(event.severity)}`}>
                    {event.severity}
                  </span>
                  <span className="event-resolved-status">
                    {getResolvedDisplay(event.resolved)}
                  </span>
                </div>
                
                <div className="event-details">
                  {event.zone && (
                    <span className="event-zone">
                      📍 {event.zone}
                    </span>
                  )}
                  {event.message && (
                    <span className="event-message">
                      {event.message}
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
          ))}
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