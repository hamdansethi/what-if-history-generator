// client/src/App.js
import React, { useState, useCallback } from 'react';
import axios from 'axios';
import ResultsDisplay from './components/ResultsDisplay.jsx';
import './App.css'; // Import the CSS

function App() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastQuestion, setLastQuestion] = useState(''); // Store the question used for the result

  const handleGenerate = useCallback(async () => {
    if (!question.trim()) {
      setError("Please enter a 'What if?' question.");
      return;
    }

    setError(null);
    setIsLoading(true);
    setResult(null); // Clear previous results
    setLastQuestion(question); // Store the question being asked

    try {
      // The '/api/generate' path works because of the proxy in package.json
      const response = await axios.post('/api/generate', { userQuestion: question });
      setResult(response.data);
    } catch (err) {
      console.error("API Error:", err);
      const errorMsg = err.response?.data?.error || err.message || "An unknown error occurred.";
      setError(`Oops! ${errorMsg}`);
      setResult(null); // Ensure no partial result is shown on error
    } finally {
      setIsLoading(false);
    }
  }, [question]); // Dependency: re-create function if question changes

  const handleReset = () => {
    setQuestion('');
    setResult(null);
    setError(null);
    setIsLoading(false);
    setLastQuestion('');
    // Optional: Focus input field
    document.getElementById('what-if-question')?.focus();
  };

  const handleShare = () => {
    // Basic share simulation (replace with actual sharing logic)
     if (result && lastQuestion) {
            const shareText = `Check out this alternate history: "What if... ${lastQuestion}" - ${result.scenarioSummary?.substring(0, 100)}...`;
            if (navigator.share) {
                 navigator.share({
                    title: 'Alternate History Scenario',
                    text: shareText,
                    url: window.location.href // Or a link to a saved version/shareable page
                }).then(() => console.log('Successful share'))
                  .catch((error) => console.log('Error sharing', error));
            } else {
                // Fallback for browsers that don't support Web Share API
                alert(`Sharing is not supported on this browser, but here's the text:\n\n${shareText}`);
                // You could also implement copying to clipboard here
            }
        } else {
             alert("Generate a timeline first to share it!");
        }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent newline
      handleGenerate();
    }
  };

  return (
    <div className="app-container">
      <h1>What If? History Generator</h1>

      {!result && !isLoading && ( // Only show input if no result and not loading
        <div id="input-section" className="input-section">
          <textarea
            id="what-if-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a ‘What if?’ question (e.g., ‘What if Napoleon won at Waterloo?’)"
            disabled={isLoading}
          />
          {/* Optional Era Dropdown could go here */}
          <button
            id="generate-button"
            onClick={handleGenerate}
            disabled={isLoading || !question.trim()} // Disable if loading or input empty
          >
            {isLoading ? 'Generating...' : 'Generate Timeline'}
          </button>
        </div>
      )}

      {isLoading && (
        <div id="loading-indicator" className="loading">
          Generating alternate reality... ⏳ <span aria-live="assertive" style={{ display: 'none' }}>Loading content</span>
        </div>
      )}

      {error && (
        <div id="error-message" className="error">
          {error}
          {/* Provide a button to try again or reset if needed */}
           {!isLoading && <button onClick={handleReset} style={{marginLeft: '10px', padding: '5px 8px', fontSize: '0.9em'}}>Try Again</button>}
        </div>
      )}

      {/* Pass the specific question used for this result */}
      <ResultsDisplay
        result={result}
        userQuestion={lastQuestion}
        onReset={handleReset}
        onShare={handleShare}
      />

    </div>
  );
}

export default App;