import { Link } from "react-router";
import type { Person } from "../../../modules/domain";
import { Panel } from "../../components/Panel";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/LoadStates";
import { fetchPeople } from "../../api/mysteryApi";
import { useApi } from "../../hooks/useApi";
import { PersonCard } from "./PersonCard";

// Exercise 6 – Demo 8/9: UI-Schicht. Kein fetch, keine URL.
// WAS geladen wird: fetchPeople (API-Schicht). WIE: useApi (Hook).
// Hier steht nur noch, wie die Zustaende aussehen.
export function PeoplePage() {
  const { state, reload } = useApi<Person[]>(
    (signal) => fetchPeople({ signal }),
    [],
    { label: "people" },
  );

  return (
    <Panel title="People">
      {state.status === "loading" && <LoadingState text="Loading people…" />}

      {state.status === "error" && (
        <ErrorState
          title="People could not be loaded."
          message={state.message}
          onRetry={reload}
        />
      )}

      {state.status === "success" && state.data.length === 0 && (
        <EmptyState
          title="No people recorded for this case."
          hint="The server responded successfully, but returned no people."
        />
      )}

      {state.status === "success" &&
        state.data.map((person) => (
          <PersonCard key={person.id} name={person.name} role={person.role}>
            <Link to={`/team/people/${person.id}`} className="detail-button">
              View profile <span aria-hidden="true">→</span>
            </Link>
          </PersonCard>
        ))}
    </Panel>
  );
}
