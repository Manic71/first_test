# Turnier-App (Vanilla JS + Tailwind, ohne DB)

## Starten
Da die App ES-Module verwendet, bitte **über einen lokalen Webserver** starten (nicht direkt via file://).

Beispiele:
- VS Code: Extension „Live Server“
- Node (falls vorhanden): `npx serve` im Projektordner

## Daten (ohne Datenbank)
- App-State ist im Speicher und zusätzlich (optional) in `localStorage`.
- Vereine/Spielorte können als **.js Module** exportiert und wieder importiert werden.

## Ordnerstruktur
- `src/store.js`: State & Persistenz (localStorage)
- `src/features/*`: Seiten/Logik
- `src/utils/fileio.js`: Import/Export der JS-Dateien