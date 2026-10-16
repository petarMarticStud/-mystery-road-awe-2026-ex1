interface TimelineEventCardProps {
  time: string;
  title: string;
  description: string;
}

export function TimelineEventCard({ time, title, description }: TimelineEventCardProps) {
  return (
    <article className="timeline-event-card">
      <time dateTime={time}>{time}</time>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}
