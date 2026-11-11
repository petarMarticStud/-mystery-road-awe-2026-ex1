import { useEffect, useState } from "react";
import { TimerDemo } from "./TimerDemo";

export function EffectDemo() {
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(0);
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    console.log("Demo 2 — []: beim Einbinden");
  }, []);

  useEffect(() => {
    console.log("Demo 2 — [count]:", count);
  }, [count]);

  useEffect(() => {
    console.log("Demo 2 — ohne Array: nach jedem Commit");
  });

  return (
    <details>
      <summary>Demo 2: useEffect ausprobieren</summary>
      <p>Öffne die Browser-Konsole und vergleiche die Meldungen.</p>
      <button type="button" onClick={() => setCount((value) => value + 1)}>
        count erhöhen: {count}
      </button>{" "}
      <button type="button" onClick={() => setOther((value) => value + 1)}>
        anderen State ändern: {other}
      </button>
      <section aria-labelledby="cleanup-demo-title">
        <h3 id="cleanup-demo-title">Demo 3: Timer und Cleanup</h3>
        <p>
          Einblenden startet den Timer. Ausblenden entfernt TimerDemo und React
          ruft deren Cleanup auf. Filtere die Konsole nach „Demo 3“.
        </p>
        <button
          type="button"
          aria-expanded={showTimer}
          onClick={() => setShowTimer((previous) => !previous)}
        >
          {showTimer
            ? "Timer ausblenden und stoppen"
            : "Timer einblenden und starten"}
        </button>
        {showTimer && <TimerDemo />}
      </section>
    </details>
  );
}
