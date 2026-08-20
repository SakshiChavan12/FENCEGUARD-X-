import React, { useState, useEffect, useMemo } from 'react';
import { getEvents } from '../services/api';
import './EventHistory.css';

const EventHistory = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [usingMock, setUsingMock] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterZone, setFilterZone] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');

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

  // Get unique zones and severities for filters
  const zones = useMemo(() => {
    const zoneSet = new Set();
    events.forEach(event => {
      if (event.zone) zoneSet.add(event.zone);
    });
    return ['all', ...Array.from(zoneSet).sort()];
  }, [events]);

  const severities = useMemo(() => {
    const severitySet = new Set();
    events.forEach(event => {
      if (event.severity) severitySet.add(event.severity);
    });
    return ['all', ...Array.from(severitySet).sort()];
  }, [events]);

  // Filter and search events
  const filteredEvents = useMemo(() => {
    let filtered = events;
    
    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(event => {
        const searchableFields = [
          event.eventType,
          event.zone,
          event.severity,
          event.message,
          event.status
        ].filter(Boolean);
        
        return searchableFields.some(field => 
          String(field).toLowerCase().includes(term)
        );
      });
    }
    
    // Zone filter
    if (filterZone !== 'all') {
      filtered = filtered.filter(event => event.zone === filterZone);
    }
    
    // Severity filter
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(event => event.severity === filterSeverity);
    }
    
    return filtered;
  }, [events, searchTerm, filterZone, filterSeverity]);

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

  // Get status display
  const getStatusDisplay = (resolved) => {
    if (resolved === undefined || resolved === null) return 'N/A';
    return resolved ? 'Resolved' : 'Active';
  };

  // Get status class
  const getStatusClass = (resolved) => {
    if (resolved === undefined || resolved === null) return 'status-unknown';
    return resolved ? 'status-resolved' : 'status-active';
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterZone('all');
    setFilterSeverity('all');
  };

  // Check if filters are active
  const hasActiveFilters = searchTerm || filterZone !== 'all' || filterSeverity !== 'all';

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

  // Render error state
  if (error && events.length === 0) {
    return (
      <div className="event-history-container">
        <div className="event-history-error">
          <div className="error-icon">⚠</div>
          <p>{error}</p>
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

      {/* Search and Filters */}
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
            <label className="filter-label">Zone:</label>
            <select 
              className="filter-select"
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
            >
              {zones.map(zone => (
                <option key={zone} value={zone}>
                  {zone === 'all' ? 'All Zones' : zone}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Severity:</label>
            <select 
              className="filter-select"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
            >
              {severities.map(severity => (
                <option key={severity} value={severity}>
                  {severity === 'all' ? 'All Severities' : severity}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button className="clear-filters" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Events Table */}
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
        <div className="event-history-table-wrapper">
          <table className="event-history-table">
            <thead>
              <tr>
                <th className="col-timestamp">Timestamp</th>
                <th className="col-zone">Zone</th>
                <th className="col-type">Event Type</th>
                <th className="col-severity">Severity</th>
                <th className="col-status">Status</th>
                <th className="col-message">Message</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event, index) => (
                <tr key={event.id || index} className="event-row">
                  <td className="col-timestamp">
                    <span className="timestamp-value">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </td>
                  <td className="col-zone">
                    <span className="zone-value">
                      {event.zone || 'N/A'}
                    </span>
                  </td>
                  <td className="col-type">
                    <span className="event-type-badge">
                      {getEventTypeDisplay(event.eventType)}
                    </span>
                  </td>
                  <td className="col-severity">
                    <span className={`severity-badge ${getSeverityClass(event.severity)}`}>
                      {event.severity || 'N/A'}
                    </span>
                  </td>
                  <td className="col-status">
                    <span className={`status-badge ${getStatusClass(event.resolved)}`}>
                      {getStatusDisplay(event.resolved)}
                    </span>
                  </td>
                  <td className="col-message">
                    <span className="message-value">
                      {event.message || '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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