import React from 'react'
import './SearchFilterRow.css'

/**
 * filters: Array<{ key, type, value, placeholder, options }>
 * onFilterChange: (key, value) => void
 */
const SearchFilterRow = ({ filters, onFilterChange, children }) => {
  return (
    <div className="search-filter-row">
      {filters.map(filter => (
        <div key={filter.key} className="filter-item">
          {filter.type === 'select' ? (
            <select
              value={filter.value}
              onChange={e => onFilterChange(filter.key, e.target.value)}
              className="filter-select"
            >
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <input
              type={filter.type}
              className={filter.type === 'date' ? 'date-input' : 'search-input'}
              placeholder={filter.placeholder}
              value={filter.value}
              onChange={e => onFilterChange(filter.key, e.target.value)}
            />
          )}
        </div>
      ))}
      {children}
    </div>
  )
}

export default SearchFilterRow
