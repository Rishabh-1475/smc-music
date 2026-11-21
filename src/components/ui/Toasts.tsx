import React from 'react';
import Icon from './Icon';
import { usePlayerStore } from '@/store/playerStore';

export default function Toasts() {
  const { toasts, dismissToast } = usePlayerStore();

  if (toasts.length === 0) return null;

  return (
    <aside className="toasts" aria-label="Notifications" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.tone || 'info'}`} role="status">
          <span className="toast__body">
            {t.tone === 'success' && <Icon name="check" size={16} />}
            {t.message}
          </span>
          <button
            type="button"
            className="toast__x"
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss notification"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
    </aside>
  );
}
