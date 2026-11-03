#!/usr/bin/env node
// Массовый импорт руководств из локальной папки.
//
//   node scripts/import-sources.mjs "D:\Manuals" [--dry-run] [--url http://localhost:3001]
//
// Что делает:
//  • рекурсивно находит *.pdf;
//  • определяет марку/модель/год по имени файла («Kia Ceed 2019.pdf»);
//  • находит автомобиль в базе или создаёт его;
//  • загружает PDF через API, где он разбирается постранично и индексируется.
//
// Загружайте только те документы, на которые у вас есть право: купленные
// подписки (erWin, TIS и т. п.), официальные руководства владельца, свои сканы.
// Скрипт ничего не скачивает из интернета — источник файлов выбираете вы.

import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';
import {CATALOG} from '../src/manuals/index.ts';

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const urlIndex = argv.indexOf('--url');
const base = urlIndex >= 0 ? argv[urlIndex + 1] : (process.env.API_URL || 'http://localhost:3001');
const positional = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--url');

if (!positional[0]) {
  console.error('Укажите папку с PDF: node scripts/import-sources.mjs "D:\\Manuals" [--dry-run]');
  process.exit(1);
}

const folder = path.resolve(positional[0]);
if (!fs.existsSync(folder)) {
  console.error(`Папка не найдена: ${folder}`);
  process.exit(1);
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.pdf$/i.test(entry.name)) out.push(full);
  }
  return out;
}

const squash = s => ' ' + s.toLowerCase().replace(/[_\-–—|.,()[\]{}+]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';

/** Определяет марку/модель/год по имени файла. */
function parseName(file) {
  const raw = path.basename(file, path.extname(file));
  const hay = squash(raw);

  const years = raw.match(/\b(19[89]\d|20[0-4]\d)\b/g) || [];
  const year = years.length ? Number(years[years.length - 1]) : null;

  let best = null;
  for (const entry of CATALOG) {
    const make = squash(entry.make).trim();
    if (!hay.includes(' ' + make)) continue;

    const names = [entry.model, ...(entry.aliases || [])];
    for (const n of names) {
      const needle = squash(n).trim();
      if (!needle || !hay.includes(' ' + needle)) continue;
      const score = make.length * 2 + needle.length;
      if (!best || score > best.score) best = {make: entry.make, model: entry.model, score};
    }
  }

  // Марка найдена, модель нет: если у марки в каталоге одна модель — берём её
  if (!best) {
    for (const make of [...new Set(CATALOG.map(e => e.make))]) {
      if (!hay.includes(' ' + squash(make).trim())) continue;
      const models = CATALOG.filter(e => e.make === make);
      if (models.length === 1) best = {make, model: models[0].model, score: 1};
      break;
    }
  }

  return {make: best?.make || null, model: best?.model || null, year, raw};
}

const api = async (p, opt = {}) => {
  const res = await fetch(base + p, opt);
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status} на ${p}`);
  return data;
};

const login = await api('/api/auth/login', {
  method: 'POST',
  headers: {'content-type': 'application/json'},
  body: JSON.stringify({email: process.env.ADMIN_EMAIL || 'owner@local', password: process.env.ADMIN_PASSWORD}),
});

const auth = {authorization: 'Bearer ' + login.token};
const vehicles = await api('/api/vehicles', {headers: auth});
const byKey = new Map(vehicles.map(v => [`${v.make}|${v.model}`.toLowerCase(), v]));

const files = walk(folder);
if (!files.length) {
  console.error('В папке нет PDF.');
  process.exit(1);
}

console.log(`Найдено PDF: ${files.length}${dryRun ? ' — пробный прогон, без загрузки' : ''}\n`);

let ok = 0, skipped = 0, failed = 0;
const report = [];

for (const file of files) {
  const name = path.basename(file);
  const guess = parseName(file);

  if (!guess.make || !guess.model) {
    skipped++;
    report.push({file: name, status: 'не распознан', note: 'переименуйте как «Марка Модель 2019.pdf»'});
    continue;
  }

  const key = `${guess.make}|${guess.model}`.toLowerCase();
  const known = byKey.get(key);

  if (dryRun) {
    ok++;
    report.push({
      file: name,
      status: known ? 'к существующему' : 'создаст авто',
      note: `${guess.make} ${guess.model}${guess.year ? ' ' + guess.year : ''}`,
    });
    continue;
  }

  try {
    let vehicle = known;
    if (!vehicle) {
      vehicle = await api('/api/vehicles', {
        method: 'POST',
        headers: {...auth, 'content-type': 'application/json'},
        body: JSON.stringify({make: guess.make, model: guess.model, model_year: guess.year}),
      });
      byKey.set(key, vehicle);
    }

    const fd = new FormData();
    fd.append('file', new Blob([fs.readFileSync(file)], {type: 'application/pdf'}), name);
    fd.append('vehicle_id', vehicle.id);
    fd.append('title', guess.raw);
    fd.append('publisher', 'Импорт из папки');
    fd.append('confidence', 'medium');

    const source = await api('/api/sources/upload', {method: 'POST', headers: auth, body: fd});
    ok++;
    report.push({
      file: name, status: 'загружено',
      note: `${guess.make} ${guess.model} · ${source.page_count ?? '?'} стр.`,
    });
  } catch (e) {
    failed++;
    report.push({file: name, status: 'ошибка', note: e.message});
  }
}

const width = Math.min(58, Math.max('файл'.length, ...report.map(r => r.file.length)));
console.log('файл'.padEnd(width) + '  ' + 'статус'.padEnd(16) + 'что сделано');
for (const r of report) console.log(`${r.file.slice(0, width).padEnd(width)}  ${r.status.padEnd(16)} ${r.note}`);

console.log(`\nИтого: загружено ${ok}, пропущено ${skipped}, ошибок ${failed}.`);
if (skipped) console.log('Файлы без распознанной модели переименуйте в формате «Марка Модель Год.pdf».');
process.exit(failed ? 1 : 0);
