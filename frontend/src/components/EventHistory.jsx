import React, { useState, useEffect, useMemo } from 'react';
import { getEvents } from '../services/api';
import './EventHistory.css';

// Event type display configuration
const EVENT_TYPE_CONFIG = {
  normal: { label: 'Normal', className: 'event-normal' },
  alert: { label: 'Alert', className: 'event-alert' },
  critical: { label: 'Critical', className: 'event-critical' },
  heartbeat: { label: 'Heartbeat', className: 'event-heartbeat' },
  relay_action: { label: 'Relay Action', className: 'event-relay' },
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

const EventHistory = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [usingMock, setUsingMock] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSensor, setFilterSensor] = useState('all');
  const [filterEventType, setFilterEventType] = useState('all');

  const fetchEvents = async (pageNum = page) => {
    setLoading(true);
    setError(null);
    
    const result = await getEvents({ page: pageNum, limit });
    
    if (result.success) {
      setEvents(result.data);
      setLastFetch(new Date());
      setUsingMock(result.isMock || false);
      setTotal(result.total || result.data.length || 0);
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
    fetchEvents(1);
    
    // Refresh every 30 seconds
    const interval = setInterval(() => fetchEvents(1), 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRetry = () => {
    fetchEvents(1);
  };

  // Get unique sensors and event types for filters
  const sensors = useMemo(() => {
    const sensorSet = new Set();
    events.forEach(event => {
      if (event.sensorId) sensorSet.add(event.sensorId);
    });
    return ['all', ...Array.from(sensorSet).sort()];
  }, [events]);

  const eventTypes = useMemo(() => {
    const typeSet = new Set();
    events.forEach(event => {
      if (event.eventType) typeSet.add(event.eventType);
    });
    return ['all', ...Array.from(typeSet).sort()];
  }, [events]);

  // Filter and search events
  const filteredEvents = useMemo(() => {
    let filtered = events;
    
    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(event => {
        const searchableFields = [
          event.sensorId,
          event.eventType,
          event.mlClassification,
          event.action,
          event.metadata ? JSON.stringify(event.metadata) : ''
        ].filter(Boolean);
        
        return searchableFields.some(field => 
          String(field).toLowerCase().includes(term)
        );
      });
    }
    
    // Sensor filter
    if (filterSensor !== 'all') {
      filtered = filtered.filter(event => event.sensorId === filterSensor);
    }
    
    // Event type filter
    if (filterEventType !== 'all') {
      filtered = filtered.filter(event => event.eventType === filterEventType);
    }
    
    return filtered;
  }, [events, searchTerm, filterSensor, filterEventType]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterSensor('all');
    setFilterEventType('all');
  };

  // Check if filters are active
  const hasActiveFilters = searchTerm || filterSensor !== 'all' || filterEventType !== 'all';

  // Pagination
  const totalPages = Math.ceil(total / limit);
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchEvents(newPage);
    }
  };

  // Render loading state
  if (loading && events.length === 0) {
    return (
      <div className="event-history-container">
        <div className="event-history-loading">
          <div className="loading-spinner"></div>
          <p>Loading event history...</p>
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
      <div className="event-history-container">
        <div className="event-history-error">
          <div className="error-icon">⚠</div>
          <p>{errorMessage}</p>
          <button onClick={handleRetry} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="event-history-container">
      <div className="event-history-header">
        <div className="header-left">
          <h3 className="section-title">Event History</h3>
          <span className="section-badge">Archive</span>
          <span className="event-count">{filteredEvents.length} events</span>
          {total > 0 && (
            <span className="total-count">Total: {total}</span>
          )}
          {usingMock && (
            <span className="mock-badge" title="Using mock data (no backend)">
              📊 Mock Data
            </span>
          )}
        </div>
        <div className="header-right">
          {lastFetch && (
            <span className="last-fetch">
              Updated: {lastFetch.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Search and Filters - Using Sensor instead of Zone */}
      <div className="event-history-controls">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label className="filter-label">Sensor:</label>
            <select 
              className="filter-select"
              value={filterSensor}
              onChange={(e) => setFilterSensor(e.target.value)}
            >
              {sensors.map(sensor => (
                <option key={sensor} value={sensor}>
                  {sensor === 'all' ? 'All Sensors' : sensor}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Event Type:</label>
            <select 
              className="filter-select"
              value={filterEventType}
              onChange={(e) => setFilterEventType(e.target.value)}
            >
              {eventTypes.map(type => {
                const config = EVENT_TYPE_CONFIG[type];
                return (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : (config?.label || type)}
                  </option>
                );
              })}
            </select>
          </div>

          {hasActiveFilters && (
            <button className="clear-filters" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Events Table - Updated columns */}
      {filteredEvents.length === 0 ? (
        <div className="event-history-empty">
          <div className="empty-icon">📭</div>
          <p>
            {events.length === 0 
              ? 'No events found' 
              : 'No events match your filters'}
          </p>
          {events.length > 0 && hasActiveFilters && (
            <button className="clear-filters-button" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
          {events.length === 0 && (
            <button onClick={handleRetry} className="retry-button">
              Refresh
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="event-history-table-wrapper">
            <table className="event-history-table">
              <thead>
                <tr>
                  <th className="col-timestamp">Timestamp</th>
                  <th className="col-sensor">Sensor</th>
                  <th className="col-type">Event Type</th>
                  <th className="col-voltage">Voltage</th>
                  <th className="col-current">Current</th>
                  <th className="col-temperature">Temperature</th>
                  <th className="col-score">Anomaly Score</th>
                  <th className="col-ml">ML Classification</th>
                  <th className="col-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event, index) => {
                  const eventConfig = EVENT_TYPE_CONFIG[event.eventType] || EVENT_TYPE_CONFIG.normal;
                  const mlConfig = event.mlClassification 
                    ? ML_CLASSIFICATION_CONFIG[event.mlClassification] 
                    : null;

                  return (
                    <tr key={event.id || index} className="event-row">
                      <td className="col-timestamp">
                        <span className="timestamp-value">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </td>
                      <td className="col-sensor">
                        <span className="sensor-value">
                          {event.sensorId || 'N/A'}
                        </span>
                      </td>
                      <td className="col-type">
                        <span className={`event-type-badge ${eventConfig.className}`}>
                          {eventConfig.label}
                        </span>
                      </td>
                      <td className="col-voltage">
                        <span className="voltage-value">
                          {formatValue(event.voltage, 'V')}
                        </span>
                      </td>
                      <td className="col-current">
                        <span className="current-value">
                          {formatValue(event.current, 'mA')}
                        </span>
                      </td>
                      <td className="col-temperature">
                        <span className="temperature-value">
                          {formatValue(event.temperature, '°C')}
                        </span>
                      </td>
                      <td className="col-score">
                        <span className="score-value">
                          {event.anomalyScore !== null && event.anomalyScore !== undefined
                            ? formatValue(event.anomalyScore, '', 2)
                            : 'N/A'}
                        </span>
                      </td>
                      <td className="col-ml">
                        <span className={`ml-badge ${mlConfig?.className || 'ml-unknown'}`}>
                          {mlConfig?.label || 'N/A'}
                        </span>
                      </td>
                      <td className="col-action">
                        <span className="action-value">
                          {event.action || 'none'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                className="pagination-button"
                onClick={() => goToPage(page - 1)}
                disabled={!canGoPrev}
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages} ({total} events)
              </span>
              <button
                className="pagination-button"
                onClick={() => goToPage(page + 1)}
                disabled={!canGoNext}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      <div className="event-history-footer">
        <button onClick={handleRetry} className="refresh-button">
          Refresh
        </button>
      </div>
    </div>
  );
};

export default EventHistory;