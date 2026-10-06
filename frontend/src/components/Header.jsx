import React from 'react';

const FILTER_ITEMS = [
  { id: 'all', label: 'All' },
  { id: 'high', label: 'High Threat' },
  { id: 'pending', label: 'Pending' },
  { id: 'reviewed', label: 'Reviewed' },
  { id: 'confirmed', label: 'Confirmed' }
];

export function Header({ filter, onFilterChange }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Endangered Species Intelligence</p>
        <h2>Detection Events</h2>
      </div>
      <div className="filters" role="tablist">
        {FILTER_ITEMS.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={filter === item.id}
            className={filter === item.id ? 'active' : ''}
            onClick={() => onFilterChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
}
