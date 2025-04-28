// client/src/components/ResultsDisplay.js
import React from 'react';
import TimelineEvent from './TimelineEvent.jsx';

function ResultsDisplay({ result, userQuestion, onReset, onShare }) {
  if (!result) {
    return null; // Don't render anything if there's no result
  }

  // Apply era-based class (example - needs logic to determine era)
  // const cardClass = `result-card ${result.era || ''}`;
  const cardClass = 'result-card'; // Default for now

  return (
    <div id="result-container" className="result-container">
      <div className={cardClass}>
        <h2 id="user-question-display">What if... {userQuestion}</h2>
        <div className="timeline-icons" id="timeline-icons">{result.icons || '⏳'}</div>

        <h3>Scenario Summary</h3>
        <p id="scenario-summary">{result.scenarioSummary}</p>

        <h3>Key Events</h3>
        <div className="timeline" id="key-events-timeline">
          {result.keyEvents && result.keyEvents.length > 0 ? (
            result.keyEvents.map((event, index) => (
              <TimelineEvent key={index} eventText={event} />
            ))
          ) : (
            <p>No key events specified.</p>
          )}
        </div>

        <h3>Butterfly Effects</h3>
        <div className="accordions" id="butterfly-effects">
          {result.butterflyEffects && result.butterflyEffects.length > 0 ? (
            result.butterflyEffects.map((effect, index) => (
              <details key={index}>
                <summary>Impact #{index + 1}</summary>
                <div className="effect-content">{effect}</div>
              </details>
            ))
          ) : (
            <p>No major butterfly effects noted.</p>
          )}
        </div>

        <h3>Visual Concept</h3>
        <div className="image-placeholder">
          <p><strong>Imagine:</strong> <span id="image-prompt-placeholder">{result.imagePrompt}</span></p>
          <small>(Image generation coming soon!)</small>
        </div>
      </div>

      <div className="action-buttons">
        <button id="generate-another-button" onClick={onReset}>Generate Another Timeline</button>
        <button id="share-button" onClick={onShare}>Share <span className="share-icon">📤</span></button>
      </div>
    </div>
  );
}

export default ResultsDisplay;