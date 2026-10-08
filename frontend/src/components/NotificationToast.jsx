import React from 'react';
import {
  BellRing,
  ShieldAlert,
  ShieldCheck,
  Film,
  Camera,
  MapPin,
  Clock,
  X,
  ArrowRight,
  Sparkles,
  PawPrint
} from 'lucide-react';
import { formatDate } from '../utils/formatters.jsx';

export function NotificationToast({ notification, onClose, onJumpToEvent }) {
  if (!notification) return null;

  const isHighThreat = notification.threat === 'high';
  const isVideo = notification.mediaType === 'video';

  return (
    <aside
      className={`notification-toast ${isHighThreat ? 'threat-alert' : 'info-alert'}`}
      role="status"
      aria-live="polite"
    >
      <div className="notif-header">
        <div className="notif-badge">
          <span className={`pulse-dot ${isHighThreat ? 'bg-red-400' : 'bg-emerald-400'}`} />
          {isHighThreat ? <ShieldAlert size={14} className="text-red-400" /> : <BellRing size={14} className="text-emerald-400" />}
          <span className="notif-type">
            {isVideo ? 'Video Recognition Alert' : 'Camera-Trap Detection Alert'}
          </span>
        </div>

        <button onClick={onClose} className="notif-close-btn" aria-label="Dismiss notification">
          <X size={15} />
        </button>
      </div>

      <div className="notif-body">
        <div className="notif-main">
          <div className="notif-species-row">
            <span className="notif-icon-wrap">
              {isVideo ? <Film size={18} className="text-blue-400" /> : <PawPrint size={18} className="text-emerald-400" />}
            </span>
            <div>
              <h4 className="notif-title">
                {notification.species}
              </h4>
              <p className="notif-virtual-id">
                Virtual ID: <strong>{notification.virtualId}</strong>
                {notification.matchScore && (
                  <span className="notif-score">({notification.matchScore}% Match)</span>
                )}
              </p>
            </div>
          </div>

          <div className="notif-meta">
            <span><MapPin size={12} /> {notification.location}</span>
            <span><Clock size={12} /> {formatDate(notification.timestamp)}</span>
            {notification.videoTimestamp !== undefined && notification.videoTimestamp !== null && (
              <span className="notif-timecode">
                <Film size={12} /> At {Number(notification.videoTimestamp).toFixed(1)}s
              </span>
            )}
          </div>
        </div>

        <div className="notif-actions">
          <span className={`pill ${notification.threat}`}>
            {notification.threat} threat
          </span>
          <button
            onClick={() => {
              onJumpToEvent(notification.id);
              onClose();
            }}
            className="notif-view-btn"
          >
            Inspect Event
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
