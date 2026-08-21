🛡️ Security Monitoring Dashboard

A modern, responsive security and sensor monitoring dashboard built
with React + Vite, integrated with a Node.js / Express REST
API and MongoDB.

The dashboard is designed for perimeter fence monitoring and
provides a single interface for monitoring zone health, physical sensor
conditions, electrical telemetry, live events, and historical events.

✨ Features

🟢 1. 3-Zone Status

Monitor the health of all configured fence zones in real time.

Zone status: online, offline, warning, critical

Voltage readings

Current readings

Temperature readings

Relay state

Sensor count

Last update time

Zone-wise sensor grouping

🌡️ 2. Physical Condition

Provides an overall view of sensor and physical system health.

Overall health status

Online / warning / critical / offline distribution

Temperature monitoring

Relay state

Last heartbeat

Last update

Sensor locations grouped by zone

⚡ 3. Electrical Telemetry

Displays the latest electrical readings received from sensors.

Latest voltage

Latest current

Voltage range

Current range

Active sensor count

Sensors reporting data

Zone-wise electrical readings

Sensor status

🚨 4. Events

Displays the latest events received from the backend.

Event type

Sensor ID

Voltage at event time

Current at event time

Temperature at event time

ML classification

Anomaly score

System action

Event timestamp

📜 5. Event History

Provides a searchable and filterable historical event view.

Search events

Filter by sensor

Filter by event type

Event timestamps

Voltage

Current

Temperature

Anomaly score

ML classification

Action

Pagination-ready API integration

🧰 Tech Stack

Layer              Technology

Frontend           React 18 + Vite
Styling            Custom CSS
HTTP Client        Axios
State Management   React Hooks
Backend            Node.js + Express
Database           MongoDB
API                REST
Development        npm + Vite

📁 Project Structure

security-monitoring-dashboard/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── routes/
│   │
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
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env
│   └── package.json
│
└── README.md

🚀 Quick Start

✅ Prerequisites

Install the following before starting:

Node.js >= 18

npm >= 6

MongoDB local installation or MongoDB Atlas

Git

Check your installed versions:

node --version
npm --version
git --version

1️⃣ Clone the Repository

git clone https://github.com/yourusername/security-monitoring-dashboard.git
cd security-monitoring-dashboard

2️⃣ Start the Backend

Open a terminal:

cd backend
npm install

Create a backend .env file:

PORT=5000
MONGODB_URI=mongodb://localhost:27017/fenceguard
NODE_ENV=development

Start the backend:

npm run dev

Backend URL:

http://localhost:5000

Keep this terminal running.

3️⃣ Start the Frontend

Open a new terminal:

cd frontend
npm install

Create frontend/.env:

VITE_API_URL=http://localhost:5000
VITE_USE_MOCK_DATA=false

Start Vite:

npm run dev

Open the dashboard:

http://localhost:5173

🔌 Backend API

The frontend consumes the following REST endpoints:

Method   Endpoint                     Description

GET    /api/v1/fence/status       Get all sensor statuses
GET    /api/v1/fence/status/:id   Get one sensor
GET    /api/v1/events             Get paginated events
GET    /api/v1/events/search      Search and filter events
GET    /api/v1/events/:id         Get one event

📡 Sensor Data Model

Example sensor response:

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

Sensor Fields

Field                   Example Meaning

sensorId         SENSOR_001 Unique sensor identifier
location             Zone 1 Sensor zone
status               online Current sensor status
voltage               120.5 Voltage in volts
current                 1.2 Current reading
temperature            25.4 Temperature in °C
relayState             true Relay state
lastUpdate      ISO timestamp Last sensor update

🚨 Event Data Model

Example event:

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

Event Fields

Field                Example         Meaning

sensorId           SENSOR_001    Sensor that generated the event
timestamp          ISO timestamp   Event time
eventType          normal        Event category
voltage            120.5         Voltage during event
current            1.2           Current during event
temperature        25.4          Temperature during event
anomalyScore       0.1           ML anomaly score
mlClassification   normal        ML classification
action             none          System action

📦 API Response Wrapper

The backend may return data using:

{
  "data": [],
  "message": "Success"
}

The frontend API service unwraps the data property before passing the
result to the React components.

This keeps the UI components focused on displaying the actual sensor and
event models.

🖥️ Dashboard Components

Component                           Purpose

🟢 3-Zone Status                Zone status, voltage, current,
temperature, relay state and sensor
count

🌡️ Physical Condition           Overall health, temperature, relay,
heartbeat and status distribution

⚡ Electrical Telemetry         Latest voltage/current, ranges,
active sensors and zone readings

🚨 Events                       Event type, sensor ID, ML
classification, anomaly score and
actions

🔄 Data Flow

┌──────────────┐
│   MongoDB    │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Node.js / Express    │
│      REST API        │
└──────────┬───────────┘
           │
           ├── GET /api/v1/fence/status
           │
           └── GET /api/v1/events
                    │
                    ▼
           ┌─────────────────┐
           │ Axios API Layer │
           │    api.js       │
           └────────┬────────┘
                    │
                    ▼
             ┌─────────────┐
             │ React App   │
             └──────┬──────┘
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
  Zone Status   Physical     Electrical
                Condition    Telemetry
       │
       ├───────────────┐
       ▼               ▼
    Events       Event History

⚙️ Environment Variables

Frontend .env

VITE_API_URL=http://localhost:5000
VITE_USE_MOCK_DATA=false

Important

VITE_USE_MOCK_DATA=false

means the dashboard uses the actual backend API instead of mock
data.

After changing .env, restart Vite:

npm run dev

Backend .env

PORT=5000
MONGODB_URI=mongodb://localhost:27017/fenceguard
NODE_ENV=development

🧪 Test the Backend Before Starting the UI

Testing the API directly is the fastest way to confirm whether the
backend is working.

Test Fence Status

curl http://localhost:5000/api/v1/fence/status

Test Events

curl "http://localhost:5000/api/v1/events?page=1&limit=10"

Test Individual Sensor

curl http://localhost:5000/api/v1/fence/status/SENSOR_001

Expected Result

You should receive JSON containing sensor or event data.

For example:

{
  "data": [
    {
      "sensorId": "SENSOR_001",
      "location": "Zone 1",
      "status": "online",
      "voltage": 120.5,
      "current": 1.2,
      "temperature": 25.4,
      "relayState": true
    }
  ]
}

If the API works in curl but the dashboard does not show data, the
issue is likely in the frontend/API configuration.

🗄️ Sample MongoDB Data

Start MongoDB shell:

mongosh

Select the database:

use fenceguard

Insert sample sensors:

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

Insert a sample event:

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

Verify the records:

db.sensors.find().pretty()

db.events.find().pretty()

🛠️ Troubleshooting

❌ Backend Returns 500 Internal Server Error

Check the following:

✓ Backend is running
✓ MongoDB is running
✓ PORT is correct
✓ MONGODB_URI is correct
✓ API route exists
✓ Database contains the expected collections
✓ Backend terminal contains no database/route errors

Test directly:

curl http://localhost:5000/api/v1/fence/status

Then check the backend terminal for the actual error.

❌ Network Error in Frontend

Check:

VITE_API_URL=http://localhost:5000

Then restart:

npm run dev

❌ Mock Data Appears

Check:

VITE_USE_MOCK_DATA=false

Then restart Vite:

npm run dev

❌ React Error: Objects Are Not Valid as a React Child

Do not render an entire error object:

<p>{error}</p>

Instead render a readable property:

<p>{error?.message || "Something went wrong"}</p>

❌ Empty Dashboard

First test the backend:

curl http://localhost:5000/api/v1/fence/status

curl "http://localhost:5000/api/v1/events?page=1&limit=10"

If the API returns empty data, check MongoDB:

mongosh

use fenceguard

db.sensors.find()
db.events.find()

If the API returns correct data but the dashboard is empty, check:

1. VITE_API_URL
2. Browser Network tab
3. api.js response mapping
4. Component data mapping
5. Browser console errors

🔍 Recommended Development Workflow

Follow this order when running the project:

1. Start MongoDB
       ↓
2. Start Backend
       ↓
3. Test REST API
       ↓
4. Start Frontend
       ↓
5. Open Dashboard
       ↓
6. Open Browser DevTools
       ↓
7. Check Network → API responses
       ↓
8. Verify dashboard values match backend

This makes backend/frontend integration issues much easier to identify.

🎯 Current Scope

The dashboard currently focuses only on the five required monitoring
functions:

┌───────────────────────────────┐
│   Security Monitoring System  │
├───────────────────────────────┤
│  1. 3-Zone Status             │
│  2. Physical Condition        │
│  3. Electrical Telemetry      │
│  4. Events                    │
│  5. Event History             │
└───────────────────────────────┘

The frontend is designed to consume actual backend sensor and event
data rather than relying on assumed frontend-only fields.

🚀 Future Improvements

Possible future enhancements:

WebSocket-based real-time updates

Advanced analytics and historical charts

User authentication

Role-based access control

Configurable sensor thresholds

Event acknowledgement and resolution

Event export

Notifications and alerts

Advanced monitoring reports

🤝 Contributing

Contributions are welcome.

Development process

# 1. Create a feature branch
git checkout -b feature/your-feature

# 2. Make your changes

# 3. Test backend and frontend

# 4. Check API integration

# 5. Commit
git add .
git commit -m "feat: add your feature"

# 6. Push
git push origin feature/your-feature

Then open a Pull Request.
