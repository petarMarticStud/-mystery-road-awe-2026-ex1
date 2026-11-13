# Exercise 6 – Demo 1: Render-Logik und Effects

## Aufgabe 1: Seiteneffekt beim Rendern schreiben und wieder entfernen

In `src/features/evidence/EvidencePage.tsx` wurde vorübergehend direkt am Anfang der Funktion `EvidencePage`, vor dem ersten `useReducer`, diese Zeile eingefügt und anschließend wieder entfernt:

```tsx
console.log("Demo 1: EvidencePage wird gerendert");
```

Das ist eines der ausdrücklich in der Aufgabenstellung genannten Beispiele. Die Zeile schreibt bei jedem Rendern in die Browser-Konsole. Sie berechnet nicht die Anzeige


, sondern verändert etwas außerhalb der Berechnung: die Konsolenausgabe. Deshalb ist sie ein Seiteneffekt, auch wenn die Oberfläche weiterhin funktioniert.

Zum eigenen Vorführen: Zeile kurz einfügen, Evidence öffnen und die Browser-Konsole ansehen. Im Suchfeld tippen: Durch die State-Änderungen rendert die Komponente erneut und schreibt weitere Meldungen. Danach die Zeile wieder entfernen. Diese Browser-Beobachtung wurde hier nicht ausgeführt.

## Aufgabe 2: Eine kurze Regel

Beim Rendern berechne ich aus Props und State, was angezeigt werden soll. Dabei verändere ich nichts außerhalb dieser Berechnung. Ein Effect stimmt die Komponente mit etwas außerhalb von React ab, zum Beispiel einem Server oder dem Browser-Titel. Aktionen als direkte Folge eines Klicks gehören in den Event-Handler.

## Frage 1: Warum rendert React mehrfach und was passiert beim Beispiel?

React rendert erneut, wenn sich zum Beispiel State oder Props ändern oder eine übergeordnete Komponente neu rendert. React kann Render-Arbeit außerdem verwerfen und wiederholen. Strict Mode ruft Komponenten in der Entwicklung zusätzlich auf, um Fehler aufzudecken.

Bei unserem Beispiel erscheinen bei zwei Render-Aufrufen zwei Konsolenmeldungen, obwohl der Benutzer möglicherweise nur eine sichtbare Änderung sieht. Die Meldung ist daher kein zuverlässiger Beleg dafür, dass die Komponente gerade neu eingeblendet wurde. Ein Debug-Log richtet hier wenig Schaden an; bei einem Schreibzugriff oder einer Bestellung wäre eine ungewollte Wiederholung viel problematischer.

Kurz zum Vortragen: „React kann mehrfach rendern. Mein Log würde dann mehrfach erscheinen. Deshalb sollen beim Rendern keine Aktionen ausgeführt werden, die nur einmal passieren dürfen.“

## Frage 2: Ist das Berechnen einer gefilterten Liste ein Seiteneffekt?

Nein. In `EvidencePage.tsx` berechnet `data.evidence.filter(...)` aus den vorhandenen Daten und den aktuellen Filtern die neue Liste `results`. Das ursprüngliche Array bleibt unverändert. Gleiche Eingaben ergeben dieselbe Liste.

Das anschließende `results.sort(...)` ist hier ebenfalls in Ordnung: `filter()` hat bereits ein neues Array erzeugt. Sortiert wird nur dieses neue Ergebnis, nicht das ursprüngliche `data.evidence`.

Kurz zum Vortragen: „Filtern berechnet nur, welche Einträge angezeigt werden. Es verändert die Originaldaten nicht. Deshalb gehört es direkt ins Rendern und braucht keinen Effect.“

---

# Demo 2: useEffect und Abhängigkeitsarrays

## Aufgabe 1: Drei Effects ausprobieren

Die ausführbaren Beispiele stehen in `src/components/EffectDemo.tsx`. In der Entwicklung zeigt die App dafür „Demo 2: useEffect ausprobieren“ über den Ansichten.

Ein Abhängigkeitsarray ist die Liste in den eckigen Klammern nach der Effect-Funktion. Damit sagst du React, von welchen Werten der Effect abhängt.

### Beispiel A: Leeres Array `[]`

```tsx
useEffect(() => {
  console.log("Demo 2 — []: beim Einbinden");
}, []);
```

Läuft nach dem Einbinden der Komponente. Weitere State-Änderungen starten diesen Effect nicht erneut. Wird die Komponente entfernt und später neu eingebunden, läuft er wieder.

### Beispiel B: Array mit einem Wert `[count]`

```tsx
useEffect(() => {
  console.log("Demo 2 — [count]:", count);
}, [count]);
```

Läuft nach dem Einbinden und erneut, wenn sich `count` geändert hat. Ändert sich nur ein anderer State, läuft dieser Effect nicht erneut.

### Beispiel C: Kein Array

```tsx
useEffect(() => {
  console.log("Demo 2 — ohne Array: nach jedem Commit");
});
```

Läuft nach jedem Commit dieser Komponente. Commit bedeutet: React hat das Render-Ergebnis übernommen. Auch wenn die Änderung nicht `count` betrifft, läuft dieser Effect erneut.

### Schritt für Schritt selbst beobachten

1. Starte `npm.cmd run dev` und öffne den React-Einstieg `react.html` unter der von Vite angegebenen Basisadresse.
2. Öffne mit F12 die Browser-Konsole und lade die Seite neu. Filtere bei Bedarf nach „Demo 2“.
3. Alle drei Meldungen sollten beim Start erscheinen. Die Meldung ohne Array kann zusätzlich erscheinen, wenn App ihre geladenen Daten übernimmt und dadurch erneut rendert.
4. Öffne „Demo 2: useEffect ausprobieren“. Das Aufklappen allein verändert keinen React-State.
5. Klicke einmal auf „count erhöhen“: `[count]` und der Effect ohne Array melden sich. `[]` meldet sich nicht.
6. Klicke einmal auf „anderen State ändern“: Nur der Effect ohne Array meldet sich.

| Aktion | `[]` | `[count]` | Kein Array |
|---|---|---|---|
| Erstes Einbinden | läuft | läuft | läuft |
| count erhöhen | läuft nicht | läuft | läuft |
| Nur anderen State ändern | läuft nicht | läuft nicht | läuft |

Das sind die erwarteten Ergebnisse; die Browser-Beobachtung wurde hier noch nicht durchgeführt. In `src/main.tsx` ist derzeit kein Strict Mode aktiviert. Mit Strict Mode kann React beim Einbinden in der Entwicklung einen zusätzlichen Effect-Prüfzyklus ausführen. Deshalb bedeutet `[]` nicht „garantiert genau einmal während der gesamten Anwendung“.

## Aufgabe 2: Ein echter Effect für die App

In `src/app/App.tsx` folgt der Browser-Titel jetzt der aktuellen Route:

```tsx
const { pathname } = useLocation();

useEffect(() => {
  document.title = `Project ReMotion – ${pathname}`;
}, [pathname]);
```

`pathname` ist der aktuelle Routenpfad, beispielsweise `/evidence`. `useLocation()` liefert ihn vom Router. Beim Wechsel auf Timeline ändert er sich auf `/timeline` und der Effect aktualisiert den Browser-Tab.

Der Seiteneffekt ist die Zuweisung an `document.title`. `useEffect` organisiert, wann sie passiert. Der Titel liegt außerhalb des React-Inhalts im Root-Element. Es geht hier ausdrücklich nicht um Datenladen aus Demo 5.

Zum Vorführen: Zwischen Dashboard und Evidence wechseln und den Titel des Browser-Tabs beobachten.

## Frage 1: Was vergleicht React? Was passiert bei einer fehlenden Abhängigkeit?

React vergleicht jeden Eintrag mit seinem Wert aus dem vorherigen Render mittels `Object.is`. Einfach gesagt: Ist der Wert gleich geblieben? Bei Objekten zählt die Referenz, nicht ein tiefer Vergleich des Inhalts.

In unserem Beispiel prüft React, ob sich `pathname` geändert hat. Steht stattdessen fälschlich `[]` dort, wird der Titel beim Navigieren nicht erneut gesetzt. Er zeigt weiter den alten Pfad.

Kurz zum Vortragen: „React vergleicht die Werte im Array. Ändert sich einer, läuft der Effect erneut. Vergesse ich eine verwendete Abhängigkeit, kann der Effect mit veralteten Werten arbeiten.“

## Frage 2: Was ist der Unterschied zwischen useEffect(fn, []) und fn() im Funktionskörper?

`fn()` im Funktionskörper wird bei jedem Render sofort aufgerufen. Die ganze Komponentenfunktion wird schließlich erneut ausgeführt. Deshalb bedeutet der direkte Aufruf nicht „einmal“.

`useEffect(fn, [])` führt `fn` nach dem Einbinden aus und wiederholt es bei normalen weiteren Render-Vorgängen nicht. Der Effect läuft erst nach dem Commit, nicht während der Berechnung der Anzeige. Erneutes Einbinden und der Entwicklungs-Prüfzyklus sind die erwähnten Ausnahmen.

Kurz zum Vortragen: „Ein direkter Aufruf läuft bei jedem Render. Ein Effect mit leerem Array läuft beim Einbinden und nicht bei jeder State-Änderung.“

Referenz: [Offizielle React-Dokumentation zu useEffect](https://react.dev/reference/react/useEffect).

---

# Demo 3: Timer, Callback und Cleanup

## Umsetzung

- `src/components/EffectDemo.tsx` enthält den State `showTimer` und den Button zum Ein-/Ausblenden.
- `src/components/TimerDemo.tsx` enthält den Effect mit dem Timer und die Cleanup-Funktion.

## Der komplette Ablauf

1. `useState(false)` liefert den Startwert `showTimer = false` und die Änderungsfunktion `setShowTimer`. TimerDemo ist zunächst nicht eingebunden.
2. Ein Klick ruft `setShowTimer((previous) => !previous)` auf. Der Wert wechselt von false zu true.
3. React rendert EffectDemo erneut. Durch `{showTimer && <TimerDemo />}` wird TimerDemo eingebunden.
4. Nach dem Commit führt React deren Effect aus. `setInterval` startet einen Browser-Timer. Seine Kennung wird in `timerId` gespeichert.
5. Der Browser ruft den Tick-Callback ungefähr jede Sekunde auf.
6. `return cleanup` gibt React eine Funktion zurück. Es ruft sie noch nicht auf. Die Closure sorgt dafür, dass die Funktion sich die passende `timerId` merkt.
7. Ein weiterer Klick setzt showTimer auf false. React entfernt TimerDemo.
8. React ruft die gespeicherte Cleanup-Funktion auf. Erst jetzt wird `clearInterval(timerId)` ausgeführt und der Timer gestoppt.
9. Erneutes Einblenden bindet TimerDemo neu ein und startet einen neuen Timer.

`clearInterval` ist vom Browser bereitgestellt. Es stoppt den Timer, sobald es aufgerufen wird. React legt hier über den Effect-Lebenszyklus fest, wann unser Cleanup aufgerufen wird. `setShowTimer` greift nicht direkt auf den Timer zu.

## Mit Cleanup vorführen

1. `npm.cmd run dev` starten und die React-App unter `react.html` öffnen.
2. Browser-Konsole öffnen und nach „Demo 3“ filtern.
3. „Demo 2: useEffect ausprobieren“ aufklappen. Darin liegt „Demo 3: Timer und Cleanup“.
4. „Timer einblenden und starten“ klicken: „Timer gestartet“, danach ungefähr jede Sekunde „Tick“ mit Timer-Kennung.
5. „Timer ausblenden und stoppen“ klicken: „Timer gestoppt“, danach keine weiteren Ticks dieses Timers.
6. Erneut einblenden: Ein neuer Timer startet. Es sollte nur dieser eine Timer laufen.

Das Zuklappen des details-Bereichs versteckt nur dessen Inhalt. Es entfernt TimerDemo nicht und stoppt daher den Timer nicht. Verwende zum Vorführen den Timer-Button.

## Ohne Cleanup vergleichen

1. In TimerDemo.tsx vorübergehend nur die Zeile `window.clearInterval(timerId);` auskommentieren.
2. Die Seite neu laden, den Timer einblenden und wieder ausblenden.
3. Obwohl TimerDemo entfernt wird, erscheinen weiterhin Ticks. Die Meldung „Timer gestoppt“ alleine stoppt nichts und ist in diesem absichtlich fehlerhaften Versuch falsch.
4. Erneut einblenden: Ein weiterer Timer startet. An verschiedenen Kennungen erkennst du, dass mehrere Timer gleichzeitig laufen.
5. Die auskommentierte Zeile wiederherstellen und die Seite neu laden. Das Neuladen entfernt die absichtlich zurückgelassenen Browser-Timer.

Die fehlerhafte Variante bleibt nicht im fertigen Code. Die oben beschriebenen Browser-Beobachtungen sind von dir noch live zu prüfen.

## Frage 1: Wer ruft Cleanup auf und wann?

React ruft die aus dem Effect zurückgegebene Funktion auf:

1. Wenn die Komponente entfernt wird. Bei uns passiert das, wenn showTimer false wird.
2. Bevor der Effect nach geänderten Abhängigkeiten erneut ausgeführt wird. Zuerst wird die alte Einrichtung aufgeräumt, dann die neue gestartet.

Unser Timer-Effect hat `[]`, deshalb gibt es hier keinen Neustart wegen geänderter Abhängigkeiten. Mit beispielsweise `[delay]` müsste React bei geänderter Wartezeit erst den bisherigen Timer stoppen und dann einen neuen starten. Strict Mode kann in der Entwicklung zusätzlich einen Setup–Cleanup–Setup-Prüfzyklus ausführen.

## Frage 2: Welcher konkrete Fehler entsteht ohne Cleanup?

Der Timer gehört zum Browser und wird durch das Entfernen einer React-Komponente nicht automatisch beendet. Ohne clearInterval tickt er weiter, obwohl die Ansicht verschwunden ist. Nach mehrmaligem Aus- und Einblenden laufen mehrere Timer: Du siehst mehrere Tick-Meldungen pro Sekunde mit verschiedenen Kennungen. Das ist der konkret beobachtbare Fehler.

Merksatz: Der Effect richtet etwas ein. React ruft später den zurückgegebenen Cleanup-Callback auf, der diese Einrichtung wieder beendet.

---

# Demo 4: Schreibgeschütztes Node-Backend

## Umsetzung

- `server/index.mjs`: Minimaler Server mit Nodes eingebautem Modul `node:http` (kein Express nötig, also keine neue Abhängigkeit). Er liest dieselben Dateien aus `public/data/` und liefert sie unverändert aus.
- `package.json`: neues Skript `npm run server` (`node --watch` startet bei Codeänderungen neu).
- `vite.config.mjs`: `server.proxy` leitet `/api` vom Vite-Dev-Server an `http://localhost:3001` weiter.
- `README.md`: Abschnitt „Local mock backend (development only)“.

## Aufgabe 1: Ein GET-Endpunkt pro Ressource

| Endpunkt | Datei |
|---|---|
| `GET /api/case` | `case.json` |
| `GET /api/evidence` | `evidence.json` |
| `GET /api/people` | `people.json` |
| `GET /api/locations` | `locations.json` |
| `GET /api/timeline` | `timeline.json` |

Die Zuordnung steht im Objekt `RESOURCES`. Der Server liest die Datei bei jeder Anfrage und schickt sie als JSON zurück. Die Form der Daten ist dadurch exakt dieselbe wie bisher. Andere Methoden als GET beantwortet er mit 405, unbekannte Pfade mit 404. Es gibt also keine Schreib-Endpunkte. Bookmarks, Notizen und die Hypothese bleiben im `localStorage`.

## Aufgabe 2: Verzögerung und Fehler auf Abruf

An jedem Endpunkt funktionieren diese Query-Parameter:

- `?delay=2000`: Der Server wartet 2000 ms, bevor er antwortet (`await wait(delay)`).
- `?fail=1`: Der Server antwortet mit HTTP 500 und `{ "error": "Simulated server error" }`.
- `?empty=1`: Der Server antwortet mit 200, aber leer (`[]`). Das brauchen wir für den Leer-Zustand in Demo 6.
- Umgebungsvariable `API_DELAY`: Standardverzögerung für alle Anfragen, z. B. PowerShell: `$env:API_DELAY=2000; npm.cmd run server`.

Parameter lassen sich kombinieren: `?delay=3000&fail=1` liefert erst nach 3 Sekunden einen Fehler.

## Aufgabe 3: Neben `vite dev` starten, nur für die Entwicklung

Zwei Terminals:

```
npm.cmd run server   -> Mock API (dev only) running on http://localhost:3001/api
npm.cmd run dev      -> Vite, /api wird an Port 3001 weitergeleitet
```

Getestet (mit curl):

| Anfrage | Ergebnis |
|---|---|
| `/api/case` | 200, Fall-Objekt |
| `/api/people?empty=1` | 200, `[]` |
| `/api/timeline?fail=1` | 500 |
| `/api/locations?delay=1500` | 200 nach ca. 1,5 s |
| `/api/nope` | 404 |
| `POST /api/case` | 405 |
| `http://localhost:<vite-port>/api/people` | 200 (über den Proxy) |

Der Deploy-Workflow (`deploy.yml`) führt nur `npm run build` aus und lädt `dist/` hoch. Der Server ist darin nicht enthalten, und `server.proxy` gilt nur für den Dev-Server. GitHub Pages bleibt eine rein statische Seite. Das steht auch so im README.

### Selbst vorführen

1. Terminal 1: `npm.cmd run server`
2. Im Browser `http://localhost:3001/api/evidence` öffnen: JSON erscheint.
3. `http://localhost:3001/api/evidence?fail=1` öffnen: Fehlerobjekt. In den DevTools (Network) sieht man den Status 500.
4. `http://localhost:3001/api/evidence?delay=3000` öffnen: Die Seite lädt 3 Sekunden.
5. Im Server-Terminal steht jede Anfrage als Logzeile.

## Frage 1: Warum künstliche Verzögerung und Fehler, statt einfach die JSON-Dateien zu verwenden?

Lokale Dateien antworten praktisch sofort und praktisch immer erfolgreich. Den Ladezustand sieht man dann nur für Millisekunden. Den Fehlerzustand könnte man nur erzeugen, indem man eine Datei löscht oder umbenennt, und auch dann nur als 404.

Ohne die Steuerung könnte ich nicht überzeugend zeigen:
- dass der Lade-Indikator wirklich erscheint und wieder verschwindet (Demo 6),
- dass ein Serverfehler (500) sauber als Fehlermeldung angezeigt wird und nicht ein ewiger Spinner (Demo 6),
- eine Request-Race: Eine ältere, langsame Antwort kommt nach einer neueren an. Das passiert nur, wenn Antworten unterschiedlich lange brauchen (Demo 7).

Kurz zum Vortragen: „Echte Netzwerke sind langsam und fallen manchmal aus. Mit Verzögerung und Fehler auf Knopfdruck kann ich genau diese Fälle reproduzierbar vorführen, statt auf Zufall zu hoffen.“

## Frage 2: Was ist CORS und musste ich mich darum kümmern?

CORS (Cross-Origin Resource Sharing) ist eine Sicherheitsregel des Browsers. Ein Origin besteht aus Protokoll, Host und Port. Lädt JavaScript von `http://localhost:5173` Daten von `http://localhost:3001`, ist das ein anderer Origin (anderer Port). Der Browser gibt die Antwort dem Skript nur, wenn der Server das per Header erlaubt, z. B. `Access-Control-Allow-Origin: http://localhost:5173`.

Ich musste CORS nicht konfigurieren, weil ich den Vite-Proxy verwende. Das Frontend ruft `/api/evidence` relativ auf, also beim eigenen Origin (Vite). Der Vite-Dev-Server leitet die Anfrage serverseitig an Port 3001 weiter. CORS gilt nur im Browser, Server-zu-Server-Anfragen betrifft es nicht. Für den Browser gibt es daher nur einen einzigen Origin.

Die Alternative wäre gewesen, im Backend den Header `Access-Control-Allow-Origin` zu setzen und im Frontend die volle URL `http://localhost:3001/api/...` zu verwenden. Der Proxy hat zwei Vorteile: kein CORS-Code und keine fest eingebaute Server-Adresse im Frontend.

Kurz zum Vortragen: „CORS blockiert im Browser Antworten von anderen Origins. Mit dem Vite-Proxy spricht der Browser nur mit Vite, deshalb trat CORS bei mir nicht auf.“

---

# Demo 5: Backend aus React verwenden

## Aufgabe 1: Eine Ansicht lädt per fetch() in einem useEffect

Gewählt: die Locations-Ansicht, weil sie als einzige nur eine Ressource (`locations`) braucht.

- Neu: `src/features/people-locations/LocationsPage.tsx`
- `src/app/App.tsx`: Die Route `/team/locations` rendert jetzt `<LocationsPage />`, statt `data.locations` aus App zu verwenden.

```tsx
const [locations, setLocations] = useState<Location[] | null>(null);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  async function loadLocations() {
    try {
      const response = await fetch("/api/locations");
      if (!response.ok) {
        throw new Error(`locations: HTTP ${response.status}`);
      }
      const data = (await response.json()) as Location[];
      setLocations(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not load locations.");
    }
  }
  loadLocations();
}, []);
```

- `fetch("/api/locations")` geht an den Vite-Dev-Server. Der Proxy aus Demo 4 leitet weiter an `http://localhost:3001/api/locations`.
- `response.ok` muss ich selbst prüfen: `fetch` wirft bei 404 oder 500 keinen Fehler, sondern nur bei Netzwerkproblemen (Server nicht erreichbar).
- `[]`: Der Effect läuft einmal nach dem Einbinden der Komponente.
- Die Effect-Funktion selbst ist nicht `async`, weil ein Effect nur eine Cleanup-Funktion (oder nichts) zurückgeben darf. Eine async-Funktion würde ein Promise zurückgeben. Deshalb steht eine innere async-Funktion darin, die sofort aufgerufen wird.

Bewusst noch nicht enthalten: ein Leer-Zustand (Demo 6) und Schutz vor veralteten Antworten (Demo 7).

## Aufgabe 2: Die restlichen Datenquellen umstellen

`src/dashboardData.ts`, Funktion `loadJson`:

```ts
// vorher
const response = await fetch(`${import.meta.env.BASE_URL}data/${filename}`);   // z. B. data/case.json
// nachher
const response = await fetch(`/api/${resource}`);                                // z. B. /api/case
```

Die Aufrufe heißen jetzt `loadJson("case")`, `loadJson("evidence")` usw. `loadDashboardData()` wird weiterhin im bestehenden `useEffect` in `App.tsx` aufgerufen. Damit lesen Dashboard, People, Personen-Detail, Timeline, Evidence und Workspace vom Backend. Bookmarks kommen weiterhin aus `localStorage`.

Warum zentral in App und nicht jede Ansicht einzeln? Dashboard, Evidence und Workspace brauchen mehrere Ressourcen gleichzeitig. Außerdem ändert App den Evidence-Status und die Bookmarks im State. Bliebe jede Ansicht für sich, gingen diese Änderungen beim Routenwechsel verloren.

Kontrolle: In `src/` gibt es keinen Zugriff mehr auf `data/*.json`. Nur noch `/api/...`-Aufrufe (`grep "fetch(" src`). Die alte Vanilla-App (`index.html`/`app.js`) bleibt unverändert, weil es um die React-App geht.

Folge: Auf GitHub Pages gibt es kein `/api`. Die deployte React-App zeigt dort die Fehlermeldung. Das ist laut Aufgabe in Ordnung („Wiring up a real deployed backend is out of scope“).

### Selbst vorführen

1. Terminal 1: `npm.cmd run server`, Terminal 2: `npm.cmd run dev`
2. React-App öffnen, F12 → Network, Filter „api“.
3. Neu laden: fünf Anfragen `case`, `evidence`, `people`, `locations`, `timeline`, alle mit Status 200. Im Server-Terminal stehen dieselben fünf Zeilen.
4. Auf People & Locations → Locations wechseln: eine zusätzliche Anfrage `locations` von `LocationsPage`.
5. Server-Terminal mit Strg+C stoppen und die Seite neu laden: Es erscheint „Error: …“ statt der Daten. Das beweist, dass die Daten wirklich vom Backend kommen.

## Frage 1: Was passiert der Reihe nach vom Einbinden bis zu den Daten?

Am Beispiel `LocationsPage`:

1. **Erster Render:** React ruft `LocationsPage()` auf. `useState(null)` liefert `locations = null`. Die Komponente gibt „Loading locations…“ zurück.
2. **Commit:** React schreibt das ins DOM. Der Benutzer sieht den Ladetext.
3. **Effect läuft:** Erst nach dem Commit führt React den Effect aus (`[]` heißt: einmal nach dem Einbinden). `fetch("/api/locations")` startet die Anfrage. `await` pausiert nur die async-Funktion, React und der Browser laufen weiter.
4. **Netzwerk:** Browser → Vite-Proxy → Backend → liest `locations.json` → Antwort 200.
5. **Antwort kommt an:** `response.ok` ist true, `await response.json()` macht daraus ein Array.
6. **`setLocations(data)`:** Das plant eine State-Änderung ein. Diese State-Änderung ist der Grund für das erneute Rendern.
7. **Zweiter Render:** `locations` ist jetzt das Array. Die Komponente gibt die Liste der `LocationCard`s zurück.
8. **Commit:** React aktualisiert das DOM, die Orte sind sichtbar. Der Effect läuft wegen `[]` nicht noch einmal, also gibt es keine Endlosschleife.

Kurz zum Vortragen: „Erst rendert die Komponente den Ladezustand, danach startet der Effect den fetch. Wenn die Antwort da ist, setze ich State. Das löst einen neuen Render mit den Daten aus.“

## Frage 2: Was ist anders als vorher, welcher State ist neu?

Vorher kam `locations` als fertige Daten (Prop von App), die Komponente musste nichts über das Laden wissen. Bei einer lokalen Datei war die Wartezeit unsichtbar kurz und ein Fehler praktisch unmöglich.

Jetzt muss die Komponente selbst drei Situationen unterscheiden:

| Situation | State | Anzeige |
|---|---|---|
| Lädt noch | `locations === null`, `error === null` | „Loading locations…“ |
| Fehler | `error !== null` | „Error: locations: HTTP 500“ |
| Erfolg | `locations` ist ein Array | Liste |

Neu sind also der Datenzustand mit „noch nichts da“ (`null`) und der Fehlerzustand (`error`). Außerdem ist die Komponente nicht mehr rein: Sie hat einen Effect, der mit etwas außerhalb von React (dem Server) spricht.

Kurz zum Vortragen: „Vorher waren die Daten einfach da. Jetzt muss die Komponente zusätzlich wissen: lädt es noch, ist ein Fehler passiert, oder sind die Daten da.“

---

# Demo 6: Lade-, Fehler- und Leer-Zustand

## Aufgabe 1: Alle drei Zustände für eine Ansicht

Ansicht: Locations.

- `src/components/LoadStates.tsx` (neu): `LoadingState`, `ErrorState`, `EmptyState`
- `src/features/people-locations/LocationsPage.tsx`: ein State-Objekt `LoadState`, eine Simulationsauswahl (nur in der Entwicklung) und „Try again“
- `src/react.css`: Klassen `.load-state--loading`, `--error`, `--empty`

### Ein State statt mehrerer Booleans

```tsx
type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: Location[] };
```

`status` sagt, welcher Fall gerade gilt. Nur im Fall `"success"` gibt es `data`, nur im Fall `"error"` gibt es `message`. TypeScript erzwingt das: `state.data` ist nur nach der Prüfung `state.status === "success"` erlaubt.

„Leer“ ist kein eigener Status, sondern wird beim Rendern berechnet: `state.status === "success" && state.data.length === 0`.

### Effect

```tsx
useEffect(() => {
  setState({ status: "loading" });       // jeder Ladevorgang beginnt im Ladezustand
  async function loadLocations() {
    try {
      const response = await fetch(`/api/locations${SIMULATIONS[simulation].query}`);
      if (!response.ok) throw new Error(`The server answered with HTTP ${response.status}.`);
      setState({ status: "success", data: await response.json() });
    } catch (error) {
      setState({ status: "error", message: ... });
    }
  }
  loadLocations();
}, [simulation, attempt]);
```

- `simulation`: Auswahl im Dropdown (Normal, Slow, Server error, Slow error, Empty). Hängt die Query-Parameter aus Demo 4 an. Ändert sich die Auswahl, lädt der Effect neu.
- `attempt`: wird vom Button „Try again“ erhöht und lädt dadurch erneut.

## Aufgabe 2: Visuell und strukturell unterscheidbar

| | Laden | Fehler | Leer |
|---|---|---|---|
| Markup | Spinner + Text | Titel, Ursache, Button | Titel, Erklärung |
| Rolle | `role="status"` | `role="alert"` | keine |
| Aussehen | grau, drehender Spinner, kein Rahmen | rot, durchgezogener roter Rahmen, rosa Hintergrund | gestrichelter grauer Rahmen |
| Aktion | keine | „Try again“ | keine (kein Fehler, nichts zu tun) |
| Text | „Loading locations…“ | „Locations could not be loaded. The server answered with HTTP 500.“ | „No locations recorded for this case.“ |

Die Panel-Überschrift „Locations“ bleibt in allen Zuständen stehen. Man weiß also immer, welcher Bereich lädt, fehlt oder leer ist.

Fehler- und Leer-Zustand wurden per Screenshot (Headless-Edge) geprüft. Den Ladezustand bitte live mit „Slow (3 s)“ ansehen.

### Selbst vorführen

1. `npm.cmd run server` und `npm.cmd run dev`, React-App öffnen, People & Locations → Locations.
2. Auswahl „Slow (3 s)“: 3 Sekunden Spinner, dann die Orte.
3. „Server error (500)“: roter Fehlerkasten. Im Network-Tab: `locations?fail=1` mit Status 500.
4. „Try again“: Lädt erneut (neue Zeile im Server-Terminal), Ergebnis wieder 500.
5. „Empty response“: gestrichelter Kasten „No locations recorded for this case.“
6. „Slow error“: erst 2 s Spinner, dann der Fehler. Man sieht den Übergang von Laden zu Fehler.
7. Zurück auf „Normal“: Liste.

## Frage 1: Welche State-Variablen unterscheiden die Zustände?

Eine einzige: `state` mit dem Feld `status`.

| Situation | `state` |
|---|---|
| lädt | `{ status: "loading" }` |
| Fehler | `{ status: "error", message: "The server answered with HTTP 500." }` |
| erfolgreich, leer | `{ status: "success", data: [] }` |
| erfolgreich mit Daten | `{ status: "success", data: [6 Orte] }` |

Warum nicht drei Variablen `isLoading`, `error`, `data`? Damit wären unmögliche Kombinationen möglich, zum Beispiel `isLoading = true` und gleichzeitig `error = "..."`. Vergisst man an einer Stelle, eine Variable zurückzusetzen, zeigt die Oberfläche zwei Zustände gleichzeitig oder einen falschen. Mit einem Status-Feld gilt immer genau ein Fall.

Wichtig ist der Unterschied zwischen Leer und Fehler: Leer heißt `status: "success"` mit `data: []`. Der Server hat geantwortet, es gibt nur nichts. Fehler heißt: Wir wissen nicht, ob es Daten gibt.

Kurz zum Vortragen: „Ich habe ein State-Objekt mit status loading, error oder success. Leer ist success mit leerem Array. So kann nie gleichzeitig Laden und Fehler angezeigt werden.“

## Frage 2: Der hängende Spinner der Vanilla-App

Der Fehler steht in `modules/data.ts`, `loadAllData`:

```ts
const peopleResponse = await fetch("data/people.json");        // kein try/catch
state.allPeople = await peopleResponse.json();
const locationsResponse = await fetch("data/locations.json");
state.allLocations = await locationsResponse.json();
hideLoadingStep();                                              // wird bei einem Fehler nie erreicht
```

Wirft `fetch` oder `json()` einen Fehler, springt die Ausführung aus der Funktion. `hideLoadingStep()` wird nie aufgerufen, das Overlay bekommt nie die Klasse `hidden` und bleibt für immer stehen. Der Spinner ist dort ein eigener DOM-Zustand, der in jedem Codepfad einzeln wieder ausgeschaltet werden muss.

In React ist der Spinner kein eigener Zustand, den man ausschalten muss. Er ist eine Folge von `state`:

```tsx
{state.status === "loading" && <LoadingState ... />}
```

- Es gibt kein „hideLoading“. Sobald `state` etwas anderes als `"loading"` ist, rendert React den Spinner nicht mehr und entfernt ihn aus dem DOM.
- Im Erfolgspfad wird `"success"` gesetzt, im `catch` wird `"error"` gesetzt. Beide Wege verlassen den Ladezustand automatisch. Der Fehlerpfad ersetzt den Spinner sogar durch eine sichtbare Meldung.
- `response.ok` wird geprüft. Ein 500 landet dadurch auch im `catch`, statt die Fehlerantwort als Daten zu verwenden. Die Vanilla-Version prüft das gar nicht.

Ganz unmöglich ist der Fehler nicht: Würde man den `catch`-Block vergessen, bliebe der State bei `"loading"`. Er ist aber schwerer zu machen, weil man nur noch an einer Stelle festlegt, was angezeigt wird. Außerdem muss man nicht in jedem Pfad an ein Aufräumen denken.

Kurz zum Vortragen: „In der Vanilla-App musste der Spinner auf jedem Weg manuell versteckt werden, und im Fehlerpfad wurde das vergessen. In React wird der Spinner aus dem State abgeleitet: Ich setze im Erfolg success und im catch error, und der Spinner verschwindet automatisch.“

---

# Demo 7: Request-Races und Abbrechen

## Aufgabe 1: Race Condition erzeugen

Ort: `src/features/people-locations/LocationsPage.tsx`. Die Seite lädt bei jeder Änderung der Simulation neu (`[simulation, attempt]` im Abhängigkeitsarray). Mit „Slow (3 s)“ (`?delay=3000`) antwortet der Server erst nach 3 Sekunden. Wählt man in dieser Zeit „Empty response“, laufen zwei Anfragen gleichzeitig:

| Zeit | Ereignis | Anzeige |
|---|---|---|
| 0 s | Anfrage #1 `?delay=3000` startet | Spinner |
| 0,5 s | Auswahl „Empty“, Effect läuft erneut, Anfrage #2 `?empty=1` startet | Spinner |
| ~0,5 s | #2 antwortet sofort mit `[]`, `setState(success, [])` | „No locations recorded“ |
| 3 s | #1 antwortet mit 6 Orten, `setState(success, 6 Orte)` | **6 Orte**, obwohl „Empty“ ausgewählt ist |

Ja, ohne Schutz gewinnt die ältere Antwort, weil sie zuletzt ankommt. React weiß nicht, dass sie veraltet ist. `setState` überschreibt einfach den aktuellen Zustand.

## Aufgabe 2: Fix mit AbortController

```tsx
useEffect(() => {
  const controller = new AbortController();      // pro Effect-Durchlauf ein eigener
  setState({ status: "loading" });

  async function loadLocations() {
    try {
      const response = await fetch(url, { signal: controller.signal });
      ...
      setState({ status: "success", data });
    } catch (error) {
      if (controller.signal.aborted) return;     // veraltet: nichts anzeigen
      setState({ status: "error", message: ... });
    }
  }
  loadLocations();

  return () => controller.abort();               // Cleanup bricht die alte Anfrage ab
}, [simulation, attempt]);
```

- Jeder Effect-Durchlauf erzeugt einen eigenen `AbortController`. Das `signal` wird an `fetch` übergeben.
- Ändert sich `simulation`, ruft React zuerst den Cleanup des alten Durchlaufs auf. Dieser ruft `controller.abort()` auf.
- Das `fetch` (oder `response.json()`) der alten Anfrage wirft dann einen `AbortError`. Im `catch` erkennen wir das an `controller.signal.aborted` und beenden die Funktion, ohne State zu setzen. Ein Abbruch ist kein Fehler, deshalb erscheint auch kein roter Fehlerkasten.
- Im Network-Tab steht die alte Anfrage als „(canceled)“. Der Server arbeitet trotzdem weiter und antwortet nach 3 s, der Browser verwirft die Antwort aber.

Für die Vorführung gibt es die Checkbox „Cancel stale requests (Demo 7 fix)“ (nur im Dev-Modus). Ist sie aus, wird kein `signal` übergeben und nicht abgebrochen. Dann sieht man die Race Condition. In der Konsole stehen die Anfragen nummeriert (`[#1] Anfrage gestartet …`, `[#1] Cleanup: breche Anfrage ab …`, `[#2] Antwort angezeigt …`).

### Selbst vorführen

1. `npm.cmd run server` und `npm.cmd run dev`, React-App öffnen, People & Locations → Locations, DevTools mit Konsole und Network öffnen.
2. Checkbox **aus**. „Slow (3 s)“ wählen, sofort danach „Empty response“.
3. Erst erscheint „No locations recorded“, nach 3 s plötzlich die 6 Orte. Das ist der veraltete Treffer. Konsole: `[#2] Antwort angezeigt: Empty …`, danach `[#1] Antwort angezeigt: Slow (3 s) (6 Orte)`.
4. Checkbox **an**, Schritt 2 wiederholen.
5. „No locations recorded“ bleibt stehen. Konsole: `[#…] Cleanup: breche Anfrage ab (Slow (3 s))`, `abgebrochen, Antwort ignoriert`. Network: Anfrage mit `delay=3000` steht als „(canceled)“.

## Frage 1: Welche genaue Abfolge lässt das veraltete Ergebnis gewinnen?

1. Anfrage A (langsam) startet.
2. Die Abhängigkeit ändert sich, der Effect läuft erneut. Anfrage B (schnell) startet. A läuft weiter, niemand hält sie auf.
3. B kommt zuerst an und setzt den State. Die Anzeige stimmt.
4. A kommt danach an und setzt den State ebenfalls. Wer zuletzt `setState` aufruft, gewinnt. Die Anzeige passt nicht mehr zur Auswahl.

Ursache: Die Antworten kommen nicht in der Reihenfolge an, in der die Anfragen gestartet wurden, und die alte Anfrage darf noch State schreiben.

Kurz zum Vortragen: „Die alte, langsame Anfrage läuft weiter, nachdem schon eine neue gestartet ist. Die neue antwortet zuerst, die alte zuletzt, und weil der letzte setState gewinnt, überschreibt die alte Antwort die neue.“

## Frage 2: Wie hängen AbortController und Cleanup zusammen?

Das sind zwei verschiedene Dinge, die ich verbinde:

- Der **Cleanup** ist eine React-Funktion. React ruft ihn selbst auf, bevor der Effect mit neuen Abhängigkeiten erneut läuft, und beim Unmount. React weiß aber nichts über `fetch`.
- **`AbortController`** ist eine Browser-API. Sie bricht die Netzwerkanfrage ab, weiß aber nichts davon, wann React neu rendert.

In meiner Umsetzung ist das Abbrechen genau das, was **im** Cleanup passiert: `return () => controller.abort();`. Der Cleanup liefert den richtigen Zeitpunkt („diese Anfrage ist jetzt veraltet“), der AbortController setzt ihn um. Weil der Controller im Effect erzeugt wird, gehört jeder Cleanup zu genau seiner eigenen Anfrage (Closure). Der Cleanup von Durchlauf 1 bricht also nur Anfrage 1 ab, nie die neue.

Dazu kommt der `catch`: Nach dem Abbruch wirft `fetch` einen `AbortError`. Den fange ich ab und setze keinen State. Sonst würde statt der veralteten Daten ein falscher Fehler angezeigt.

Beim Verlassen der Seite (Unmount) läuft derselbe Cleanup, die Anfrage wird abgebrochen, und es wird kein State einer Komponente gesetzt, die es nicht mehr gibt.

Kurz zum Vortragen: „React ruft den Cleanup auf, wenn die Anfrage veraltet ist. In diesem Cleanup rufe ich controller.abort() auf. Der Cleanup bestimmt also das Wann, der AbortController das Wie. Im catch ignoriere ich den AbortError, damit kein falscher Fehler erscheint.“

---

# Demo 8: Wiederverwendbarer Custom Hook

## Aufgabe: Ladelogik in `useFetch<T>(url)` auslagern

Neue Datei `src/hooks/useFetch.ts`. Darin steht alles, was in Demo 5–7 direkt in `LocationsPage` stand:

| aus Demo | im Hook |
|---|---|
| 5 | `fetch(url)` in einem `useEffect`, `response.ok` prüfen |
| 6 | ein State `FetchState<T>`: `loading` / `error` / `success` (leer = `success` mit `[]`) |
| 6 | `reload()` für „Try again“ (intern ein `attempt`-Zähler im Abhängigkeitsarray) |
| 7 | eigener `AbortController` pro Durchlauf, `abort()` im Cleanup, `AbortError` ignorieren |

```ts
export function useFetch<T>(url: string, { cancelStale = true } = {}) {
  const [state, setState] = useState<FetchState<T>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => { ... fetch(url, { signal }) ... return () => controller.abort(); },
            [url, attempt, cancelStale]);
  function reload() { setAttempt((p) => p + 1); }
  return { state, reload };
}
```

Der Hook gibt `{ state, reload }` zurück. `T` ist generisch: `useFetch<Location[]>` liefert `state.data` als `Location[]`, `useFetch<Person[]>` als `Person[]`.

`url` steht im Abhängigkeitsarray. Ändert sich die URL (z. B. andere Simulation), lädt der Hook neu und bricht die alte Anfrage ab.

### Die zwei Stellen

1. `src/features/people-locations/LocationsPage.tsx`:
   ```tsx
   const { state, reload } = useFetch<Location[]>(
     `/api/locations${SIMULATIONS[simulation].query}`,
     { cancelStale },
   );
   ```
2. `src/features/people-locations/PeoplePage.tsx` (neu, ersetzt den People-Tab in `App.tsx`):
   ```tsx
   const { state, reload } = useFetch<Person[]>("/api/people");
   ```

Getestet mit Headless-Edge: `/team/people` zeigt die Personenkarten, `/team/locations` die 6 Orte. Im Server-Log stehen `GET /api/people` und `GET /api/locations`.

### Selbst vorführen

1. `npm.cmd run server` und `npm.cmd run dev`, Konsole offen.
2. People & Locations → People: kurz „Loading people…“, dann die Karten. Konsole: `[#1] Anfrage gestartet: /api/people`.
3. Tab Locations: Simulation und Checkbox aus Demo 6/7 funktionieren unverändert, jetzt aber über den Hook.
4. Race aus Demo 7 wiederholen (Slow, dann Empty): gleiches Verhalten wie vorher. Der Hook hat das Verhalten nicht verändert, nur den Ort des Codes.

## Frage 1: Was macht einen echten Custom Hook aus? Welche Regeln gelten?

Ein Custom Hook ist eine Funktion, die **selbst andere Hooks aufruft** (`useState`, `useEffect`, `useRef`, ...). Ihr Name beginnt **mit `use`**.

Der Unterschied zu einer normalen Hilfsfunktion:

- `loadJson()` in `dashboardData.ts` ist eine **Hilfsfunktion**. Sie holt Daten und gibt ein Promise zurück. Sie hat keinen State, löst kein Rendern aus und kann überall aufgerufen werden, auch in einem Klick-Handler.
- `useFetch()` ist ein **Hook**. Er besitzt State, der zur aufrufenden Komponente gehört. Ändert er sich, rendert diese Komponente neu. Er hat einen Effect mit Cleanup, der an den Lebenszyklus der Komponente gebunden ist.

Jeder Aufruf bekommt **eigenen** State. `PeoplePage` und `LocationsPage` teilen nichts. Jede hat ihr eigenes `state`, ihren eigenen `attempt` und eigene Controller. Geteilt wird die **Logik**, nicht die Daten.

Regeln für Hooks (Rules of Hooks):

1. **Nur auf oberster Ebene aufrufen**: nicht in `if`, Schleifen, verschachtelten Funktionen oder nach einem frühen `return`. React erkennt Hooks nur an ihrer **Reihenfolge** bei jedem Rendern. Wird ein Hook mal aufgerufen und mal nicht, verrutscht die Zuordnung und `useState` liefert den State eines anderen Hooks.
   ```tsx
   if (showPeople) { const { state } = useFetch("/api/people"); }   // ❌ falsch
   ```
2. **Nur in React-Funktionskomponenten oder in anderen Custom Hooks** aufrufen, nicht in normalen Funktionen, Event-Handlern oder Klassen.
3. Der Name mit `use` ist die Konvention, an der React (und das ESLint-Plugin `eslint-plugin-react-hooks`) erkennt, dass die Regeln geprüft werden müssen.

Kurz zum Vortragen: „Ein Custom Hook ist eine Funktion mit use-Präfix, die selbst Hooks aufruft. Dadurch hat sie State und Effects, die zur aufrufenden Komponente gehören. Eine Hilfsfunktion holt nur Daten. Hooks dürfen nur oben in Komponenten oder anderen Hooks aufgerufen werden, nie bedingt, weil React sie über die Aufrufreihenfolge zuordnet.“

## Frage 2: Was wurde eingespart, was bleibt pro Stelle?

**Eingespart** (stünde sonst in beiden Komponenten doppelt, ca. 50 Zeilen):

- `useState` für den Ladezustand plus der `FetchState`-Typ
- `useEffect` mit `fetch`, `response.ok`-Prüfung, `json()`
- Fehlerbehandlung im `catch`
- `AbortController`, Cleanup, Erkennen des Abbruchs (Demo 7). Genau diese Stelle vergisst man beim Kopieren gern, dann hätte nur eine Seite den Race-Fix.
- `attempt`-Zähler und `reload()` für „Try again“

**Bleibt pro Stelle** (kann nicht geteilt werden):

| | LocationsPage | PeoplePage |
|---|---|---|
| URL | `/api/locations` + Simulations-Query | `/api/people` |
| Typ `T` | `Location[]` | `Person[]` |
| Simulation/Checkbox | ja, nur hier (Dev-Vorführung) | nein |
| Texte | „Loading locations…“, „No locations recorded…“ | „Loading people…“, „No people recorded…“ |
| Darstellung der Daten | `LocationCard` | `PersonCard` mit Link zum Profil |

Der Hook entscheidet nur, **in welchem Zustand** die Daten sind. **Wie** jeder Zustand aussieht, ist Sache der Komponente. Die Bausteine `LoadingState`/`ErrorState`/`EmptyState` werden zwar geteilt, aber Text und Erfolgsdarstellung sind pro Seite verschieden.

Kurz zum Vortragen: „Beide Seiten rufen nur noch useFetch mit ihrer URL auf. Eingespart sind State, Effect, Fehlerbehandlung, Abbrechen und Retry. Pro Seite bleiben URL, Datentyp, Texte und wie die Daten gerendert werden, bei Locations zusätzlich die Simulationsauswahl.“

---

# Demo 9: UI, Anwendungslogik und API-Zugriff trennen

## Aufgabe 1: Drei Schichten

```
Komponente (UI)          PeoplePage, LocationsPage, App
     │  ruft auf: useApi(...)  bzw. loadDashboardData()
     ▼
Hook / Anwendungslogik   src/hooks/useApi.ts, src/dashboardData.ts
     │  ruft auf: fetchPeople(), fetchLocations(), ...
     ▼
API-Schicht              src/api/mysteryApi.ts   ← einziges fetch
     │
     ▼
Backend                  GET /api/...
```

| Schicht | Datei | weiß | weiß nicht |
|---|---|---|---|
| API | `src/api/mysteryApi.ts` | URLs (`/api/people`), Query-Parameter (`?delay=`, `?fail=1`, `?empty=1`), Form der Antworten (`CaseInfo`, `Person[]`), HTTP-Status prüfen | React, State, Ladezustand |
| Anwendungslogik | `src/hooks/useApi.ts` | Ladezustand, Fehler, Abbrechen (AbortController), Retry | URLs, `fetch`, was angezeigt wird |
| Anwendungslogik | `src/dashboardData.ts` | alle Daten für die App zusammensetzen, Bookmarks aus `localStorage` | URLs, `fetch` |
| UI | Komponenten | Texte, Karten, welche Daten sie brauchen | URLs, `fetch`, AbortController |

Was sich geändert hat:

- **Neu `src/api/mysteryApi.ts`:** Eine Funktion pro Endpunkt (`fetchCase`, `fetchEvidence`, `fetchPeople`, `fetchLocations`, `fetchTimeline`). Alle nutzen intern `getJson<T>()`, das als einziges `fetch` aufruft, `response.ok` prüft und `json()` liefert. Optionen: `signal` (zum Abbrechen) und `simulate` (Backend-Simulation aus Demo 4).
- **`useFetch(url)` wurde zu `useApi(load, deps)`:** Der Hook bekommt keine URL mehr, sondern eine Ladefunktion aus der API-Schicht. Er ruft sie mit dem `signal` seines AbortControllers auf. `deps` sagt, wann neu geladen wird, wie bei `useEffect`.
  ```tsx
  // PeoplePage
  useApi<Person[]>((signal) => fetchPeople({ signal }), []);
  // LocationsPage
  useApi<Location[]>(
    (signal) => fetchLocations({ signal, simulate: SIMULATIONS[simulation].simulate }),
    [simulation],
    { cancelStale },
  );
  ```
  `load` steht absichtlich nicht im Abhängigkeitsarray. Eine Inline-Pfeilfunktion ist bei jedem Rendern ein neues Objekt, das würde endlos neu laden.
- **`LocationsPage`:** Die Simulation steht nicht mehr als Query-String (`"?delay=3000"`) in der Komponente, sondern als Objekt (`{ delayMs: 3000 }`). Wie der Parameter heißt, weiß nur die API-Schicht.
- **`dashboardData.ts`:** Das eigene `loadJson` mit `fetch` ist weg. `loadDashboardData()` ruft die fünf API-Funktionen auf. `CaseInfo` liegt jetzt in der API-Schicht und wird von hier weiter exportiert, damit `Dashboard.tsx` unverändert bleibt.

Getestet: `tsc` und ESLint ohne Fehler. Headless-Edge: Dashboard, People, Locations, Timeline und Evidence laden. Die erzeugten URLs der API-Schicht sind mit einem Fake-`fetch` geprüft: `/api/locations`, `?delay=3000`, `?delay=2000&fail=1`, `?empty=1`, also dieselben wie vorher.

## Aufgabe 2: Keine Komponente ruft `fetch` direkt auf

```
> grep -rn "fetch(" src
src/api/mysteryApi.ts:49:  const response = await fetch(

> grep -rn '"/api\|`/api' src
src/api/mysteryApi.ts:13:const BASE_URL = "/api";
```

In der ganzen React-App gibt es genau einen `fetch`-Aufruf und genau eine Stelle mit der Backend-URL, beide in der API-Schicht. (`modules/data.ts` gehört zur alten Vanilla-App, nicht zu React.)

### Selbst vorführen

1. Die Suche oben zeigen (VS Code: Strg+Shift+F nach `fetch(` in `src`).
2. `npm.cmd run server` und `npm.cmd run dev`: Alle Seiten laden wie vorher. Simulation und Race-Fix auf der Locations-Seite funktionieren unverändert.
3. `src/api/mysteryApi.ts` öffnen: „Hier und nur hier steht, wie das Backend aussieht.“

## Frage 1: Wenn sich URLs oder Antwortform morgen ändern, welche Dateien muss ich anfassen?

**URLs ändern sich** (z. B. `/api/people` wird `/v2/persons`): **eine Datei**, `src/api/mysteryApi.ts`. Entweder `BASE_URL` ändern oder den Ressourcennamen in `fetchPeople`. Hook, `dashboardData.ts` und Komponenten bleiben gleich, weil sie nur `fetchPeople()` kennen.

**Antwortform ändert sich**, Beispiel: Der Server liefert statt `[...]` jetzt `{ items: [...], total: 6 }`. Auch nur **`mysteryApi.ts`**: Dort wird ausgepackt, und `fetchPeople` gibt weiterhin `Person[]` zurück.
```ts
export async function fetchPeople(options?: RequestOptions) {
  const body = await getJson<{ items: Person[] }>("people", options);
  return body.items;
}
```

**Feldnamen ändern sich** (z. B. `role` wird `position`): Hier gibt es zwei Wege.
- In `mysteryApi.ts` auf die alte Form umrechnen (`{ ...p, role: p.position }`). Dann ist es wieder **nur eine Datei**.
- Oder die App übernimmt den neuen Namen. Dann ändern sich der Typ in `modules/domain.ts` und jede Komponente, die `role` anzeigt (`PeoplePage`, `PersonCard`, `PersonDetailPage`). Das wäre aber eine bewusste Entscheidung und keine Pflicht.

Keine Komponente muss sich ändern, solange die API-Schicht die gewohnten Typen zurückgibt.

Vorher (Demo 8) stand die URL in `LocationsPage`, `PeoplePage` und `dashboardData.ts`, die Simulations-Parameter direkt im Query-String der Komponente. Das wären drei bis vier Dateien gewesen, darunter Komponenten.

Kurz zum Vortragen: „Bei geänderten URLs oder einer anderen Antwortform ändere ich nur mysteryApi.ts. Solange die API-Schicht dieselben Typen zurückgibt, merkt keine Komponente etwas davon.“

## Frage 2: Was spricht gegen diese Trennung in einer kleinen App? Lohnt es sich hier?

**Dagegen:**

- **Mehr Dateien und Sprünge:** Um zu verstehen, was `PeoplePage` lädt, muss man durch drei Dateien gehen (Komponente → `useApi` → `mysteryApi`). Ein `fetch("/api/people")` direkt im Effect ist auf einen Blick klar.
- **Abstraktion, die man erst verstehen muss:** `useApi(load, deps)` ist schwerer zu lesen als ein normaler `useEffect`. Das `deps`-Argument und die Regel „`load` steht nicht im Abhängigkeitsarray“ muss man kennen, und das ESLint-Plugin für Hooks könnte das nicht mehr automatisch prüfen.
- **Overkill**, wenn es nur ein oder zwei Endpunkte gibt, die sich nie ändern, oder bei einem Prototyp, der bald weggeworfen wird. Dann kostet die Trennung mehr, als sie spart.
- **Falsche Allgemeinheit:** Man baut für „vielleicht ändert sich das Backend mal“. Ändert es sich nie, war es umsonst.

**Meine Einschätzung für dieses Projekt: ja, gerechtfertigt, aber knapp.**

- Die **API-Schicht** lohnt sich auf jeden Fall: Sie ist eine kleine Datei, und vorher stand die URL an drei Stellen und die Simulations-Parameter in einer Komponente.
- Der **Hook** lohnt sich, weil er an zwei Stellen verwendet wird und den Race-Fix aus Demo 7 enthält. Diese Logik möchte man nicht kopieren.
- Eine weitere Schicht (z. B. Repository-Klassen, Caching, eigene Fehlerklassen) wäre hier übertrieben.

Kurz zum Vortragen: „Dagegen spricht: mehr Dateien und mehr Indirektion, für eine App mit fünf GET-Endpunkten ist das schnell zu viel. Hier lohnt es sich trotzdem, weil die URL vorher an drei Stellen stand und der Abbruch-Code nur einmal existieren soll. Mehr Schichten würde ich nicht einführen.“
