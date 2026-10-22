import { Link, useParams } from "react-router";
import type { Person } from "../../../modules/domain";
import { Panel } from "../../components/Panel";

interface PersonDetailPageProps {
  people: Person[];
}

export function PersonDetailPage({
  people,
}: PersonDetailPageProps) {
  const { personId } = useParams();

  const person = people.find(
    (item) => item.id === personId,
  );

  if (!person) {
    return (
      <Panel title="Person not found">
        <p>No person matches this ID.</p>

        <Link to="/team/people">
          Back to people
        </Link>
      </Panel>
    );
  }

  return (
    <Panel title={person.name}>
      <p>
        <strong>Role:</strong> {person.role}
      </p>

      <p>
        <strong>Speciality:</strong> {person.speciality}
      </p>

      <h3>Statement</h3>
      <p>{person.statement}</p>

      <Link to="/team/people">
        Back to people
      </Link>
    </Panel>
  );
}