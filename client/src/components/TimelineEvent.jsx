// client/src/components/TimelineEvent.js
import React from 'react';

function TimelineEvent({ eventText }) {
  // Simple split assuming "YEAR: Description" format
  // Make it more robust if needed
  const parts = eventText.split(':');
  const year = parts[0] ? parts[0].trim() : 'Date Unknown';
  const description = parts.length > 1 ? parts.slice(1).join(':').trim() : eventText;

  return (
    <div className="timeline-event">
      <strong>{year}</strong> {description}
    </div>
  );
}

export default TimelineEvent;