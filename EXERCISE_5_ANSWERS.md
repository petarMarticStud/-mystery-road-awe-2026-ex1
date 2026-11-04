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

Filter/Sortierung und Hypothesenformular sind als noch nicht verdrahtete Bereiche deaktiviert. Demo 2 steuert das Hypothesenformular; die folgenden Demos ergänzen Filter und gemeinsamen State. Bookmarks sind aktuell nur in `EvidencePage` lokal und noch nicht persistent oder mit Dashboard/Workspace synchronisiert. Demo 5 hebt ihren State an den gemeinsamen Owner. Die Suche ist bereits kontrolliert, weil dies unmittelbar zur migrierten Suchinteraktion gehört.
