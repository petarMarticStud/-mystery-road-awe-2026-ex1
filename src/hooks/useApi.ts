import { useEffect, useRef, useState } from "react";
import type { DependencyList } from "react";

// Exercise 6 – Demo 9: Anwendungslogik-Schicht (vorher useFetch aus Demo 8).
// Der Hook weiss, WIE geladen wird (Ladezustand, Fehler, Abbrechen, Retry),
// aber nicht mehr, WOHER: keine URL, kein fetch. Das "Woher" bekommt er als
// Funktion aus der API-Schicht (z. B. fetchPeople).
//   Demo 5: Laden in einem useEffect
//   Demo 6: EIN State-Objekt fuer loading / error / success (leer = success mit [])
//   Demo 7: AbortController im Cleanup gegen veraltete Antworten

export type FetchState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: T };

interface UseApiOptions {
  // Demo 7: veraltete Anfragen abbrechen. Nur zum Vorfuehren abschaltbar.
  cancelStale?: boolean;
  // Nur fuer die Konsolen-Ausgabe.
  label?: string;
}

export function useApi<T>(
  // Die Ladefunktion bekommt das Abbruch-Signal und gibt die Daten zurueck.
  load: (signal: AbortSignal) => Promise<T>,
  // Wann neu geladen werden soll (wie bei useEffect), z. B. [simulation].
  deps: DependencyList,
  { cancelStale = true, label = "request" }: UseApiOptions = {},
) {
  const [state, setState] = useState<FetchState<T>>({ status: "loading" });
  // Wird von reload() erhoeht und startet dadurch den Effect neu ("Try again").
  const [attempt, setAttempt] = useState(0);
  // Zaehlt die Anfragen fuer die Konsole (Demo 7). Ref, weil es kein Rendern ausloesen soll.
  const requestCounter = useRef(0);

  useEffect(() => {
    // Jeder Effect-Durchlauf bekommt seinen EIGENEN AbortController.
    const controller = new AbortController();
    const requestId = ++requestCounter.current;

    // Jeder neue Ladevorgang beginnt wieder im Ladezustand.
    setState({ status: "loading" });

    async function run() {
      console.log(`[#${requestId}] Anfrage gestartet: ${label}`);
      try {
        // Ohne cancelStale bekommt die API ein Signal, das nie abbricht (Demo-7-Vorfuehrung).
        const data = await load(
          cancelStale ? controller.signal : new AbortController().signal,
        );
        console.log(`[#${requestId}] Antwort angezeigt: ${label}`);
        setState({ status: "success", data });
      } catch (error) {
        // Abgebrochen heisst: Diese Anfrage ist veraltet. Kein Fehler, nichts anzeigen.
        if (controller.signal.aborted) {
          console.log(`[#${requestId}] abgebrochen, Antwort ignoriert: ${label}`);
          return;
        }
        setState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Unknown network error.",
        });
      }
    }

    run();

    // Cleanup: laeuft, bevor der Effect mit neuen deps/attempt erneut startet, und beim Unmount.
    return () => {
      if (cancelStale) {
        console.log(`[#${requestId}] Cleanup: breche Anfrage ab (${label})`);
        controller.abort();
      }
    };
    // `load` steht absichtlich NICHT hier: Eine Inline-Funktion ist bei jedem Rendern neu
    // und wuerde sonst endlos neu laden. Wann neu geladen wird, sagen die deps.
  }, [...deps, attempt, cancelStale]);

  function reload() {
    setAttempt((previous) => previous + 1);
  }

  return { state, reload };
}
