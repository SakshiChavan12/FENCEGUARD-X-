import axios from 'axios';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject({
        message: 'Backend server is not running. Please start the backend server.',
        status: null,
        originalError: error,
      });
    }

    const { status, data } = error.response;
    let errorMessage = 'An unexpected error occurred.';

    switch (status) {
      case 400:
        errorMessage = data?.message || 'Bad request. Please check your input.';
        break;
      case 404:
        errorMessage = data?.message || 'Resource not found.';
        break;
      case 500:
        errorMessage = data?.message || 'Server error. Please try again later.';
        break;
      default:
        errorMessage = data?.message || `Error ${status}: ${error.message}`;
    }

    return Promise.reject({
      message: errorMessage,
      status: status,
      originalError: error,
      data: data,
    });
  }
);

// ============================================
// FENCE STATUS API
// ============================================

export const getFenceStatus = async () => {
  try {
    const response = await api.get('/api/v1/fence/status');
    
    if (response.data && response.data.data) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Success',
        raw: response.data,
        isMock: false,
      };
    }
    
    return {
      success: true,
      data: response.data,
      message: 'Success',
      raw: response.data,
      isMock: false,
    };
  } catch (error) {
    console.error('Error fetching fence status:', error);
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to fetch sensor status',
      status: error.status,
      error: error,
    };
  }
};

export const getSensorStatus = async (sensorId) => {
  try {
    const response = await api.get(`/api/v1/fence/status/${sensorId}`);
    
    if (response.data && response.data.data) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Success',
        raw: response.data,
      };
    }
    
    return {
      success: true,
      data: response.data,
      message: 'Success',
      raw: response.data,
    };
  } catch (error) {
    console.error(`Error fetching sensor ${sensorId}:`, error);
    return {
      success: false,
      data: null,
      message: error.message || `Failed to fetch sensor ${sensorId}`,
      status: error.status,
      error: error,
    };
  }
};

// ============================================
// EVENTS API
// ============================================

export const getEvents = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      sensorId,
      eventType,
      startDate,
      endDate,
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    
    if (sensorId) queryParams.append('sensorId', sensorId);
    if (eventType) queryParams.append('eventType', eventType);
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const url = `/api/v1/events?${queryParams.toString()}`;
    const response = await api.get(url);
    
    if (response.data && response.data.data) {
      const result = {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Success',
        raw: response.data,
        isMock: false,
      };

      if (response.data.pagination) {
        result.pagination = response.data.pagination;
      }
      if (response.data.total) {
        result.total = response.data.total;
      }
      if (response.data.page) {
        result.page = response.data.page;
      }
      if (response.data.limit) {
        result.limit = response.data.limit;
      }

      return result;
    }
    
    return {
      success: true,
      data: response.data,
      message: 'Success',
      raw: response.data,
      isMock: false,
    };
  } catch (error) {
    console.error('Error fetching events:', error);
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to fetch events',
      status: error.status,
      error: error,
      pagination: null,
    };
  }
};

export const searchEvents = async (params = {}) => {
  try {
    const {
      query,
      page = 1,
      limit = 20,
      sensorId,
      eventType,
      startDate,
      endDate,
      minAnomalyScore,
      maxAnomalyScore,
    } = params;

    const queryParams = new URLSearchParams();
    if (query) queryParams.append('q', query);
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    
    if (sensorId) queryParams.append('sensorId', sensorId);
    if (eventType) queryParams.append('eventType', eventType);
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (minAnomalyScore) queryParams.append('minAnomalyScore', minAnomalyScore);
    if (maxAnomalyScore) queryParams.append('maxAnomalyScore', maxAnomalyScore);

    const url = `/api/v1/events/search?${queryParams.toString()}`;
    const response = await api.get(url);
    
    if (response.data && response.data.data) {
      const result = {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Success',
        raw: response.data,
        isMock: false,
      };

      if (response.data.pagination) {
        result.pagination = response.data.pagination;
      }
      if (response.data.total) {
        result.total = response.data.total;
      }
      if (response.data.page) {
        result.page = response.data.page;
      }
      if (response.data.limit) {
        result.limit = response.data.limit;
      }

      return result;
    }
    
    return {
      success: true,
      data: response.data,
      message: 'Success',
      raw: response.data,
      isMock: false,
    };
  } catch (error) {
    console.error('Error searching events:', error);
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to search events',
      status: error.status,
      error: error,
      pagination: null,
    };
  }
};

export const getEvent = async (eventId) => {
  try {
    const response = await api.get(`/api/v1/events/${eventId}`);
    
    if (response.data && response.data.data) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Success',
        raw: response.data,
      };
    }
    
    return {
      success: true,
      data: response.data,
      message: 'Success',
      raw: response.data,
    };
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error);
    return {
      success: false,
      data: null,
      message: error.message || `Failed to fetch event ${eventId}`,
      status: error.status,
      error: error,
    };
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const formatSensorStatus = (status) => {
  const statusMap = {
    online: { label: 'Online', className: 'status-online', icon: '✓' },
    offline: { label: 'Offline', className: 'status-offline', icon: '○' },
    warning: { label: 'Warning', className: 'status-warning', icon: '⚠' },
    critical: { label: 'Critical', className: 'status-critical', icon: '✕' },
  };
  return statusMap[status] || { label: status || 'Unknown', className: 'status-unknown', icon: '?' };
};

export const formatEventType = (eventType) => {
  const typeMap = {
    normal: { label: 'Normal', className: 'event-normal' },
    alert: { label: 'Alert', className: 'event-alert' },
    critical: { label: 'Critical', className: 'event-critical' },
    heartbeat: { label: 'Heartbeat', className: 'event-heartbeat' },
    relay_action: { label: 'Relay Action', className: 'event-relay' },
  };
  return typeMap[eventType] || { label: eventType || 'Unknown', className: 'event-unknown' };
};

export const formatMLClassification = (classification) => {
  const classMap = {
    normal: { label: 'Normal', className: 'ml-normal' },
    anomaly: { label: 'Anomaly', className: 'ml-anomaly' },
    critical: { label: 'Critical', className: 'ml-critical' },
  };
  return classMap[classification] || { label: classification || 'Unknown', className: 'ml-unknown' };
};

export default api;