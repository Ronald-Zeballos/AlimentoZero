import { Link } from "react-router-dom";

export function LoadingState({ message = "Cargando marketplace..." }) {
  return <div className="state-card">{message}</div>;
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-card error">
      <p>{message}</p>
      <button type="button" className="ghost-button" onClick={onRetry}>
        Reintentar
      </button>
    </div>
  );
}

export function EmptyState({ title, subtitle, actionLabel, onAction, to }) {
  return (
    <div className="state-card">
      <strong>{title}</strong>
      <p>{subtitle}</p>
      {to ? (
        <Link className="primary-button slim" to={to}>
          {actionLabel}
        </Link>
      ) : (
        <button type="button" className="primary-button slim" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
