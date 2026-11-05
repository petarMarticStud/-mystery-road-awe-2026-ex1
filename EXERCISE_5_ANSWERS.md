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
