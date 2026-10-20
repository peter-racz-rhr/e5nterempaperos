// A szerkesztő összeállítása (index.html) és az összes kártya PDF-be mentése.
//   node forras/epit.js            -> index.html + kartyak.pdf + ajtolapok.pdf
// A terembeosztás és a sávok ideje a terembeosztas.json-ban van (előadás-id -> terem).
//   node forras/epit.js --frissit  -> előbb újra letölti az adatokat az oldalról
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const GYOKER = path.join(__dirname, '..');
const API = 'https://e5vosdo.hu/api/presentations';

async function main() {
  if (process.argv.includes('--frissit')) {
    for (const [vegpont, fajl] of [['getPresentations', 'eloadasok.json'], ['getPresentationSlots', 'savok.json']]) {
      const res = await fetch(`${API}/${vegpont}`);
      if (!res.ok) throw new Error(`${vegpont}: HTTP ${res.status}`);
      fs.writeFileSync(path.join(GYOKER, fajl), JSON.stringify(await res.json(), null, 1));
    }
    fs.writeFileSync(path.join(GYOKER, 'adatok-datuma.txt'), new Date().toISOString().slice(0, 10).replace(/-/g, '.') + '\n');
  }
  const eloadasok = fs.readFileSync(path.join(GYOKER, 'eloadasok.json'), 'utf8');
  const savok = fs.readFileSync(path.join(GYOKER, 'savok.json'), 'utf8');
  const html = fs.readFileSync(path.join(__dirname, 'szerkeszto.html'), 'utf8')
    .replace('/*ELOADASOK*/[]', () => JSON.stringify(JSON.parse(eloadasok)))
    .replace('/*SAVOK*/[]', () => JSON.stringify(JSON.parse(savok)))
    .replace('/*BEOSZTAS*/{ idopontok: {}, termek: {} }', () => {
      const f = path.join(GYOKER, 'terembeosztas.json');
      return fs.existsSync(f) ? JSON.stringify(JSON.parse(fs.readFileSync(f, 'utf8'))) : '{ "idopontok": {}, "termek": {} }';
    })
    .replace('/*DATUM*/', () => fs.readFileSync(path.join(GYOKER, 'adatok-datuma.txt'), 'utf8').trim());
  const kimenet = path.join(GYOKER, 'index.html');
  fs.writeFileSync(kimenet, html);
  console.log('Kész:', kimenet);

  const bongeszo = await chromium.launch();
  const oldal = await bongeszo.newPage();
  const hibak = [];
  oldal.on('pageerror', (e) => hibak.push(e.message));
  await oldal.goto('file://' + kimenet);
  await oldal.emulateMedia({ media: 'print' });
  for (const [mit, fajl] of [['kartyak', 'kartyak.pdf'], ['mind', 'ajtolapok.pdf']]) {
    const db = await oldal.evaluate((m) => window.nyomtatasEpit(m), mit);
    const pdf = path.join(GYOKER, fajl);
    await oldal.pdf({ path: pdf, format: 'A4', landscape: true, printBackground: true, preferCSSPageSize: true });
    console.log(`Kész: ${pdf} (${db} oldal)`);
  }
  const utkozesek = await oldal.evaluate(() => window.UTKOZESEK);
  if (utkozesek.length) console.warn('Ütközés, kimaradt:', utkozesek);
  if (hibak.length) console.error('Hibák az oldalon:', hibak);
  await bongeszo.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
