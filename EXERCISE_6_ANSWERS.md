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
