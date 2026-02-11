
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { logger } from './services/logger';
import './index.css'; // Tailwind entry point

const rootElement = document.getElementById('root');
if (!rootElement) {
  logger.error("Failed to find root element. The application cannot mount.");
  throw new Error("Could not find root element to mount to");
}

logger.info("🚀 Esal-e-Sawab Platform Initializing...");

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      {/* ErrorBoundary is configured to receive the router as a child prop */}
      <ErrorBoundary>
        <HashRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="*" element={<App />} />
          </Routes>
        </HashRouter>
      </ErrorBoundary>
    </React.StrictMode>
  );
  logger.log("✅ Application mounted successfully.");
} catch (error) {
  logger.error("CRITICAL: Failed to initialize React root", error);
}
