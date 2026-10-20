# E5N ajtólapok

Termenkénti, fekvő A4-es ajtólapok az E5N (Eötvös Napok) előadásaihoz.
Az adatok az [e5vosdo.hu/jelentkezes](https://e5vosdo.hu/jelentkezes) oldalról jönnek.

## Használat

Nyisd meg az oldalt (GitHub Pages), vagy töltsd le az `index.html`-t és nyisd meg Chrome-ban.

1. Fent írd be a sávok idejét.
2. A lap tetején add meg a terem nevét. Új teremhez: **+ Új terem**.
3. Bal oldalt válaszd ki a sávot, és kattints egy előadásra (vagy húzd a lapra).
   Egy előadás csak egy teremben lehet; a dupla előadás két része együtt mozog.
4. **Ez a lap nyomtatása** / **Összes terem nyomtatása**. A nyomtatási ablakban:
   fekvő tájolás, margó: nincs.

A beosztást a böngésző megjegyzi, de csak abban a böngészőben. Másnak átadni a
**Beosztás mentése fájlba** / **Betöltés fájlból** gombokkal lehet.

Az `ajtolapok.pdf` az összes terem ajtólapja egy fájlban, a `terembeosztas.json` alapján
(sávok ideje és előadás-id → terem). A `kartyak.pdf` az összes előadás kártyáját
tartalmazza, laponként hármat.

## Frissítés

Egy GitHub Action naponta letölti az új adatokat, és ha változott valami,
újraépíti az oldalt és a PDF-et. Kézzel: **Actions → Adatok frissítése → Run workflow**.

Helyben:

```sh
npm install --no-save playwright
node forras/epit.js --frissit
```

## Fájlok

- `forras/szerkeszto.html` – a szerkesztő forrása (ezt kell szerkeszteni, nem az `index.html`-t)
- `forras/epit.js` – az adatok letöltése, az `index.html` és a `kartyak.pdf` összeállítása
- `terembeosztas.json` – terembeosztás és a sávok ideje (kézzel karbantartva)
- `eloadasok.json`, `savok.json`, `adatok-datuma.txt` – a letöltött adatok
