// Helper utility functions for components

// Get the worst status from a list of sensors
export const getWorstStatus = (sensors) => {
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

// Get the latest value from sensors
export const getLatestValue = (sensors, field) => {
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
export const getLatestTimestamp = (sensors) => {
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

// Normalize relay state
export const normalizeRelayState = (relayState) => {
  if (relayState === null || relayState === undefined) return null;
  if (typeof relayState === 'boolean') return relayState;
  if (typeof relayState === 'string') {
    return relayState.toLowerCase() === 'true' || relayState === '1' || relayState === 'on';
  }
  if (typeof relayState === 'number') {
    return relayState === 1;
  }
  return Boolean(relayState);
};

// Format timestamp
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Never';
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return 'Invalid date';
  }
};

// Format value for display
export const formatValue = (value, unit = '', decimals = 1) => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'number') {
    return `${value.toFixed(decimals)}${unit}`;
  }
  return `${value}${unit}`;
};

// Status configuration
export const STATUS_CONFIG = {
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