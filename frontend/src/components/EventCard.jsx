import React from 'react';
import { Clock, MapPin, BadgeCheck, Camera, Check } from 'lucide-react';
import { formatDate, iconFor } from '../utils/formatters.jsx';

export function EventCard({ event, onStatus }) {
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
          <span><BadgeCheck size={16} />{(event.identityStatus || '').replace('_', ' ')}</span>
          <span><Camera size={16} />{event.preprocessing?.mode || 'standard'}</span>
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
