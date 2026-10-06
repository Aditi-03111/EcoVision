import React, { useEffect, useMemo, useState } from 'react';
import { LandingPage } from './components/LandingPage.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { Header } from './components/Header.jsx';
import { SummaryStats } from './components/SummaryStats.jsx';
import { EventList } from './components/EventList.jsx';
import { nowLocal } from './utils/formatters.jsx';
import './styles.css';

const API = import.meta.env.VITE_API_URL || '';

export function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'app'
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState({ total: 0, highThreat: 0, pending: 0, knownAnimals: 0 });
  const [form, setForm] = useState({ location: 'North Ridge Camera 04', timestamp: nowLocal() });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('all');

  async function refresh() {
    try {
      const [eventRes, summaryRes] = await Promise.all([
        fetch(`${API}/api/events`),
        fetch(`${API}/api/summary`)
      ]);
      setEvents(await eventRes.json());
      setSummary(await summaryRes.json());
    } catch (err) {
      console.error('Failed to refresh events:', err);
    }
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
    try {
      const body = new FormData();
      body.append('image', file);
      body.append('location', form.location);
      body.append('timestamp', new Date(form.timestamp).toISOString());

      const response = await fetch(`${API}/api/upload`, { method: 'POST', body });
      if (!response.ok) throw new Error('Upload failed');
      setFile(null);
      event.currentTarget.reset();
      await refresh();
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(id, reviewStatus) {
    try {
      await fetch(`${API}/api/events/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewStatus })
      });
      await refresh();
    } catch (err) {
      console.error('Status update error:', err);
    }
  }

  if (currentView === 'landing') {
    return (
      <LandingPage onOpenApp={() => setCurrentView('app')} />
    );
  }

  return (
    <main className="app-shell">
      <Sidebar
        form={form}
        setForm={setForm}
        file={file}
        setFile={setFile}
        busy={busy}
        onUpload={handleUpload}
        onBackToLanding={() => setCurrentView('landing')}
      />

      <section className="workspace">
        <Header filter={filter} onFilterChange={setFilter} />
        <SummaryStats summary={summary} />
        <EventList events={visibleEvents} onStatusUpdate={updateStatus} />
      </section>
    </main>
  );
}

export default App;
