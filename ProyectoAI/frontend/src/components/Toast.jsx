import React from "react";

export function Toast({ toasts = [] }) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-stack" id="toastStack">
      {toasts.map((toast) => (
        <div key={toast.id} className="app-toast">{toast.message}</div>
      ))}
    </div>
  );
}
