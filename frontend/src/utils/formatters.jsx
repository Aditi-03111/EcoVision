import React from 'react';
import { User, Car, PawPrint } from 'lucide-react';

export function iconFor(label) {
  if (label === 'human') return <User size={15} />;
  if (label === 'vehicle') return <Car size={15} />;
  return <PawPrint size={15} />;
}

export function nowLocal() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}
