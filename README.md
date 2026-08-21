# Security Monitoring Dashboard

A real-time monitoring dashboard for perimeter fence sensors with live zone status, telemetry, events, and event history.

## Features

* **3-Zone Status** – Live zone monitoring with voltage, current, temperature, and status indicators (online/offline/warning/critical)
* **Physical Condition** – Sensor health, temperature, relay state, and last heartbeat
* **Electrical Telemetry** – Voltage and current readings per zone with active sensor count
* **Events Feed** – Live event stream with ML classification and anomaly scores
* **Event History** – Searchable, filterable, paginated event table

## Tech Stack

| Layer    | Technology                |
| -------- | ------------------------- |
| Frontend | React 18, Vite, Axios     |
| Backend  | Node.js, Express, MongoDB |
| Styling  | Custom CSS                |

## Quick Start

```bash
# Clone repository
git clone https://github.com/your-username/security-monitoring-dashboard.git
cd security-monitoring-dashboard

# Backend setup
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend setup - new terminal
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5000" > .env
echo "VITE_USE_MOCK_DATA=false" >> .env
npm run dev
```

## API Endpoints

| Endpoint                   | Method | Description         |
| -------------------------- | ------ | ------------------- |
| `/api/v1/fence/status`     | GET    | All sensor statuses |
| `/api/v1/fence/status/:id` | GET    | Single sensor       |
| `/api/v1/events`           | GET    | Paginated events    |
| `/api/v1/events/search`    | GET    | Search events       |
| `/api/v1/events/:id`       | GET    | Single event        |

### Response Formats

#### Sensor

```json
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
```

#### Event

```json
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
```

## Dashboard Components

| Component                | Displays                                                                 |
| ------------------------ | ------------------------------------------------------------------------ |
| **3-Zone Status**        | Zone name, status, voltage, current, temperature, sensor count           |
| **Physical Condition**   | Overall health, temperature, relay state, heartbeat, status distribution |
| **Electrical Telemetry** | Latest voltage/current, ranges, active sensors, per-zone readings        |
| **Events**               | Event type, sensor ID, ML classification, anomaly score, action          |
| **Event History**        | Table with search, filters, and pagination                               |

## Environment Variables

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000
VITE_USE_MOCK_DATA=false
```

### Backend `.env`

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fenceguard
NODE_ENV=development
```

## Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── routes/
│   └── package.json
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
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── package.json
└── README.md
```

## Testing

```bash
# Test API endpoints
curl http://localhost:5000/api/v1/fence/status

curl "http://localhost:5000/api/v1/events?page=1&limit=10"

# Run frontend
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

## Troubleshooting

| Issue                 | Solution                                                            |
| --------------------- | ------------------------------------------------------------------- |
| Network Error         | Check backend with `curl http://localhost:5000/api/v1/fence/status` |
| Mock Data showing     | Set `VITE_USE_MOCK_DATA=false` in `.env`                            |
| Empty data            | Check MongoDB: `mongosh` → `use fenceguard` → `db.sensors.find()`   |
| React rendering error | Render `error.message` instead of the error object                  |

## Database Setup

### Start MongoDB Shell

```bash
mongosh
```

### Select Database

```javascript
use fenceguard
```

### Insert Sensors

```javascript
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
  }
])
```

### Insert Events

```javascript
db.events.insertMany([
  {
    sensorId: "SENSOR_001",
    timestamp: new Date().toISOString(),
    eventType: "normal",
    voltage: 120.5,
    current: 1.2,
    temperature: 25.4,
    anomalyScore: 0.1,
    mlClassification: "normal",
    action: "none"
  }
])
```

## Contributing

1. Fork the repository.
2. Create a feature branch:

```bash
git checkout -b feature/amazing-feature
```

3. Commit your changes:

```bash
git commit -m "Add amazing feature"
```

4. Push the branch:

```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request.

## License

ISC © FENCEGUARD-X Team

---

**Live Demo:** http://localhost:5173
**API Base:** http://localhost:5000/api/v1
**Last Updated:** August 2026
