import React from 'react';
import './DateSelector.css';

const DateSelector = ({
  selectedDate,
  availableDates,
  onDateChange
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <div className="date-selector-container">
      <label htmlFor="date-select" className="date-label">
        날짜 선택:
      </label>
      <select
        id="date-select"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="date-select"
      >
        <option value="">날짜를 선택하세요</option>
        {availableDates.map((date) => (
          <option key={date} value={date}>
            {formatDate(date)}
          </option>
        ))}
      </select>
      
    </div>
  );
};

export default DateSelector;
