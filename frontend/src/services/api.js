import axios from 'axios';

// API base URL - adjust if backend runs on different port
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock data generator for development
const generateMockZoneData = () => {
  const statuses = ['NORMAL', 'NORMAL', 'WARNING', 'CRITICAL', 'OFFLINE'];
  const zoneNames = ['Zone 1', 'Zone 2', 'Zone 3'];
  
  return zoneNames.map((name, index) => {
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      _id: `zone_${index + 1}`,
      zoneName: name,
      status: randomStatus,
      voltage: Math.round((95 + Math.random() * 30) * 10) / 10,
      updatedAt: new Date(Date.now() - Math.random() * 600000).toISOString(),
    };
  });
};

// Mock telemetry data generator
const generateMockTelemetryData = () => {
  return {
    _id: 'telemetry_mock_1',
    ax: Math.round((Math.random() * 2 - 1) * 100) / 100,
    ay: Math.round((Math.random() * 2 - 1) * 100) / 100,
    az: Math.round((Math.random() * 2 - 1) * 100) / 100,
    gx: Math.round((Math.random() * 10 - 5) * 100) / 100,
    gy: Math.round((Math.random() * 10 - 5) * 100) / 100,
    gz: Math.round((Math.random() * 10 - 5) * 100) / 100,
    timestamp: new Date().toISOString(),
  };
};

// Mock electrical telemetry data generator
const generateMockElectricalData = () => {
  return {
    _id: 'electrical_mock_1',
    zone1_v: Math.round((110 + Math.random() * 20) * 10) / 10,
    zone2_v: Math.round((110 + Math.random() * 20) * 10) / 10,
    zone3_v: Math.round((110 + Math.random() * 20) * 10) / 10,
    bus_voltage_v: Math.round((24 + Math.random() * 4) * 10) / 10,
    current_ma: Math.round((800 + Math.random() * 400) * 10) / 10,
    power_mw: Math.round((18000 + Math.random() * 12000) * 10) / 10,
    timestamp: new Date().toISOString(),
  };
};

// Mock events data generator
const generateMockEvents = () => {
  const eventTypes = ['NORMAL', 'ELECTRICAL_FAULT', 'PHYSICAL_TAMPER', 'BREACH'];
  const zones = ['Zone 1', 'Zone 2', 'Zone 3'];
  const severities = ['NORMAL', 'WARNING', 'CRITICAL'];
  const messages = [
    'System operating normally',
    'Voltage spike detected',
    'Physical access attempt detected',
    'Unauthorized access detected',
    'Power fluctuation detected',
    'Sensor calibration completed',
    'Network connectivity restored',
    'Temperature anomaly detected'
  ];

  const events = [];
  const numEvents = 5 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < numEvents; i++) {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    
    events.push({
      _id: `event_${i + 1}`,
      eventType: eventType,
      zone: zones[Math.floor(Math.random() * zones.length)],
      severity: severity,
      message: messages[Math.floor(Math.random() * messages.length)],
      resolved: Math.random() > 0.7,
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    });
  }
  
  // Sort by timestamp descending (newest first)
  return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

// Check if we should use mock data
const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true' || !import.meta.env.VITE_API_URL;

// Zone Status API
export const mapZoneStatusResponse = (data) => {
  const zones = Array.isArray(data) ? data : (data?.data || data?.zones || []);
  
  return zones.map((item) => ({
    id: item._id || item.id || `zone-${Math.random()}`,
    name: item.zoneName || item.name || item.zone || 'Unknown Zone',
    status: item.status || 'OFFLINE',
    voltage: item.voltage !== undefined && item.voltage !== null ? item.voltage : null,
    lastUpdated: item.updatedAt || item.lastUpdated || item.timestamp || null,
  }));
};

export const getZoneStatus = async () => {
  if (useMockData) {
    console.log('Using mock data for zone status (no backend available)');
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    
    const mockData = generateMockZoneData();
    return {
      success: true,
      data: mapZoneStatusResponse(mockData),
      raw: mockData,
      isMock: true,
    };
  }

  try {
    const response = await api.get('/api/status');
    const data = response.data;
    const zonesData = data.data || data;
    
    return {
      success: true,
      data: mapZoneStatusResponse(zonesData),
      raw: data,
      isMock: false,
    };
  } catch (error) {
    console.error('Error fetching zone status:', error);
    
    if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
      console.warn('Backend unavailable, falling back to mock data');
      const mockData = generateMockZoneData();
      return {
        success: true,
        data: mapZoneStatusResponse(mockData),
        raw: mockData,
        isMock: true,
        error: 'Using mock data (backend unavailable)',
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch zone status',
      status: error.response?.status,
    };
  }
};

// Physical Condition (Telemetry) API
export const mapTelemetryResponse = (data) => {
  const telemetry = data?.data || data || {};
  
  return {
    ax: telemetry.ax !== undefined && telemetry.ax !== null ? Number(telemetry.ax) : null,
    ay: telemetry.ay !== undefined && telemetry.ay !== null ? Number(telemetry.ay) : null,
    az: telemetry.az !== undefined && telemetry.az !== null ? Number(telemetry.az) : null,
    gx: telemetry.gx !== undefined && telemetry.gx !== null ? Number(telemetry.gx) : null,
    gy: telemetry.gy !== undefined && telemetry.gy !== null ? Number(telemetry.gy) : null,
    gz: telemetry.gz !== undefined && telemetry.gz !== null ? Number(telemetry.gz) : null,
    timestamp: telemetry.timestamp || telemetry.updatedAt || telemetry.createdAt || null,
    status: telemetry.physicalStatus || telemetry.status || null,
  };
};

export const getPhysicalCondition = async () => {
  if (useMockData) {
    console.log('Using mock data for physical condition (no backend available)');
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400));
    
    const mockData = generateMockTelemetryData();
    return {
      success: true,
      data: mapTelemetryResponse(mockData),
      raw: mockData,
      isMock: true,
    };
  }

  try {
    const response = await api.get('/api/telemetry/latest');
    const data = response.data;
    
    return {
      success: true,
      data: mapTelemetryResponse(data),
      raw: data,
      isMock: false,
    };
  } catch (error) {
    console.error('Error fetching physical condition:', error);
    
    if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
      console.warn('Backend unavailable, falling back to mock data');
      const mockData = generateMockTelemetryData();
      return {
        success: true,
        data: mapTelemetryResponse(mockData),
        raw: mockData,
        isMock: true,
        error: 'Using mock data (backend unavailable)',
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch physical condition data',
      status: error.response?.status,
    };
  }
};

// Electrical Telemetry API
export const mapElectricalResponse = (data) => {
  const telemetry = data?.data || data || {};
  
  return {
    zone1_v: telemetry.zone1_v !== undefined && telemetry.zone1_v !== null ? Number(telemetry.zone1_v) : null,
    zone2_v: telemetry.zone2_v !== undefined && telemetry.zone2_v !== null ? Number(telemetry.zone2_v) : null,
    zone3_v: telemetry.zone3_v !== undefined && telemetry.zone3_v !== null ? Number(telemetry.zone3_v) : null,
    bus_voltage_v: telemetry.bus_voltage_v !== undefined && telemetry.bus_voltage_v !== null ? Number(telemetry.bus_voltage_v) : null,
    current_ma: telemetry.current_ma !== undefined && telemetry.current_ma !== null ? Number(telemetry.current_ma) : null,
    power_mw: telemetry.power_mw !== undefined && telemetry.power_mw !== null ? Number(telemetry.power_mw) : null,
    timestamp: telemetry.timestamp || telemetry.updatedAt || telemetry.createdAt || null,
  };
};

export const getElectricalTelemetry = async () => {
  if (useMockData) {
    console.log('Using mock data for electrical telemetry (no backend available)');
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400));
    
    const mockData = generateMockElectricalData();
    return {
      success: true,
      data: mapElectricalResponse(mockData),
      raw: mockData,
      isMock: true,
    };
  }

  try {
    const response = await api.get('/api/telemetry/latest');
    const data = response.data;
    
    return {
      success: true,
      data: mapElectricalResponse(data),
      raw: data,
      isMock: false,
    };
  } catch (error) {
    console.error('Error fetching electrical telemetry:', error);
    
    if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
      console.warn('Backend unavailable, falling back to mock data');
      const mockData = generateMockElectricalData();
      return {
        success: true,
        data: mapElectricalResponse(mockData),
        raw: mockData,
        isMock: true,
        error: 'Using mock data (backend unavailable)',
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch electrical telemetry data',
      status: error.response?.status,
    };
  }
};

// Events API
export const mapEventsResponse = (data) => {
  // Handle different response structures
  const events = Array.isArray(data) ? data : (data?.data || data?.events || []);
  
  return events.map((item) => ({
    id: item._id || item.id || `event-${Math.random()}`,
    eventType: item.eventType || 'NORMAL',
    zone: item.zone || null,
    severity: item.severity || 'NORMAL',
    message: item.message || null,
    resolved: item.resolved !== undefined ? item.resolved : false,
    timestamp: item.timestamp || item.createdAt || item.updatedAt || null,
  }));
};

export const getEvents = async () => {
  if (useMockData) {
    console.log('Using mock data for events (no backend available)');
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400));
    
    const mockData = generateMockEvents();
    return {
      success: true,
      data: mapEventsResponse(mockData),
      raw: mockData,
      isMock: true,
    };
  }

  try {
    const response = await api.get('/api/events');
    const data = response.data;
    
    // The backend returns events directly in the data array
    const eventsData = data.data || data;
    
    return {
      success: true,
      data: mapEventsResponse(eventsData),
      raw: data,
      isMock: false,
    };
  } catch (error) {
    console.error('Error fetching events:', error);
    
    if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
      console.warn('Backend unavailable, falling back to mock data');
      const mockData = generateMockEvents();
      return {
        success: true,
        data: mapEventsResponse(mockData),
        raw: mockData,
        isMock: true,
        error: 'Using mock data (backend unavailable)',
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch events',
      status: error.response?.status,
    };
  }
};

export default api;