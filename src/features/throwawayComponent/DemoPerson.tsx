interface DemoPerson {
  id: string;
  name: string;
}

interface KeyDemoProps {
  people: DemoPerson[];
}

export function KeyDemo({ people }: KeyDemoProps) {
  return (
    <main>
      <h1>Key-Demo</h1>
      {people.map((person, index) => (
        <div key={index}>
          <label>
            {person.name}:{" "}
            <input
              type="text"
              placeholder={`Notiz für ${person.name}`}
            />
          </label>
        </div>
      ))}
    </main>
  );
}