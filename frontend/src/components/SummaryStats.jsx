import React from 'react';
import { Camera, AlertTriangle, Clock, BadgeCheck } from 'lucide-react';

function Metric({ icon, label, value, tone = '' }) {
  return (
    <div className={`metric ${tone}`}>
      {React.cloneElement(icon, { size: 20 })}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function SummaryStats({ summary }) {
  return (
    <section className="stats">
      <Metric icon={<Camera />} label="Events" value={summary.total} />
      <Metric icon={<AlertTriangle />} label="High threat" value={summary.highThreat} tone="danger" />
      <Metric icon={<Clock />} label="Pending" value={summary.pending} />
      <Metric icon={<BadgeCheck />} label="Known animals" value={summary.knownAnimals} tone="good" />
    </section>
  );
}
