interface TimelineEventCardProps {
  time: string;
  title: string;
  description: string;
  certainty: string;
}

export function TimelineEventCard({
  time,
  title,
  description,
  certainty,
}: TimelineEventCardProps) {
  const isConfirmed = certainty === "confirmed";
  const hasDescription = description.trim().length > 0;

  return (
    <article className="timeline-event-card">
      <time dateTime={time}>{time}</time>

      <h3>{title}</h3>

      <span>{isConfirmed ? "confirmed" : "unconfirmed"}</span>

      {hasDescription && <p>{description}</p>}
    </article>
  );
}
