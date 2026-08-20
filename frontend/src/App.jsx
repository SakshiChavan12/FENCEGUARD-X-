import React from 'react';
import ZoneStatus from './components/ZoneStatus';
import PhysicalCondition from './components/PhysicalCondition';
import ElectricalTelemetry from './components/ElectricalTelemetry';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Security Monitoring Dashboard</h1>
        <div className="connection-status">
          <span className="status-dot"></span>
          <span className="status-text">System Connected</span>
        </div>
      </header>
      
      <main className="app-content">
        <div className="dashboard-grid">
          
          {/* Section 1: 3-Zone Status - Full width */}
          <div className="grid-full-width">
            <ZoneStatus />
          </div>
          
          {/* Section 2: Physical Condition - Full width */}
          <div className="grid-full-width">
            <PhysicalCondition />
          </div>
          
          {/* Section 3: Electrical Telemetry - Full width */}
          <div className="grid-full-width">
            <ElectricalTelemetry />
          </div>
          
          {/* Section 4: Events */}
          <div className="dashboard-card placeholder-card">
            <div className="card-header">
              <h3 className="card-title">Events</h3>
              <span className="card-badge">Coming Soon</span>
            </div>
            <div className="card-body">
              <p className="card-placeholder">Coming soon...</p>
            </div>
          </div>
          
          {/* Section 5: Event History - Full width */}
          <div className="grid-full-width">
            <div className="dashboard-card placeholder-card">
              <div className="card-header">
                <h3 className="card-title">Event History</h3>
                <span className="card-badge">Coming Soon</span>
              </div>
              <div className="card-body">
                <p className="card-placeholder">Coming soon...</p>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

export default App;