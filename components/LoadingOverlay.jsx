import React from "react";

export default function LoadingOverlay({ message = "Generating recipe" }) {
  return (
    <div className="loading-overlay" role="status" aria-live="polite" aria-label={message}>
      <div className="loading-overlay-card">
        <span className="loading-spinner" aria-hidden="true" />
        <p className="loading-overlay-text">{message}</p>
      </div>
    </div>
  );
}
