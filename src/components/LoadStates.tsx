// Exercise 6 – Demo 6: Drei klar unterscheidbare Zustaende fuer geladene Daten.
// Jeder Zustand hat eigenes Markup, eigene Rolle fuer Screenreader und eigenes Aussehen.

interface LoadingStateProps {
  text: string;
}

export function LoadingState({ text }: LoadingStateProps) {
  return (
    // role="status": Screenreader lesen den Text vor, ohne den Benutzer zu unterbrechen.
    <div className="load-state load-state--loading" role="status">
      <div className="spinner" aria-hidden="true" />
      <p>{text}</p>
    </div>
  );
}

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    // role="alert": Fehler werden sofort angesagt.
    <div className="load-state load-state--error" role="alert">
      <p className="load-state__title">⚠ {title}</p>
      <p className="load-state__detail">{message}</p>
      <button type="button" className="load-state__button" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  hint: string;
}

export function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <div className="load-state load-state--empty">
      <p className="load-state__title">{title}</p>
      <p className="load-state__detail">{hint}</p>
    </div>
  );
}
