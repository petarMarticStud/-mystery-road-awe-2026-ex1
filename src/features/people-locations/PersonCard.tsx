interface PersonCardProps {
  name: string;
  role: string;
}

export function PersonCard({ name, role }: PersonCardProps) {
  return (
    <article className="person-card">
      <h3>{name}</h3>
      <p>{role}</p>
    </article>
  );
}
