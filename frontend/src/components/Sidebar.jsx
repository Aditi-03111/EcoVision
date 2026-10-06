import React from 'react';
import { PawPrint, Upload, ArrowLeft } from 'lucide-react';

export function Sidebar({ form, setForm, file, setFile, busy, onUpload, onBackToLanding }) {
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
  );
}
