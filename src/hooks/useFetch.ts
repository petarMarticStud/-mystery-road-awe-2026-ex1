import { useEffect, useRef, useState } from "react";

// Exercise 6 – Demo 8: Wiederverwendbarer Custom Hook.
// Fasst zusammen, was in Demo 5–7 direkt in LocationsPage stand:
//   Demo 5: fetch in einem useEffect
//   Demo 6: EIN State-Objekt fuer loading / error / success (leer = success mit [])
//   Demo 7: AbortController im Cleanup gegen veraltete Antworten

export type FetchState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: T };

interface UseFetchOptions {
  // Demo 7: veraltete Anfragen abbrechen. Nur zum Vorfuehren abschaltbar.
  cancelStale?: boolean;
}

export function useFetch<T>(
  url: string,
  { cancelStale = true }: UseFetchOptions = {},
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

    async function load() {
      console.log(`[#${requestId}] Anfrage gestartet: ${url}`);
      try {
        const response = await fetch(url, {
          signal: cancelStale ? controller.signal : undefined,
        });

        if (!response.ok) {
          throw new Error(`The server answered with HTTP ${response.status}.`);
        }

        const data = (await response.json()) as T;
        console.log(`[#${requestId}] Antwort angezeigt: ${url}`);
        setState({ status: "success", data });
      } catch (error) {
        // Abgebrochen heisst: Diese Anfrage ist veraltet. Kein Fehler, nichts anzeigen.
        if (controller.signal.aborted) {
          console.log(`[#${requestId}] abgebrochen, Antwort ignoriert: ${url}`);
          return;
        }
        setState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Unknown network error.",
        });
      }
    }

    load();

    // Cleanup: laeuft, bevor der Effect mit neuer url/attempt erneut startet, und beim Unmount.
    return () => {
      if (cancelStale) {
        console.log(`[#${requestId}] Cleanup: breche Anfrage ab (${url})`);
        controller.abort();
      }
    };
  }, [url, attempt, cancelStale]);

  function reload() {
    setAttempt((previous) => previous + 1);
  }

  return { state, reload };
}
