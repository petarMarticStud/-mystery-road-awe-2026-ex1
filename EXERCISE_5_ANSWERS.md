# Exercise 5 — Umsetzung und Antworten

## Demo 1 — React-Events

### Umsetzung

- `EvidencePage.tsx`: Evidence-Karten, Suchfeld, Filter-/Sortierstruktur und Detailansicht.
- `WorkspacePage.tsx`: Bookmark-Liste, Notizliste und Struktur des Hypothesenformulars.
- Drei migrierte Interaktionen: Suche mit `onChange`, Bookmark mit `onClick`, Notiz speichern mit `onClick`. Auch Öffnen und Schließen der Details laufen über React-Handler.
- Die React-Routen verwenden diese Komponenten statt der bisherigen Platzhalter.
- Die React-Komponenten enthalten weder HTML-`onclick`-Attribute noch `addEventListener`, `innerHTML` oder DOM-Abfragen. `src/main.tsx` lädt nicht `app.js` oder `modules/views.ts`. Die alten Listener bleiben ausschließlich im separaten Vanilla-Einstieg `index.html` als Vergleichsversion erhalten; sie wurden nicht in die React-Ansichten übernommen.

### Frage 1: Wie wird ein Click-Handler angebunden, und welches Event erhält er?

React: `onClick={saveNote}` übergibt eine Funktion als JSX-Prop. React ruft sie beim Klick auf. `onClick={saveNote()}` würde sie dagegen bereits während des Renderns ausführen.

Vanilla: Beispielsweise `button.addEventListener("click", handler)` registriert einen Listener an einem DOM-Knoten. Ein HTML-Attribut wie `onclick="handler(event)"` enthält dagegen JavaScript als Text. Der Browser stellt dort `event` bereit; die aufgerufene Funktion erhält es nur, wenn es übergeben wird.

Ein React-Handler erhält ein React-Event (`SyntheticEvent`), der native Listener ein Browser-Event (`MouseEvent` beim Klick). Das sind nicht dieselben Objekttypen. React bietet eine ähnliche Schnittstelle mit `target`, `currentTarget`, `preventDefault()` und `stopPropagation()`; das Browser-Event ist über `nativeEvent` zugänglich. Unser Such-Handler verwendet `event.currentTarget.value`, also den Wert des Inputs, an dem der Handler hängt. Die Bookmark-Closure übergibt unmittelbar die Evidence-ID und benötigt kein Event-Argument.

### Frage 2: Brauchen wir weiterhin manuelle Event-Delegation?

Für die Evidence-Liste nicht. Jede Karte bindet ihre Aktion deklarativ mit `onClick={() => toggleBookmark(item.id)}` an den Button. React verwaltet die Anbindung über erneute Render-Vorgänge hinweg; wir müssen keine Listener nach jedem Austausch einer HTML-Zeichenkette neu registrieren. React verwendet intern selbst überwiegend Event-Delegation. Das bedeutet aber nicht, dass wir im Anwendungscode einen Container-Listener mit `event.target.closest(...)` nachbauen müssen.

Ein eigener Button öffnet die Details. Dadurch löst ein Bookmark-Klick nicht gleichzeitig das Öffnen einer klickbaren Elternkarte aus.

### Live vorführen

1. React-Einstieg `react.html` öffnen und zu Evidence navigieren.
2. Einen Titel oder Tag suchen: Die Kartenliste reagiert auf die Eingabe.
3. Einen Stern zweimal anklicken: Symbol und `aria-pressed` wechseln.
4. Details öffnen, Notiz eingeben und speichern: Gespeicherte Vorschau und Statusmeldung erscheinen.
5. Workspace öffnen: Die gespeicherte Notiz erscheint in der Notizliste.
6. Details eines anderen Evidence-Items öffnen: Der Editor zeigt dessen eigene Notiz. Der `key` setzt den lokalen Editor beim Wechsel zurück.

### Bewusster Zwischenstand

Am Ende von Demo 1 waren Filter/Sortierung und Hypothesenformular als noch nicht verdrahtete Bereiche deaktiviert. Demo 2 steuert das Hypothesenformular; die folgenden Demos ergänzen Filter und gemeinsamen State. Bookmarks sind aktuell nur in `EvidencePage` lokal und noch nicht persistent oder mit Dashboard/Workspace synchronisiert. Demo 5 hebt ihren State an den gemeinsamen Owner. Die Suche ist bereits kontrolliert, weil dies unmittelbar zur migrierten Suchinteraktion gehört.

## Demo 2 — useState und kontrollierte Formulare

### Schritt 1: Kontrollierte Suche prüfen

Die Suche in `EvidencePage.tsx` besitzt bereits `const [search, setSearch] = useState("")`, `value={search}` und `onChange={(event) => setSearch(event.currentTarget.value)}`. Damit ist dieser Teil der Aufgabe bereits erfüllt.

### Schritt 2: Das Hypothesenformular kontrollieren

In `WorkspacePage.tsx` liegt der Entwurf in `const [hypothesis, setHypothesis] = useState(loadHypothesis)`. `loadHypothesis` wird als Funktion übergeben und beim Initialisieren des States ausgeführt. Es ist kein neuer Effect nötig.

Alle sechs Felder lesen ihren Wert aus diesem Objekt und melden Änderungen über `updateField`:

| Feld | Wert im State | Auslesen bei Änderung |
|---|---|---|
| Verdächtige Person | `suspectId`, String | `event.currentTarget.value` |
| Art des Vorfalls | `nature`, String | `event.currentTarget.value` |
| Unterstützende Evidence | `evidenceIds`, String-Array | Aus `selectedOptions` ein Array der Werte erzeugen |
| Sicherheit | `confidence`, Zahl | `event.currentTarget.valueAsNumber` |
| Erklärung | `explanation`, String | `event.currentTarget.value` |
| Alternative | `alternative`, String | `event.currentTarget.value` |

`updateField("explanation", "Mein Text")` erzeugt mit `{ ...previous, [field]: value }` ein neues Objekt: Die bisherigen Felder werden übernommen und nur das genannte Feld wird ersetzt. Der alte State wird nicht direkt verändert. Das Ablesen von `event.currentTarget` ist normales Event-Handling, keine manuelle DOM-Manipulation.

### Schritt 3: Speichern und Wiederherstellen

Der Button hat `type="submit"`. Der `onSubmit`-Handler verhindert mit `event.preventDefault()` das normale Neuladen der Seite und ruft `saveHypothesis` auf. Diese Funktion speichert den aktuellen State zusammen mit `savedAt` als JSON unter `remotion_hypothesis` in `localStorage`. Sie liest keine Formularwerte über DOM-Abfragen aus.

Beim erneuten Öffnen oder Neuladen stellt `loadHypothesis` den gespeicherten Entwurf wieder her. Fehlende oder unlesbare Daten führen zu leeren Feldern und Sicherheit 50. Auch die als String gespeicherte Sicherheit der Vanilla-Version wird eingelesen. Ein fehlgeschlagener Schreibzugriff wird als Fehlermeldung angezeigt. Beim Weiterbearbeiten verschwindet die vorherige Speichermeldung. Ungespeicherte Änderungen bleiben beim Verlassen der Seite nicht erhalten.

### Frage 1: Was bedeutet kontrolliert oder unkontrolliert?

**Kontrolliert:** React-State bestimmt den angezeigten Wert. Beispiel:

```tsx
<input value={search} onChange={(event) => setSearch(event.currentTarget.value)} />
```

Du tippst → `onChange` erhält den neuen Text → `setSearch` aktualisiert den State → React rendert erneut → `value={search}` zeigt den neuen State an.

**Unkontrolliert:** Der Browser verwaltet den aktuellen Eingabewert. `defaultValue` gibt nur den Anfangswert vor. React aktualisiert den Wert dabei nicht über eigenen State. In der Vanilla-Version wurden die Werte beim Speichern direkt aus den DOM-Feldern gelesen.

**Was passiert ohne onChange?** Zum Vorführen kurz den `onChange`-Handler am Suchfeld entfernen, `value={search}` aber stehen lassen. Das Feld lässt sich dann nicht dauerhaft ändern; React zeigt weiterhin den unveränderten State-Wert an. React warnt außerdem bei einem solchen Textfeld vor dem fehlenden Handler. Ohne Setter-Aufruf übernimmt der State die Eingabe nicht. Anschließend den Handler wieder einsetzen. Diese absichtlich kaputte Variante bleibt nicht im fertigen Code.

**Unterschied:** Bei der kontrollierten React-Lösung ist der State die Quelle des angezeigten Werts. Bei einem unkontrollierten Feld ist der aktuelle Wert im DOM maßgeblich.

### Frage 2: Ein useState pro Feld oder ein gemeinsames Objekt?

Wir verwenden ein gemeinsames Objekt für die sechs Hypothesenfelder. Sie gehören zu einem Entwurf und werden zusammen gespeichert und geladen. Ein Objekt lässt sich dafür direkt weitergeben. Die separate Speichermeldung ist eigener UI-State.

Einzelne `useState`-Aufrufe wären ebenfalls korrekt und für unabhängig veränderte Felder einfach lesbar. Beim gemeinsamen Speichern und Laden müsste man die Felder aber wieder einzeln zusammensetzen bzw. verteilen. Beim Objekt müssen wir umgekehrt aufpassen, bei einer Änderung die anderen Felder mit `...previous` zu übernehmen.

Demo 7 behandelt eine andere State-Domäne: Filter, Suche und Sortierung mit mehreren benannten Aktionen und gemeinsamem Reset. Dafür führen wir später einen Reducer ein. Ein größeres Objekt allein erzwingt noch keinen Reducer.

### Live vorführen

1. Evidence: Suchtext eingeben und wieder löschen; Liste und Eingabe reagieren.
2. Workspace: Person und Art wählen, mehrere Evidence-Items auswählen (Strg/Cmd gedrückt halten), Sicherheit verschieben und beide Texte eingeben.
3. Prüfen, dass die Zahl neben dem Schieberegler sofort mitgeht.
4. Save hypothesis draft drücken: Die Erfolgsmeldung erscheint.
5. Seite neu laden: Alle sechs gespeicherten Werte bleiben erhalten.
6. Einen Text ändern: Die bisherige Erfolgsmeldung verschwindet. Erst erneutes Speichern persistiert die Änderung.
7. Für die Theoriefrage den Such-Handler vorübergehend entfernen, das blockierte Feld zeigen und den Handler wiederherstellen.

Die Self-Check-Kästchen bleiben zur eigenen Bestätigung der Live-Demonstration offen.

## Demo 3 — Immutable Updates

### Schritt 1: Eine echte Mutation als Ausgangspunkt finden

Die separate Vanilla-Version in `modules/views.ts` verwendet beim Bookmark-Hinzufügen `state.bookmarks.push(id)` und setzt außerdem `evidence.bookmarked = true`. Das verändert das vorhandene Array bzw. Evidence-Objekt direkt. In React übernehmen wir diese Vorgehensweise nicht. Die React-Version war bereits seit Demo 1 unveränderlich; wir behaupten deshalb nicht, hier einen zuvor vorhandenen React-Mutationsfehler behoben zu haben.

### Schritt 2: Beide Toggle-Fälle ausdrücklich unveränderlich umsetzen

In `EvidencePage.tsx`:

```tsx
setBookmarks((previous) => {
  if (previous.includes(id)) {
    return previous.filter((item) => item !== id);
  }
  return [...previous, id];
});
```

- **Entfernen:** `filter` erstellt ein neues Array ohne die ID.
- **Hinzufügen:** `[...previous, id]` erstellt ein neues Array mit den bisherigen IDs und der neuen ID.
- **In beiden Fällen:** Der Inhalt des bisherigen Arrays bleibt erhalten. Das Evidence-Objekt wird ebenfalls nicht verändert; der Stern ergibt sich aus `bookmarks.includes(item.id)`.
- Der funktionale Setter erhält den jeweils aktuellen vorherigen State, auch wenn React mehrere Updates zusammen verarbeitet.

Der State wird mit `useState<readonly string[]>(() => [...data.bookmarks])` initialisiert. Die Kopie trennt ihn vom Array aus den Props. `readonly` verhindert in TypeScript direkte Aufrufe wie `bookmarks.push(...)` und `bookmarks.sort()`. Es friert das Array zur Laufzeit nicht ein; die Update-Logik muss weiterhin korrekt bleiben.

### Frage 1: Warum kann direkte Mutation scheinbar funktionieren, und was vergleicht React?

**Vanilla JS:** Wenn wir ein Array direkt verändern und anschließend die Ansicht manuell neu aufbauen, kann die Änderung sichtbar werden. Der Browser benötigt dafür keine neue Array-Referenz. Trotzdem betrifft die Mutation alle Stellen, die dasselbe Array verwenden.

**React:** Bei `useState` vergleicht React alten und neuen State mit `Object.is`. Bei Arrays und Objekten ist dabei die Referenz entscheidend, nicht ein tiefer Vergleich aller Inhalte. `previous.push(id); return previous;` würde dasselbe Array zurückgeben. React kann das Update deshalb überspringen.

Wenn später ein anderer State ein Rendern auslöst, kann die zuvor mutierte Änderung plötzlich sichtbar werden. Dadurch wirkt die Mutation manchmal erfolgreich, obwohl sie React nicht zuverlässig über die Änderung informiert hat. Außerdem wurden frühere State-Snapshots nachträglich verändert und andere Nutzer derselben Referenz können unerwartete Werte sehen.

**Unterschied:** Vanilla rendert nach unserem ausdrücklichen Aufruf. React braucht korrekte State-Updates; eine neue Array-Referenz signalisiert die Änderung. React schützt Arrays nicht automatisch vor Mutation.

### Frage 2: Wie vermeiden wir den früheren Fehler mit gemeinsam genutzten Arrays?

**Vanilla-Fehler:** Wenn `filteredEvidence` und die vollständige Evidence-Liste dasselbe Array referenzieren, verändert `filteredEvidence.sort(...)` auch die Reihenfolge der vollständigen Liste. Ein zweiter Variablenname erstellt keine Kopie.

**Unsere React-Lösung:** Beim Bookmark-Toggle geben beide Zweige ein neues Array zurück. Wir rufen weder `push` noch `splice` auf dem bisherigen State auf. Auch beim Initialisieren wird `data.bookmarks` kopiert. Die ursprünglichen Arrays bleiben unverändert.

Beispiel: Vorher ist `previous = ["E01"]`. Beim Hinzufügen von `E02` entsteht `next = ["E01", "E02"]`. Danach ist `previous` weiterhin `["E01"]`, und `Object.is(previous, next)` ergibt `false`. Beim Entfernen erstellt `filter` ebenfalls ein neues Array, auch wenn das Ergebnis leer ist.

Für spätere Sortierung gilt dasselbe Prinzip: `[...evidence].sort(compare)` statt `evidence.sort(compare)`. Die vollständige Sortierfunktion folgt in einer späteren Demo; React selbst macht `sort()` nicht unveränderlich.

### Live vorführen

1. Einen nicht gesetzten Stern anklicken: Die ID wird mit einem neuen Array hinzugefügt.
2. Denselben Stern erneut anklicken: Die ID wird mit einem neuen Array entfernt.
3. Im Debugger innerhalb des Setters die alte Referenz als `previous` behalten. Am jeweiligen `return` den neuen Ausdruck ansehen: `Object.is(previous, previous.filter((item) => item !== id))` bzw. `Object.is(previous, [...previous, id])` ist `false`; `previous` selbst bleibt unverändert.
4. Zum Erklären kann vorübergehend `previous.push(id)` eingegeben werden: TypeScript meldet wegen `readonly` einen Fehler. Diesen absichtlich falschen Aufruf anschließend entfernen.

Es wurden keine automatisierten Tests ergänzt. Gemeinsames Bookmark-Ownership und Persistenz bleiben für spätere Demos offen.

## Demo 4 — Abgeleitete Werte statt zusätzlichem State

### Schritt 1: Filter und Sortierung aktivieren

In `EvidencePage.tsx` speichern wir nur die Benutzerauswahl: `search` sowie `filters` mit Typ, Person, Ort, Status, Relevanz und Sortierung. Alle Steuerelemente sind kontrolliert. Personen und Orte werden über IDs gefiltert. Typ, Status und Relevanz werden beim Vergleichen kleingeschrieben, damit beispielsweise `Test-Report` und `test-report` zusammenpassen.

Bei jedem Rendern wird `results` aus `data.evidence` und der aktuellen Auswahl neu berechnet. Es gibt keinen `useState` für `results`. Alle Filter werden mit UND kombiniert. Sortiert werden kann nach Titel oder Zeit auf-/absteigend. Clear filters setzt Suche, alle Filter und Sortierung zurück. Der Reducer-Umbau folgt erst in Demo 7.

### Schritt 2: Die vollständige Liste schützen

`data.evidence.filter(...)` erzeugt immer ein neues Array, selbst ohne aktive Filter. Nur dieses neue Array wird mit `results.sort(...)` sortiert. Die Evidence-Objekte selbst werden beim Vergleichen nicht verändert. Bei Original order wird nicht sortiert; die Reihenfolge stammt wieder aus der unveränderten vollständigen Liste.

### Schritt 3: Bookmark-Zähler und Liste aus derselben Quelle berechnen

Der lokale Bookmark-State wurde aus `EvidencePage` entfernt. Die einzige Quelle ist jetzt `data.bookmarks` im bestehenden `useState` von `App`. `toggleBookmark` in `App.tsx` erstellt bei jedem Toggle ein neues Bookmark-Array und ein neues Datenobjekt. Über `onToggleBookmark` kann die Evidence-Seite die Änderung auslösen.

Die vorhandenen Ableitungen verwenden damit dieselbe aktuelle Quelle:

- Dashboard: `data.bookmarks.length`, als Prop an `DashboardStatistics` übergeben. Kein eigener State für den Zähler.
- Workspace: `data.evidence.filter((item) => data.bookmarks.includes(item.id))`. Kein eigener State für die Bookmark-Liste.
- Evidence: Der Stern wird aus `data.bookmarks.includes(item.id)` bestimmt.

Diese Verbindung ist notwendig, um Demo 4 vollständig zu erfüllen, und nimmt das State-Lifting aus Demo 5 sowie einen Bookmark-Callback aus Demo 6 bereits vorweg. Die Beschreibung von lokalem Bookmark-State in Demo 1–3 dokumentiert deren damaligen Zwischenstand. Bookmark-Persistenz wurde in diesem Schritt nicht ergänzt: Navigation erhält den State, ein vollständiges Neuladen lädt wieder die zuvor gespeicherten Bookmarks.

### Frage 1: Was gehört in State, was wird berechnet?

**Regel:** Was sich vollständig aus vorhandenen Props und State berechnen lässt, wird beim Rendern berechnet. Eigenständige Informationen wie eine Benutzereingabe gehören in State.

**React:** Suchtext und Filterauswahl sind State, weil der Benutzer sie unabhängig ändert. Die Ergebnisliste ist dagegen vollständig durch die Evidence-Daten und diese Auswahl festgelegt. Deshalb ist sie eine normale berechnete Variable. `useMemo` könnte bei einer teuren Berechnung die Ergebnisse zwischenspeichern, wäre aber hier für die Korrektheit nicht nötig und kein zusätzlicher fachlicher State.

**Vanilla JS:** Eine separate Variable `filteredEvidence` musste bei jeder relevanten Änderung aktualisiert und anschließend die Ansicht neu aufgebaut werden. Wurde ein Aktualisierungsschritt vergessen, konnte sie veraltet sein.

**Unterschied:** React berechnet die Liste bei jedem Rendern aus den aktuellen Eingaben. Eine separat gespeicherte Ergebnisliste müsste zusätzlich synchron gehalten werden und bietet hier keinen Nutzen.

### Frage 2: Warum verhindern diese Ableitungen beide früheren Fehlerklassen?

**Veralteter Dashboard-Zähler:** In Vanilla wurde das Dashboard nur beim ersten Besuch aufgebaut. Spätere Bookmark-Änderungen waren deshalb nicht zwangsläufig sichtbar. Jetzt ändert `App` den gemeinsamen State. Das Dashboard berechnet beim nächsten Rendern `data.bookmarks.length` aus genau diesem State. Es gibt keinen separat gespeicherten Zähler und keine Logik, die nur beim ersten Besuch zählt. Ein Auseinanderlaufen zweier gespeicherter Werte ist damit ausgeschlossen.

**Gemeinsame Array-Referenz beim Sortieren:** In Vanilla konnten `filteredEvidence` und die vollständige Liste dasselbe Array sein. `sort()` veränderte dann auch die vollständige Liste. In unserer konkreten React-Implementierung wird `results` immer durch `filter()` neu erzeugt. Deshalb kann `results.sort()` die Reihenfolge von `data.evidence` nicht ändern. Wichtig: Allein das Wort „abgeleitet“ schützt nicht vor Mutation. Erst die neue Array-Referenz und der Verzicht auf Mutation der ursprünglichen Daten verhindern diesen Fehler.

**Unterschied:** React übernimmt weder Kopieren noch korrekte State-Modellierung automatisch. Unser Aufbau verhindert die Fehler, weil es nur eine Bookmark-Quelle gibt und das Sortieren ausschließlich auf einem neu erstellten Array erfolgt.

### Live vorführen

1. Originalreihenfolge merken, nach Titel und anschließend nach Datum sortieren. Original order wählen: Die ursprüngliche Reihenfolge ist wieder da.
2. Suche und mehrere Filter kombinieren. Nur Items, die alle Bedingungen erfüllen, bleiben sichtbar.
3. Eine Kombination ohne Treffer wählen; danach Clear filters drücken. Alle Evidence-Items erscheinen wieder in Originalreihenfolge.
4. Einen Stern setzen und zum Dashboard wechseln: Der Bookmark-Zähler steigt um eins.
5. Workspace öffnen: Genau dieses Item erscheint in der Bookmark-Liste.
6. Den Stern wieder entfernen und beide Ansichten erneut besuchen: Zähler und Liste passen wieder zusammen.

Self-Check erst nach eigener erfolgreicher Vorführung abhaken. Es wurden keine automatisierten Tests ergänzt.

## Demo 5 — State zum nächsten gemeinsamen Owner anheben

### Umsetzung und Stellen im Code

Die funktionale Änderung war bereits in Demo 4 notwendig, damit alle Bookmark-Ableitungen dieselbe Quelle verwenden. Demo 5 dokumentiert und erklärt diesen vorhandenen Aufbau; es wird kein zweiter Bookmark-State angelegt.

1. **Gemeinsamen Owner finden:** `App` rendert die Routen für `EvidencePage`, `Dashboard` und `WorkspacePage`. Keine dieser drei Ansichten ist Elternkomponente der anderen. `App` ist damit in unserem eigenen Komponentenbaum der nächste gemeinsame Owner.
2. **State dort halten:** In `src/app/App.tsx` erstellt `const [data, setData] = useState<DashboardData | null>(null)` den State. Die Bookmarks sind darin `data.bookmarks`, kein separater Hook. Nach dem Laden setzt `setData(loadedData)` die Anfangswerte.
3. **Änderung dort ausführen:** `toggleBookmark` in `App` ruft `setData((previous) => ...)` auf. Es erzeugt ein neues Bookmark-Array und gibt `{ ...previous, bookmarks }` zurück. Alle anderen Daten bleiben erhalten.
4. **Nach unten reichen:** `App` übergibt `data={data}` an alle drei Ansichten. Evidence erhält zusätzlich `onToggleBookmark={toggleBookmark}`. Beim Klick ruft der Button `onToggleBookmark(item.id)` auf.
5. **Nur ableiten:** Evidence liest `data.bookmarks`, Dashboard verwendet deren Länge und Workspace filtert die Evidence-Liste nach diesen IDs. Keine Ansicht hält eine eigene Bookmark-Kopie als State.

### Frage 1: Was bedeutet „lifting state up“ mechanisch?

**Vorher:** In Demo 3 lag `useState<readonly string[]>(...)` innerhalb von `EvidencePage`. Nur diese Ansicht konnte ihre Bookmark-Änderungen sehen. Dashboard und Workspace lasen weiterhin die Anfangswerte aus `App`. Beim Verlassen der Evidence-Route wurde deren lokaler State außerdem verworfen.

**Jetzt:** Der lokale Bookmark-Hook wurde entfernt. Wir nutzen `data.bookmarks` im bereits vorhandenen State von `App`. Auch die Toggle-Funktion wurde nach `App` verschoben. Daten fließen über Props nach unten; der Button ruft einen Callback auf, damit der Owner den State aktualisiert.

**Unterschied zu Vanilla JS:** Dort lag der Zustand im importierten veränderlichen `state`-Objekt; anschließend musste die passende Ansicht manuell neu gerendert werden. Jetzt besitzt eine React-Komponente den State und aktualisiert ihn über ihren Setter. React rendert mit den geänderten Props.

### Frage 2: Was wäre bei eigenem Bookmark-State pro Ansicht falsch?

Beispiel: Alle drei Ansichten starten mit `["E01"]`. Du setzt in Evidence zusätzlich `E02`. Dann enthält nur deren lokaler State `["E01", "E02"]`. Der Dashboard-State enthält weiterhin `["E01"]` und zeigt 1 statt 2. Auch die Workspace-Kopie kennt `E02` nicht.

Ein State-Initializer wie `useState(data.bookmarks)` hält keine automatische Verbindung zu späteren Prop-Änderungen. Er setzt nur den Anfangswert. Man müsste die drei Kopien zusätzlich synchronisieren und könnte dabei Aktualisierungen vergessen. Beim Aushängen einer Route könnte lokaler, ungespeicherter State zudem verloren gehen.

Mit einem gemeinsamen Owner gibt es nur eine maßgebliche Bookmark-Liste. Daher müssen die Ansichten keine eigenen Listen miteinander abgleichen. `App` bleibt während der Navigation bestehen; beim erneuten Rendern liest das Dashboard die aktuelle Anzahl.

### Live prüfen: Evidence → Dashboard → Workspace

1. Dashboard öffnen und Bookmark-Anzahl merken.
2. In Evidence ein bisher nicht markiertes Item bookmarken.
3. Über die Navigation zum Dashboard wechseln, ohne die Seite neu zu laden: Die Anzahl muss um eins steigen.
4. Workspace öffnen: Das Item muss in der Liste stehen.
5. In Evidence den Bookmark entfernen und erneut beide Ansichten öffnen: Anzahl und Liste müssen entsprechend zurückgehen.

Die gemeinsame Quelle und die Prop-Verbindungen wurden im Code geprüft. Die Browser-Demonstration ist damit nicht als durchgeführt behauptet; das Self-Check-Kästchen bleibt bis zur eigenen Vorführung offen. Demo 5 ergänzt die Dokumentation in dieser Datei und in `ARCHITECTURE-md`; eine erneute Änderung der bereits in Demo 4 implementierten Logik ist nicht nötig.

## Demo 6 — Callbacks nach unten weitergeben

### Schritt 1: Bookmark-Callback prüfen

In `App.tsx` definiert `toggleBookmark` die Änderung und ruft den State-Setter `setData` auf. `App` gibt diese Funktion mit `onToggleBookmark={toggleBookmark}` an `EvidencePage` weiter. Der Stern-Button ruft `onToggleBookmark(item.id)` auf. Dieser Weg bestand bereits seit Demo 4. Dashboard und Workspace benötigen keinen Toggle-Callback, weil sie Bookmarks derzeit nur anzeigen.

### Schritt 2: Zweite Interaktion hinzufügen: Review-Status

In `App.tsx` ist `changeEvidenceStatus(id, status)` neu. Die Funktion aktualisiert mit `setData` das Evidence-Array: `map` erstellt ein neues Array, `{ ...item, status }` ein neues Objekt für das betroffene Item. Die anderen Items werden unverändert übernommen.

`App` übergibt `onChangeStatus={changeEvidenceStatus}` an `EvidencePage`. Im Evidence-Detail steht jetzt ein kontrolliertes Select für unreviewed, reviewed und flagged. Sein `onChange` ruft `onChangeStatus(selected.id, event.currentTarget.value)` auf. Die Ansicht verändert weder `selected.status` direkt noch besitzt sie einen zweiten Status-State.

Nach dem Update erhält Evidence die neuen Props. Der Detailwert und die Karte zeigen denselben Status; ein aktiver Statusfilter wird neu ausgewertet. Das Dashboard berechnet Reviewed-Anzahl und Fortschritt aus dem aktualisierten Evidence-Array. Statusänderungen bleiben beim Navigieren erhalten; beim vollständigen Neuladen werden wieder die JSON-Daten geladen. Status-Persistenz wurde nicht ergänzt.

### Frage 1: Warum soll ein Kind den State des Vorfahren nicht direkt verändern?

**React:** Der Hook-State gehört der Komponente, die `useState` aufruft. Ein Kind kann deren lokale Variable nicht einfach direkt ansprechen. Auch wenn es über Props eine Objekt-Referenz erhält, darf es diese nicht verändern: `selected.status = "reviewed"` würde bestehende Daten mutieren und keinen State-Setter aufrufen. React könnte die Anzeige deshalb unverändert lassen, während andere Stellen bereits mutierte Daten sehen.

Der Callback gibt dem Kind stattdessen eine erlaubte Aktion: „Ändere den Status dieser ID“. Der Owner entscheidet, wie er den State aktualisiert. So bleibt die Update-Logik an einer Stelle, nutzt den Setter und erstellt neue Referenzen. Das Kind braucht den Aufbau des gesamten App-States nicht zu kennen.

**Vanilla JS:** Funktionen konnten das importierte gemeinsame `state`-Objekt unmittelbar verändern und danach manuell rendern. In React ersetzt die Meldung per Callback diesen direkten Zugriff; der Owner aktualisiert den State, React aktualisiert daraus die Ansicht.

### Frage 2: Einen Callback vollständig verfolgen — wie viele Ebenen?

Beispiel Review-Status:

1. **Definition in `App`:** `changeEvidenceStatus` enthält `setData((previous) => ...)`.
2. **Übergabe:** `<EvidencePage onChangeStatus={changeEvidenceStatus} ... />`.
3. **Empfang in `EvidencePage`:** `onChangeStatus` wird aus den Props entnommen.
4. **Aufruf:** Der Select-Handler ruft `onChangeStatus(selected.id, event.currentTarget.value)` auf.
5. **Update:** Die Funktion in `App` läuft und aktualisiert den State. Neue Props fließen wieder nach unten.

Der Callback überquert **eine eigene Komponentengrenze: `App → EvidencePage`**. Das Select steht direkt im JSX von `EvidencePage`; ein DOM-Element ist keine weitere eigene Komponentenebene. Auch die Router-Komponenten reichen diesen Callback nicht selbst als fachliche Props durch.

Das ist für diese App noch überschaubar. Es gibt keine lange Kette von Zwischenkomponenten, die den Callback nur weiterreichen. Prop Drilling ist hier deshalb aktuell kein ernstes Problem. Context wäre eher hilfreich, wenn viele weit entfernte Komponenten dieselben Daten/Aktionen benötigen und mehrere Zwischenkomponenten sie ausschließlich durchreichen. Demo 8 wird Context trotzdem als Übung umsetzen.

### Live vorführen

1. Einen Bookmark setzen und im Dashboard bzw. Workspace die gemeinsame Änderung prüfen.
2. In Evidence Details eines unreviewed Items öffnen und Review status auf Reviewed ändern.
3. Prüfen: Select und Karte zeigen Reviewed. Dashboard zeigt einen zusätzlichen Reviewed-Eintrag und berechnet den Fortschritt neu.
4. Zurückkehren und auf Flagged ändern: Karte und Dashboard passen sich entsprechend an.
5. Optional Statusfilter auf Unreviewed stellen und ein angezeigtes Item in den Details auf Reviewed ändern: Es verschwindet aus der Ergebnisliste. Die offene Detailansicht bleibt absichtlich erhalten, da sie über die ausgewählte ID aus der vollständigen Liste abgeleitet wird.

Die Browser-Vorführung ist noch offen. Self-Check erst nach eigener Demonstration abhaken.

## Demo 7 — useReducer für Suche, Filter und Sortierung

### Schritt 1: Eine gemeinsame State-Domäne bilden

In `src/features/evidence/filterReducer.ts` beschreibt `EvidenceFilters` alle sieben Werte: search, type, person, location, status, relevance und sort. `initialFilters` definiert ihre Anfangswerte.

In `EvidencePage.tsx` ersetzt `const [filters, dispatch] = useReducer(filterReducer, initialFilters)` die bisherigen zwei State-Hooks für Suche und Filterobjekt. Der State für ausgewählte Evidence und die Notiz bleibt davon unabhängig. Die Ergebnisliste wird weiterhin beim Rendern abgeleitet, nicht im Reducer gespeichert.

### Schritt 2: Aktionen senden statt Setter aufrufen

```tsx
// Suchtext oder einen Filter ändern:
dispatch({ type: "SET_FILTER", field: "search", value: "robot" });

// Sortierung ändern:
dispatch({ type: "SET_SORT", value: "title" });

// Alles zurücksetzen:
dispatch({ type: "CLEAR_FILTERS" });
```

`dispatch` übermittelt die Aktion an React. React ruft den Reducer mit dem aktuellen State und dieser Aktion auf. Der Reducer gibt den nächsten State zurück; die Komponente rendert mit ihm erneut. Die Eingabeelemente bleiben kontrolliert, beispielsweise durch `value={filters.search}`. Der Reducer verändert keine bisherigen Objekte und führt weder Speicherung noch DOM-Zugriffe aus.

### Frage 1: Warum passt useReducer hier besser als viele useState-Aufrufe?

Die sieben Werte beschreiben gemeinsam, welche Evidence angezeigt wird. Sie lassen sich einzeln ändern, müssen beim Reset aber gemeinsam auf die definierten Anfangswerte zurückkehren. Ein Reducer bündelt diese Änderungsregeln an einer Stelle. Die Handler in der Oberfläche melden nur noch, was passiert ist.

Konkret war unser vorheriger Stand bereits überschaubar: ein State für Suche und ein gemeinsames Filterobjekt. Der neue Vorteil ist daher vor allem die einheitliche Behandlung aller sieben Werte sowie die ausdrückliche Trennung zwischen UI-Events und Update-Logik. useState wäre weiterhin korrekt; useReducer ist hier eine Strukturierungsentscheidung und kein notwendiger Performance-Trick.

### Frage 2: Wie funktioniert CLEAR_FILTERS und warum ist das einfacher?

```tsx
case "CLEAR_FILTERS":
  return { ...initialFilters };
```

Ein Dispatch setzt Suche, fünf Filter und Sortierung zurück. Der Reducer erzeugt ein neues Objekt aus den zentral definierten Anfangswerten. Die Oberfläche muss keine Liste einzelner Setter-Aufrufe kennen und kann nicht beispielsweise die Suche oder Sortierung beim Reset vergessen.

Auch mehrere useState-Updates in einem Event kann React bündeln. Der Vorteil des Reducers ist hier die zentrale, vollständige Reset-Regel, nicht die Behauptung, einzelne Setter würden zwangsläufig sichtbare Zwischenzustände erzeugen. Ein neues Filterfeld muss weiterhin korrekt in Typ und Anfangswerten ergänzt werden.

### Frage 3: Ist useReducer grundsätzlich anders als useState?

Beide verwalten React-State und lösen bei einem geänderten State ein erneutes Rendern aus. Beide erlauben unveränderliche Updates. Der Unterschied liegt darin, wie wir die Änderung ausdrücken:

- `useState`: Wir übergeben den nächsten Wert oder eine Funktion, die ihn aus dem vorherigen Wert berechnet.
- `useReducer`: Wir übergeben eine Aktion. Eine zentrale Reducer-Funktion berechnet daraus und aus dem vorherigen State den nächsten Wert.

Konzeptionell lässt sich useState als einfacher Spezialfall derselben Idee verstehen: Die Aktion ist der neue Wert oder die Update-Funktion; ein einfacher Reducer übernimmt den Wert bzw. wendet die Funktion an. Das erklärt die Verwandtschaft der Modelle, ohne eine bestimmte interne Implementierung von React vorauszusetzen.

Bei unserem Hypothesenformular aus Demo 2 bleibt useState passend: Dort aktualisieren wir im Wesentlichen Felder und speichern das Objekt. Bei den Evidence-Filtern dokumentieren benannte Aktionen zusätzlich die zusammenhängenden Regeln wie Sortieren und vollständiges Zurücksetzen.

### Live vorführen

1. Suchtext eingeben: `SET_FILTER` ändert `filters.search` und die Ergebnisliste reagiert.
2. Mehrere Filter wählen: Andere ausgewählte Werte bleiben jeweils erhalten.
3. Sortierung wählen: `SET_SORT` verändert nur die Sortierung.
4. Clear filters klicken: Alle sieben Werte kehren zu den Anfangswerten zurück; die vollständige Liste erscheint in Originalreihenfolge.
5. Im Code die drei switch-Fälle in `filterReducer.ts` und die zugehörigen Dispatch-Aufrufe in `EvidencePage.tsx` zeigen.

Die Browser-Vorführung bleibt zur eigenen Prüfung offen. Es wurden keine automatisierten Tests ergänzt.
