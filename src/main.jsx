import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle,
  BadgeCheck,
  Camera,
  Car,
  Check,
  Clock,
  MapPin,
  Upload,
  User,
  PawPrint
} from 'lucide-react';
import './styles.css';

const API = import.meta.env.VITE_API_URL || '';

function App() {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState({ total: 0, highThreat: 0, pending: 0, knownAnimals: 0 });
  const [form, setForm] = useState({ location: 'North Ridge Camera 04', timestamp: nowLocal() });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('all');

  async function refresh() {
    const [eventRes, summaryRes] = await Promise.all([
      fetch(`${API}/api/events`),
      fetch(`${API}/api/summary`)
    ]);
    setEvents(await eventRes.json());
    setSummary(await summaryRes.json());
  }

  useEffect(() => {
    refresh();
  }, []);

  const visibleEvents = useMemo(() => {
    if (filter === 'all') return events;
    return events.filter((event) => event.reviewStatus === filter || event.threatLevel === filter);
  }, [events, filter]);

  async function handleUpload(event) {
    event.preventDefault();
    if (!file) return;
    setBusy(true);
    const body = new FormData();
    body.append('image', file);
    body.append('location', form.location);
    body.append('timestamp', new Date(form.timestamp).toISOString());
    const response = await fetch(`${API}/api/upload`, { method: 'POST', body });
    if (!response.ok) throw new Error('Upload failed');
    setFile(null);
    event.currentTarget.reset();
    await refresh();
    setBusy(false);
  }

  async function updateStatus(id, reviewStatus) {
    await fetch(`${API}/api/events/${id}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewStatus })
    });
    await refresh();
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><PawPrint size={24} /></div>
          <div>
            <h1>EcoVision</h1>
            <p>Wildlife monitoring command center</p>
          </div>
        </div>

        <form className="upload-panel" onSubmit={handleUpload}>
          <label>
            Camera-trap image
            <span className="file-input">
              <Upload size={18} />
              {file ? file.name : 'Choose image'}
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
            </span>
          </label>
          <label>
            Location
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </label>
          <label>
            Timestamp
            <input
              type="datetime-local"
              value={form.timestamp}
              onChange={(e) => setForm({ ...form, timestamp: e.target.value })}
            />
          </label>
          <button className="primary" disabled={!file || busy}>
            <Upload size={18} />
            {busy ? 'Analyzing...' : 'Analyze image'}
          </button>
        </form>

        <div className="pipeline">
          <span>CLAHE</span>
          <span>YOLOv8</span>
          <span>Siamese ReID</span>
          <span>Review queue</span>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Endangered species intelligence</p>
            <h2>Detection Events</h2>
          </div>
          <div className="filters">
            {['all', 'high', 'pending', 'reviewed', 'confirmed'].map((item) => (
              <button
                key={item}
                className={filter === item ? 'active' : ''}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </header>

        <section className="stats">
          <Metric icon={<Camera />} label="Events" value={summary.total} />
          <Metric icon={<AlertTriangle />} label="High threat" value={summary.highThreat} tone="danger" />
          <Metric icon={<Clock />} label="Pending" value={summary.pending} />
          <Metric icon={<BadgeCheck />} label="Known animals" value={summary.knownAnimals} tone="good" />
        </section>

        <section className="event-list">
          {visibleEvents.length === 0 ? (
            <div className="empty-state">
              <Camera size={42} />
              <h3>No events yet</h3>
              <p>Upload a camera-trap image to run the monitoring pipeline.</p>
            </div>
          ) : (
            visibleEvents.map((event) => (
              <EventCard key={event._id} event={event} onStatus={updateStatus} />
            ))
          )}
        </section>
      </section>
    </main>
  );
}

function Metric({ icon, label, value, tone = '' }) {
  return (
    <div className={`metric ${tone}`}>
      {React.cloneElement(icon, { size: 20 })}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EventCard({ event, onStatus }) {
  const identity = event.animalIdentity;
  return (
    <article className={`event-card threat-${event.threatLevel}`}>
      <div className="thumb-wrap">
        <img src={event.imagePath} alt={event.originalName} />
        {event.detections.map((detection) => (
          <span
            key={detection.id}
            className={`bbox ${detection.label}`}
            style={{
              left: `${detection.bbox.x}%`,
              top: `${detection.bbox.y}%`,
              width: `${detection.bbox.width}%`,
              height: `${detection.bbox.height}%`
            }}
            title={`${detection.label} ${Math.round(detection.confidence * 100)}%`}
          />
        ))}
      </div>

      <div className="event-main">
        <div className="event-title">
          <div>
            <h3>{identity ? `${identity.species} · ${identity.identity}` : 'Non-animal activity'}</h3>
            <p>{event.originalName}</p>
          </div>
          <span className={`pill ${event.threatLevel}`}>{event.threatLevel} threat</span>
        </div>

        <div className="meta-grid">
          <span><Clock size={16} />{formatDate(event.timestamp)}</span>
          <span><MapPin size={16} />{event.location}</span>
          <span><BadgeCheck size={16} />{event.identityStatus.replace('_', ' ')}</span>
          <span><Camera size={16} />{event.preprocessing.mode}</span>
        </div>

        <div className="detections">
          {event.detections.map((detection) => (
            <span key={detection.id}>
              {iconFor(detection.label)}
              {detection.label} {Math.round(detection.confidence * 100)}%
              {detection.reid ? ` · ${detection.reid.status} ${Math.round(detection.reid.similarity * 100)}%` : ''}
            </span>
          ))}
        </div>
      </div>

      <div className="review">
        <select value={event.reviewStatus} onChange={(e) => onStatus(event._id, e.target.value)}>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="confirmed">Confirmed</option>
        </select>
        <button onClick={() => onStatus(event._id, 'confirmed')} title="Confirm event">
          <Check size={18} />
        </button>
      </div>
    </article>
  );
}

function iconFor(label) {
  if (label === 'human') return <User size={15} />;
  if (label === 'vehicle') return <Car size={15} />;
  return <PawPrint size={15} />;
}

function nowLocal() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

createRoot(document.getElementById('root')).render(<App />);
