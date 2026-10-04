import React from 'react';

const FILTER_ITEMS = ['all', 'high', 'pending', 'reviewed', 'confirmed'];

export function Header({ filter, onFilterChange }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Endangered species intelligence</p>
        <h2>Detection Events</h2>
      </div>
      <div className="filters">
        {FILTER_ITEMS.map((item) => (
          <button
            key={item}
            className={filter === item ? 'active' : ''}
            onClick={() => onFilterChange(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </header>
  );
}
