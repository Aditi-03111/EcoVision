import React from 'react';
import { Camera } from 'lucide-react';
import { EventCard } from './EventCard.jsx';

export function EventList({ events, onStatusUpdate }) {
  if (events.length === 0) {
    return (
      <section className="event-list">
        <div className="empty-state">
          <Camera size={42} />
          <h3>No events yet</h3>
          <p>Upload a camera-trap image to run the monitoring pipeline.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="event-list">
      {events.map((event) => (
        <EventCard key={event._id} event={event} onStatus={onStatusUpdate} />
      ))}
    </section>
  );
}
