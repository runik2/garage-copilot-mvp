// Проверка рендера: собирает все схемы и оба экрана «Руководства» в HTML,
// затем валидирует разметку. Файлы кладутся в public/, чтобы можно было
// открыть превью в браузере без запуска приложения.
//
//   node scripts/render-preview.mjs

import {createServer} from 'vite';
import {writeFileSync, mkdirSync} from 'node:fs';

const server = await createServer({server: {middlewareMode: true}, appType: 'custom', logLevel: 'warn'});
let mod;
try {
  mod = await server.ssrLoadModule('/src/manuals/preview.tsx');
} finally {
  // server оставляем живым до конца проверок, закроем ниже
}

const gallery = mod.renderDiagramGallery();
const screens = mod.renderScreens();

mkdirSync('public/preview', {recursive: true});
writeFileSync('public/preview/diagrams.html', mod.renderPage('Авторские схемы — превью', gallery), 'utf8');
writeFileSync('public/preview/guide-kia.html', mod.renderPage('Руководство: Kia Ceed', screens.kia), 'utf8');
writeFileSync('public/preview/guide-fallback.html', mod.renderPage('Руководство: универсальные памятки', screens.toyota), 'utf8');
writeFileSync('public/preview/spec-cards.html', mod.renderPage('Слоты спецификаций', screens.specCards), 'utf8');

// ── Проверки ────────────────────────────────────────────────────────────────
const problems = [];
const svgs = gallery.match(/<svg[\s\S]*?<\/svg>/g) || [];
const opened = (gallery.match(/<svg/g) || []).length;
if (opened !== svgs.length) problems.push(`Незакрытые <svg>: открыто ${opened}, закрыто ${svgs.length}`);

for (const svg of svgs) {
  if (/NaN|undefined|\[object Object\]/.test(svg)) problems.push('В SVG попали NaN/undefined/[object Object]');
  if (!/viewBox="0 0 \d+(\.\d+)? \d+(\.\d+)?"/.test(svg)) problems.push('У SVG нет корректного viewBox');
  const tags = [...svg.matchAll(/<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g)];
  const stack = [];
  for (const [, close, name, , selfClose] of tags) {
    if (selfClose) continue;
    if (close) {
      if (stack.pop() !== name) { problems.push(`Нарушен порядок тегов в SVG: ${name}`); break; }
    } else stack.push(name);
  }
  if (stack.length) problems.push(`Незакрытые теги в SVG: ${stack.join(',')}`);
}

for (const [name, html] of Object.entries(screens)) {
  if (/NaN|undefined|\[object Object\]/.test(html)) problems.push(`${name}: в разметке NaN/undefined/[object Object]`);
}

const kiaSteps = (screens.kia.match(/class="guide-step"/g) || []).length;
const kiaFigs = (screens.kia.match(/class="diagram-fig"/g) || []).length;
const kiaSpecs = (screens.kia.match(/class="spec-card"/g) || []).length;
const toyotaSteps = (screens.toyota.match(/class="guide-step"/g) || []).length;

if (!kiaSteps) problems.push('Kia: не отрендерился ни один шаг');
if (!kiaFigs) problems.push('Kia: не отрендерилась ни одна схема');
if (!toyotaSteps) problems.push('Fallback: не отрендерились универсальные памятки');
if (!/Руководство по ремонту/.test(screens.kia)) problems.push('Kia: нет заголовка страницы');
if (!/моделей в каталоге/.test(screens.kia)) problems.push('Kia: не показан размер каталога');
if (!/toyota-tech\.eu/.test(screens.toyota)) problems.push('Toyota: нет блока официальных источников');
if (!/class="official"/.test(screens.toyota)) problems.push('Toyota: блок источников не отрендерился');
if (!/Ходовая часть/.test(screens.toyota)) problems.push('Toyota: нет процедур по ходовой части');
const conf = screens.specCards;
if (!/spec-card confirmed/.test(conf)) problems.push('SpecCard: не отрендерилось подтверждённое значение');
if (!/Н·м/.test(conf)) problems.push('SpecCard: потеряно значение с единицей');
if (!/Rukovodstvo Ceed CD\.pdf, стр\. 41/.test(conf)) problems.push('SpecCard: не показана ссылка на источник');
if (!/не придумывает цифры/.test(conf)) problems.push('SpecCard: нет честного состояния «значения нет»');

console.log(`Схем: ${svgs.length}`);
console.log(`Экран Kia: шагов ${kiaSteps}, схем ${kiaFigs}, слотов спецификаций ${kiaSpecs}`);
console.log(`Экран без пакета (Toyota): шагов ${toyotaSteps}`);
console.log('HTML-превью: public/preview/*.html');

await server.close();

if (problems.length) {
  console.error('\nПроблемы:');
  for (const p of [...new Set(problems)]) console.error('  ✗ ' + p);
  process.exit(1);
}
console.log('\nРазметка корректна.');
