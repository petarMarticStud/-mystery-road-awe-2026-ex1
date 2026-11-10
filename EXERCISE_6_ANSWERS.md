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
