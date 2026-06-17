import React from 'react';

export function SortableTh({ label, field, sortBy, order, onSort }) {
  const isActive = sortBy === field;
  const arrow = isActive ? (order === 'asc' ? ' ▲' : ' ▼') : ' ↕';

  return (
    <th onClick={() => onSort(field)}>
      {label}
      <span className={`sort-icon ${isActive ? 'active' : ''}`}>{arrow}</span>
    </th>
  );
}

export function useSortParams(defaultField = 'name') {
  const [sortBy, setSortBy] = React.useState(defaultField);
  const [order, setOrder] = React.useState('asc');

  function handleSort(field) {
    if (field === sortBy) {
      setOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setOrder('asc');
    }
  }

  return { sortBy, order, handleSort };
}
