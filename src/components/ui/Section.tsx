import React from 'react';

interface SectionHeadProps {
  title: string;
  note?: string;
  children?: React.ReactNode;
}

export function SectionHead({ title, note, children }: SectionHeadProps) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {note && <span className="section-head__note">{note}</span>}
      {children && <div className="section-head__actions">{children}</div>}
    </div>
  );
}

export function CardSkeletons({ count = 6 }: { count?: number }) {
  return (
    <div className="grid3d" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton skeleton--art" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line short" />
        </div>
      ))}
    </div>
  );
}

export function RowSkeletons({ count = 6 }: { count?: number }) {
  return (
    <ul className="rows" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li className="skeleton-row" key={i}>
          <div className="skeleton skeleton--thumb" />
          <div className="skeleton skeleton--line" />
        </li>
      ))}
    </ul>
  );
}

interface EmptyStateProps {
  title: string;
  body: string;
  children?: React.ReactNode;
}

export function EmptyState({ title, body, children }: EmptyStateProps) {
  return (
    <div className="empty glass">
      <h3>{title}</h3>
      <p>{body}</p>
      {children}
    </div>
  );
}
