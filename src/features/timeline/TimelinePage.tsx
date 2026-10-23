import { useSearchParams } from "react-router";
import type { Person, TimelineEvent } from "../../../modules/domain";
import { Panel } from "../../components/Panel";
import { TimelineEventCard } from "./TimelineEventCard";

interface TimelinePageProps {
  events: TimelineEvent[];
  people: Person[];
}

export function TimelinePage({
  events,
  people,
}: TimelinePageProps) {
  const [searchParams] = useSearchParams();
  const personId = searchParams.get("person");

  const visibleEvents = personId
    ? events.filter((event) => event.personIds.includes(personId))
    : events;

  const selectedPerson = people.find(
    (person) => person.id === personId,
  );

  return (
    <Panel title="Timeline">
      <div>
        <label>
          Person{" "}
          <select
            key={personId ?? ""}
            defaultValue={personId ?? ""}
          >
            <option value="">All people</option>

            {personId && !selectedPerson && (
              <option value={personId}>Unknown person</option>
            )}

            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </label>

        <p>Initial selection from the URL. Filter changes are not applied yet.</p>
      </div>

      {visibleEvents.length === 0 ? (
        <p>No events match this person.</p>
      ) : (
        visibleEvents.map((event) => (
          <TimelineEventCard
            key={event.id}
            time={event.time}
            title={event.title}
            description={event.description}
            certainty={event.certainty}
          />
        ))
      )}
    </Panel>
  );
}