import { useEffect } from "react";

export function TimerDemo() {
  useEffect(() => {
    console.log("Demo 3: Timer gestartet");

    // Der Browser ruft diesen Callback jede Sekunde auf.
    const timerId = window.setInterval(() => {
      console.log("Demo 3: Tick", timerId);
    }, 1000);

    // React ruft diesen Callback beim Entfernen der Komponente auf.
    // Die Closure merkt sich die passende timerId.
    function cleanup() {
      window.clearInterval(timerId);
      console.log("Demo 3: Timer gestoppt", timerId);
    }

    // Funktion zurückgeben, nicht sofort mit cleanup() aufrufen.
    return cleanup;
  }, []);

  return (
    <p>
      TimerDemo ist eingebunden. Jede Sekunde erscheint ein Tick in der Konsole.
    </p>
  );
}
