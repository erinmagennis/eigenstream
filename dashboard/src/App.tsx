import { useEffect, useState, useRef } from 'react';
import './App.css';
import { DemoDayStats } from './types';
import { VideoPlayer } from './VideoPlayer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

function App() {
  const [stats, setStats] = useState<DemoDayStats | null>(null);
  const [connected, setConnected] = useState(false);
  const [teeAddress, setTeeAddress] = useState<string>('');
  const [localTimer, setLocalTimer] = useState<number>(0);
  const ws = useRef<WebSocket | null>(null);

  // Format duration in seconds to MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format total duration to Xh Ym format
  const formatTotalDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Get energy level description
  const getEnergyLevel = (activityLevel: number): string => {
    if (activityLevel > 70) return 'High';
    if (activityLevel > 40) return 'Medium';
    return 'Low';
  };

  // Connect to WebSocket
  useEffect(() => {
    const connectWebSocket = () => {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log('Connected to EigenStream TEE');
        setConnected(true);
      };

      ws.current.onmessage = (event) => {
        console.log('📥 Received message:', event.data);
        const message = JSON.parse(event.data);
        console.log('📊 Parsed message:', message);

        if (message.type === 'initial-state' || message.type === 'stats-update') {
          console.log('✅ Updating stats with:', message.data);
          setStats(message.data);
        } else if (message.type === 'pitch-started' || message.type === 'pitch-ended') {
          console.log('🎤 Pitch event, fetching fresh stats...');
          // Fetch updated stats after pitch events
          fetch(`${API_URL}/api/stats`)
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(console.error);
        } else {
          console.log('⚠️ Unknown message type:', message.type);
        }
      };

      ws.current.onclose = () => {
        console.log('Disconnected from EigenStream TEE');
        setConnected(false);
        // Reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    connectWebSocket();

    // Fetch TEE address
    fetch(`${API_URL}/api/tee/address`)
      .then(res => res.json())
      .then(data => setTeeAddress(data.address))
      .catch(console.error);

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // Sync local timer with server stats
  useEffect(() => {
    if (stats && stats.currentPitch !== null) {
      setLocalTimer(stats.currentPitchDuration);
    } else {
      setLocalTimer(0);
    }
  }, [stats]);

  // Increment timer every second when pitch is active
  useEffect(() => {
    if (stats && stats.currentPitch !== null) {
      const interval = setInterval(() => {
        setLocalTimer(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [stats?.currentPitch]);

  const startNewPitch = async () => {
    try {
      await fetch(`${API_URL}/api/pitch/start`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to start pitch:', error);
    }
  };

  const endCurrentPitch = async () => {
    try {
      await fetch(`${API_URL}/api/pitch/end`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to end pitch:', error);
    }
  };

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1>EigenHacker House Demo Day</h1>
          <div className="subtitle">
            <span className={`status-indicator ${connected ? 'connected' : 'disconnected'}`} />
            {connected ? 'Live from TEE' : 'Connecting...'}
          </div>
        </header>

        {/* Live Video Stream */}
        <VideoPlayer apiUrl={API_URL} />

        {stats ? (
          <>
            {/* Main Stats */}
            <div className="stats-grid">
              {/* Current Pitch */}
              <div className="stat-card large">
                <div className="stat-label">Current Pitch</div>
                <div className="stat-value">
                  {stats.currentPitch ? `#${stats.currentPitch}` : 'Waiting'}
                </div>
                {stats.currentPitch && (
                  <div className="stat-sub">
                    {formatDuration(localTimer)}
                  </div>
                )}
              </div>

              {/* Activity Level */}
              <div className="stat-card">
                <div className="stat-label">Activity Level</div>
                <div className="activity-bar">
                  <div
                    className="activity-fill"
                    style={{ width: `${stats.currentActivityLevel}%` }}
                  />
                </div>
                <div className="stat-sub">
                  {getEnergyLevel(stats.currentActivityLevel)}
                </div>
              </div>

              {/* Total Pitches */}
              <div className="stat-card">
                <div className="stat-label">Total Pitches</div>
                <div className="stat-value">{stats.totalPitches}</div>
              </div>

              {/* Total Time */}
              <div className="stat-card">
                <div className="stat-label">Total Time</div>
                <div className="stat-value">
                  {formatTotalDuration(stats.totalDuration)}
                </div>
              </div>

              {/* Average Length */}
              <div className="stat-card">
                <div className="stat-label">Avg Pitch Length</div>
                <div className="stat-value">
                  {formatDuration(stats.averagePitchLength)}
                </div>
              </div>

              {/* Crowd Energy */}
              <div className="stat-card">
                <div className="stat-label">Crowd Energy</div>
                <div className="stat-value energy">
                  {stats.currentActivityLevel}%
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="controls">
              <button
                className="btn btn-primary"
                onClick={startNewPitch}
                disabled={stats.currentPitch !== null}
              >
                Next Pitch
              </button>
              <button
                className="btn btn-secondary"
                onClick={endCurrentPitch}
                disabled={stats.currentPitch === null}
              >
                End Pitch
              </button>
            </div>

            {/* Attestation Footer */}
            <div className="attestation">
              <div className="attestation-label">Verified by Eigen-TEE</div>
              <div className="attestation-address">
                TEE Address: {teeAddress ? `${teeAddress.slice(0, 10)}...${teeAddress.slice(-8)}` : 'Loading...'}
              </div>
              {stats.attestationSignature && (
                <div className="attestation-sig">
                  Signature: {stats.attestationSignature.slice(0, 20)}...
                </div>
              )}
              <div className="attestation-time">
                Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
              </div>
            </div>
          </>
        ) : (
          <div className="loading">
            <div className="loading-spinner" />
            <p>Connecting to Eigen-TEE...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
