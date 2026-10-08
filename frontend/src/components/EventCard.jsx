import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  BadgeCheck,
  Camera,
  Check,
  ShieldAlert,
  Sparkles,
  Play,
  Film,
  RotateCcw,
  Tag
} from 'lucide-react';
import { formatDate, iconFor } from '../utils/formatters.jsx';

const FALLBACK_IMAGES = {
  tiger: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?q=80&w=800&auto=format&fit=crop',
  elephant: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?q=80&w=800&auto=format&fit=crop',
  rhino: 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?q=80&w=800&auto=format&fit=crop',
  vehicle: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop',
  default: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?q=80&w=800&auto=format&fit=crop'
};

export function EventCard({ event, onStatus, isHighlighted }) {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const identity = event.animalIdentity;
  const speciesKey = (identity?.species || event.detections?.[0]?.species || '').toLowerCase();
  const fallbackUrl = FALLBACK_IMAGES[speciesKey] || (event.threatLevel === 'medium' ? FALLBACK_IMAGES.vehicle : FALLBACK_IMAGES.default);
  const isVideo = event.mediaType === 'video' || !!event.videoPath;
  const videoTimestamp = event.detections?.find(d => d.videoTimestamp !== undefined)?.videoTimestamp;

  return (
    <article
      id={`event-${event._id}`}
      className={`event-card threat-${event.threatLevel} ${isHighlighted ? 'highlighted-event' : ''}`}
    >
      {/* Thumbnail or Video Player */}
      <div className="thumb-wrap">
        {isVideo && isPlayingVideo ? (
          <div className="relative w-full h-full bg-black">
            <video
              src={event.videoPath}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setIsPlayingVideo(false)}
              className="absolute top-2 right-2 bg-neutral-900/80 text-white rounded-full p-1 hover:bg-neutral-800 text-xs flex items-center gap-1 px-2"
            >
              <RotateCcw size={12} /> Keyframe
            </button>
          </div>
        ) : (
          <>
            <img
              src={event.imagePath}
              alt={event.originalName}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = fallbackUrl;
              }}
            />

            {/* Video Play Overlay */}
            {isVideo && (
              <button
                onClick={() => setIsPlayingVideo(true)}
                className="video-play-overlay group"
                aria-label="Play camera-trap video clip"
              >
                <div className="play-button-circle group-hover:scale-110 transition-transform">
                  <Play size={20} className="fill-white text-white ml-0.5" />
                </div>
                <span className="video-duration-tag">
                  {event.mediaDuration ? `${event.mediaDuration}s Video` : 'Play Clip'}
                </span>
              </button>
            )}

            {/* AI Bounding Box Overlays */}
            {(!isVideo || !isPlayingVideo) && event.detections.map((detection) => (
              <div
                key={detection.id}
                className={`bbox ${detection.label}`}
                style={{
                  left: `${detection.bbox.x}%`,
                  top: `${detection.bbox.y}%`,
                  width: `${detection.bbox.width}%`,
                  height: `${detection.bbox.height}%`
                }}
              >
                <span className="bbox-label">
                  {detection.label === 'human'
                    ? '👤 Human'
                    : detection.label === 'vehicle'
                    ? '🚗 Vehicle'
                    : `🐾 ${detection.species || 'Wildlife'}`} {Math.round(detection.confidence * 100)}%
                </span>
              </div>
            ))}

            <div className="thumb-gradient" />
            <span className="thumb-mode-badge">
              {isVideo ? <Film size={11} className="text-blue-400" /> : <Camera size={11} className="text-emerald-400" />}
              {isVideo ? 'Video Keyframe' : (event.preprocessing?.mode ? event.preprocessing.mode.replace('_', ' ') : 'Camera Trap')}
            </span>
          </>
        )}
      </div>

      {/* Main Metadata & Event Intelligence */}
      <div className="event-main">
        <div className="event-title">
          <div>
            <h3>
              {identity ? `${identity.species} · ${identity.identity}` : (event.detections?.[0]?.label === 'human' ? 'Human Intrusion Detected' : event.detections?.[0]?.species || 'Wildlife Activity')}
            </h3>
            <p className="filename-sub">{event.originalName} · {event.inferenceMetadata?.modelVersion || 'YOLOv8'}</p>
          </div>
          <span className={`pill ${event.threatLevel}`}>
            {event.threatLevel === 'high' && <ShieldAlert size={12} className="inline mr-1" />}
            {event.threatLevel} threat
          </span>
        </div>

        {/* Highlighted Virtual ID Badge */}
        {identity && (
          <div className="virtual-id-banner">
            <span className="virtual-id-pill">
              <Tag size={12} />
              Virtual ID: <strong>{identity.identity}</strong>
            </span>
            <span className="virtual-id-similarity">
              Biometric Similarity: <strong>{identity.similarity ? Math.round(identity.similarity * 100) : 95}%</strong>
            </span>
            <span className="virtual-id-status">
              Status: <BadgeCheck size={12} className="inline text-emerald-400" /> {identity.status || 'Verified'}
            </span>
          </div>
        )}

        <div className="meta-grid">
          <span><Clock size={14} />{formatDate(event.timestamp)}</span>
          <span><MapPin size={14} />{event.location}</span>
          <span><BadgeCheck size={14} />{(event.identityStatus || '').replace('_', ' ')}</span>
          {videoTimestamp !== undefined && videoTimestamp !== null && (
            <span className="video-stamp-tag">
              <Film size={14} className="text-blue-400" />
              Sighted at {Number(videoTimestamp).toFixed(1)}s
            </span>
          )}
          <span><Sparkles size={14} />Score {event.preprocessing?.contrastScore ? (event.preprocessing.contrastScore * 100).toFixed(0) + '%' : 'CLAHE'}</span>
        </div>

        <div className="detections">
          {event.detections.map((detection) => (
            <span key={detection.id} className={`det-tag det-${detection.label}`}>
              {iconFor(detection.label)}
              <strong>{detection.species || detection.label}</strong> {Math.round(detection.confidence * 100)}%
              {detection.reid ? ` · ${detection.reid.identity} (${Math.round((detection.reid.similarity || 0.95) * 100)}%)` : ''}
              {detection.videoTimestamp !== undefined && ` [${Number(detection.videoTimestamp).toFixed(1)}s]`}
            </span>
          ))}
        </div>

        {event.notes && event.notes.length > 0 && (
          <p className="event-note">"{event.notes[0]}"</p>
        )}
      </div>

      {/* Review Actions */}
      <div className="review">
        <select
          value={event.reviewStatus}
          onChange={(e) => onStatus(event._id, e.target.value)}
          aria-label="Update review status"
        >
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="confirmed">Confirmed</option>
        </select>
        <button
          onClick={() => onStatus(event._id, 'confirmed')}
          title="Confirm this observation"
          className={event.reviewStatus === 'confirmed' ? 'confirmed-btn' : ''}
        >
          <Check size={18} />
        </button>
      </div>
    </article>
  );
}
