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
