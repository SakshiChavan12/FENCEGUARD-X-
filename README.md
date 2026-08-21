Security Monitoring Dashboard

A modern, responsive monitoring dashboard for security and sensor
systems, built with React + Vite and integrated with a RESTful
backend.

The dashboard is designed for perimeter fence monitoring and provides a
clear view of zone health, physical sensor conditions, electrical
telemetry, live events, and historical events.

Features

3-Zone Status

Monitor the status of all configured zones

Display sensor status: online, offline, warning, or critical

Show voltage, current, temperature, and relay state

Display sensor count and last update time

Physical Condition

Overall sensor health summary

Online / warning / critical / offline distribution

Temperature monitoring

Relay state

Last heartbeat and last update

Sensor locations grouped by zone

Electrical Telemetry

Latest voltage and current readings

Voltage and current ranges

Active sensor count

Sensors currently reporting data

Electrical readings grouped by zone

Events

Live event feed

Event type and sensor ID

Voltage, current, and temperature at event time

ML classification

Anomaly score

Action performed by the system

Event timestamp

Event History

Historical event table

Search events

Filter by sensor

Filter by event type

View voltage, current, temperature, anomaly score, ML
classification, and action

Pagination-ready API integration

Tech Stack

Frontend: React 18 + Vite

Styling: Custom CSS

HTTP Client: Axios

State Management: React Hooks

Backend: Node.js / Express REST API

Database: MongoDB

API: RESTful endpoints

Project Structure

security-monitoring-dashboard/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── routes/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ZoneStatus.jsx
│   │   │   ├── PhysicalCondition.jsx
│   │   │   ├── ElectricalTelemetry.jsx
│   │   │   ├── Events.jsx
│   │   │   └── EventHistory.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── package.json
│
└── README.md

Quick Start

Prerequisites

Make sure the following are installed:

Node.js >= 18

npm >= 6

MongoDB local installation or MongoDB Atlas

Git

1. Clone the Repository

git clone https://github.com/yourusername/security-monitoring-dashboard.git
cd security-monitoring-dashboard

2. Start the Backend

cd backend
npm install

Create a .env file:

PORT=5000
MONGODB_URI=mongodb://localhost:27017/fenceguard
NODE_ENV=development

Start the backend:

npm run dev

The backend should be available at:

http://localhost:5000

3. Start the Frontend

Open a new terminal:

cd frontend
npm install

Create frontend/.env:

VITE_API_URL=http://localhost:5000
VITE_USE_MOCK_DATA=false

Start the frontend:

npm run dev

Open:

http://localhost:5173

Backend API

The frontend is integrated with the following backend endpoints.

Method   Endpoint                     Purpose

GET      /api/v1/fence/status       Get all sensor statuses
GET      /api/v1/fence/status/:id   Get an individual sensor
GET      /api/v1/events             Get paginated events
GET      /api/v1/events/search      Search and filter events
GET      /api/v1/events/:id         Get an individual event

Sensor Response

{
  "sensorId": "SENSOR_001",
  "location": "Zone 1",
  "status": "online",
  "voltage": 120.5,
  "current": 1.2,
  "temperature": 25.4,
  "relayState": true,
  "lastUpdate": "2026-08-21T09:00:00.000Z"
}

Event Response

{
  "sensorId": "SENSOR_001",
  "timestamp": "2026-08-21T09:00:00.000Z",
  "eventType": "normal",
  "voltage": 120.5,
  "current": 1.2,
  "temperature": 25.4,
  "anomalyScore": 0.1,
  "mlClassification": "normal",
  "action": "none"
}

API Response Wrapper

The backend may return responses using the following structure:

{
  "data": [],
  "message": "Success"
}

The frontend API service handles this response structure before passing
data to the dashboard components.

Dashboard Components

Component                           Displays

3-Zone Status                   Zone status, voltage, current,
temperature, relay state, sensor
count

Physical Condition              Overall health, temperature, relay
state, heartbeat, status
distribution

Electrical Telemetry            Latest voltage/current, ranges,
active sensors, per-zone readings

Events                          Event type, sensor ID, ML
classification, anomaly score,
electrical readings, actions

Data Flow

MongoDB
   │
   ▼
Backend REST API
   │
   ├── /api/v1/fence/status
   │
   └── /api/v1/events
          │
          ▼
      Axios API Service
          │
          ▼
     React Components
          │
          ├── 3-Zone Status
          ├── Physical Condition
          ├── Electrical Telemetry
          ├── Events
          └── Event History

Environment Variables

Frontend

Create frontend/.env:

VITE_API_URL=http://localhost:5000
VITE_USE_MOCK_DATA=false

VITE_USE_MOCK_DATA=false ensures the dashboard uses the backend API
instead of mock data.

Backend

Create backend/.env:

PORT=5000
MONGODB_URI=mongodb://localhost:27017/fenceguard
NODE_ENV=development

Testing the API

Before opening the frontend, verify that the backend is responding.

Fence Status

curl http://localhost:5000/api/v1/fence/status

Events

curl "http://localhost:5000/api/v1/events?page=1&limit=10"

Individual Sensor

curl http://localhost:5000/api/v1/fence/status/SENSOR_001

If these endpoints return data successfully, the frontend can consume
the backend data.

Sample Database Data

If sample data is required, use MongoDB:

mongosh

Then:

use fenceguard

db.sensors.insertMany([
  {
    sensorId: "SENSOR_001",
    location: "Zone 1",
    status: "online",
    voltage: 120.5,
    current: 1.2,
    temperature: 25.4,
    relayState: true,
    lastUpdate: new Date().toISOString()
  },
  {
    sensorId: "SENSOR_002",
    location: "Zone 2",
    status: "online",
    voltage: 118.3,
    current: 1.5,
    temperature: 26.1,
    relayState: true,
    lastUpdate: new Date().toISOString()
  },
  {
    sensorId: "SENSOR_003",
    location: "Zone 3",
    status: "warning",
    voltage: 115.7,
    current: 1.8,
    temperature: 27.8,
    relayState: true,
    lastUpdate: new Date().toISOString()
  }
])

Sample event:

db.events.insertOne({
  sensorId: "SENSOR_001",
  timestamp: new Date().toISOString(),
  eventType: "normal",
  voltage: 120.5,
  current: 1.2,
  temperature: 25.4,
  anomalyScore: 0.1,
  mlClassification: "normal",
  action: "none",
  metadata: {}
})

Troubleshooting

Backend returns 500

Check:

Backend server is running on port 5000

MongoDB is running

MONGODB_URI is correct

The requested API endpoint exists

Backend terminal logs for the actual error

Test directly:

curl http://localhost:5000/api/v1/fence/status

Network Error in Frontend

Check frontend/.env:

VITE_API_URL=http://localhost:5000

Then restart Vite:

npm run dev

Mock Data Appears

Make sure:

VITE_USE_MOCK_DATA=false

Then restart the frontend development server.

React Error: Objects Are Not Valid as a React Child

Do not render an error object directly.

Use:

<p>{error?.message || "Something went wrong"}</p>

instead of:

<p>{error}</p>

Empty Dashboard

Verify the backend API first:

curl http://localhost:5000/api/v1/fence/status
curl "http://localhost:5000/api/v1/events?page=1&limit=10"

If the API returns empty data, check MongoDB collections and backend
logs.

Development Workflow

Recommended startup order:

1. Start MongoDB
       ↓
2. Start Backend
       ↓
3. Test API with curl
       ↓
4. Start Frontend
       ↓
5. Open Dashboard
       ↓
6. Verify live API data in browser

Current Scope

This dashboard intentionally focuses on the following core
functionality:

3-Zone Status

Physical Condition

Electrical Telemetry

Events

Event History

The UI is designed to consume actual backend sensor and event data
rather than relying on assumed frontend-only fields.

Future Improvements

Potential future enhancements include:

WebSocket-based real-time updates

Advanced analytics and historical charts

User authentication and role-based access

Configurable sensor thresholds

Event acknowledgement and resolution

Exporting event history

Advanced monitoring and notification features

Contributing

Create a feature branch.

Make the required changes.

Test both backend and frontend.

Verify API integration.

Commit your changes.

Push the branch.

Open a Pull Request.
