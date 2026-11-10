import { useEffect, useState } from "react";

export function EffectDemo() {
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(0);

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
    </details>
  );
}
