import type { ReactNode } from "react";

interface PersonCardProps {
  name: string;
  role: string;
  children?: ReactNode;
}

export function PersonCard({ name, role, children }: PersonCardProps) {
  return (
    <article className="person-card">
      <h3>{name}</h3>
      <p>{role}</p>
      {children && <footer className="person-card-actions">{children}</footer>}
    </article>
  );
}
