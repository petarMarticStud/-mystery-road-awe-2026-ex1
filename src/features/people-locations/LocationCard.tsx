interface LocationCardProps {
  name: string;
  description: string;
}

export function LocationCard({ name, description }: LocationCardProps) {
  return (
    <article className="location-card">
      <h3>{name}</h3>
      <p>{description}</p>
    </article>
  );
}
