import React from 'react';
import { PawPrint, Upload, ArrowLeft, Video, Image, Film } from 'lucide-react';

export function Sidebar({ form, setForm, file, setFile, busy, onUpload, onBackToLanding }) {
  const isVideoFile = file && /\.(mp4|mov|avi|webm|mkv|m4v)$/i.test(file.name);

  return (
    <aside className="sidebar">
      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-2 text-xs font-medium text-emerald-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl w-fit"
        >
          <ArrowLeft size={14} />
          Back to Safari Landing Page
        </button>
      )}

      <div className="brand">
        <div className="brand-mark"><PawPrint size={24} /></div>
        <div>
          <h1>EcoVision</h1>
          <p>Wildlife monitoring command center</p>
        </div>
      </div>

      <form className="upload-panel" onSubmit={onUpload}>
        <label>
          Camera-trap media (Photo or Video clip)
          <span className={`file-input ${file ? 'has-file' : ''}`}>
            {isVideoFile ? <Film size={18} className="text-blue-400" /> : <Upload size={18} className="text-emerald-400" />}
            <span className="file-name-text">
              {file ? file.name : 'Upload photo or video'}
            </span>
            <input
              type="file"
              accept="image/*,video/*,.mp4,.mov,.avi,.webm"
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
          </span>
          {file && (
            <span className="file-info-badge">
              {isVideoFile ? '🎬 Video Stream' : '📷 High-Res Image'} · {(file.size / (1024 * 1024)).toFixed(1)} MB
            </span>
          )}
        </label>

        <label>
          Camera location / sector
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="e.g. East Gate Camera 02"
          />
        </label>

        <label>
          Observation timestamp
          <input
            type="datetime-local"
            value={form.timestamp}
            onChange={(e) => setForm({ ...form, timestamp: e.target.value })}
          />
        </label>

        <button className="primary" disabled={!file || busy}>
          {isVideoFile ? <Video size={18} /> : <Upload size={18} />}
          {busy ? (isVideoFile ? 'Analyzing video frames...' : 'Running YOLO & ReID...') : (isVideoFile ? 'Analyze Video Clip' : 'Analyze Image')}
        </button>
      </form>

      <div className="pipeline">
        <span>OpenCV CLAHE</span>
        <span>YOLOv8 Multi-Object</span>
        <span>Siamese ReID Virtual ID</span>
        <span>Real-Time Alert Radar</span>
      </div>
    </aside>
  );
}
