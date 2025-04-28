// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Use .jsx extension now
import './App.css'; // Or './index.css' if that's your main CSS file

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);