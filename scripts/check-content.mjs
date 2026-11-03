// Валидатор контент-паков «Руководства».
//
//   npm run content:check
//
// Проверяет, что:
//  • id процедур и шагов не дублируются;
//  • каждый шаг ссылается на существующую схему, предупреждение и деталь;
//  • у каждой процедуры есть шаги, заголовок и система;
//  • нет «висячих» схем, на которые никто не ссылается;
//  • в текстах шагов не появляются единицы момента/объёма с числами:
//    такие значения разрешены только из PDF, а не из контент-пака.
//
// Скрипт запускается Node напрямую (type stripping), без сборки.

import {PACKS, ALL_MODELS, universalProcedures} from '../src/manuals/index.ts';
import {DIAGRAMS} from '../src/manuals/diagramSpecs.ts';

const errors = [];
const warnings = [];
const usedDiagrams = new Set();
const seenProcedureIds = new Map();
const seenStepIds = new Map();

/** Число + единица измерения, которых не должно быть в авторском тексте. */
const FORBIDDEN = [
  /\b\d+(?:[.,]\d+)?\s*Н\s*[·*x×]\s*м\b/gi,
  /\b\d+(?:[.,]\d+)?\s*Нм\b/gi,
  /\b\d+(?:[.,]\d+)?\s*(?:л|литр(?:а|ов)?)\b/gi,
  /\b\d+(?:[.,]\d+)?\s*(?:мл|ml)\b/gi,
  /\b\d+(?:[.,]\d+)?\s*бар\b/gi,
  /\b\d+(?:[.,]\d+)?\s*(?:А|A)\b(?!\p{L})/gu,
  /\b\d+(?:[.,]\d+)?\s*(?:Вт|W)\b/gi,
];

function checkText(where, text) {
  for (const re of FORBIDDEN) {
    const m = text.match(re);
    if (m) warnings.push(`${where}: похоже на числовую спецификацию «${m[0]}» — такие значения должны приходить из PDF, а не из контент-пака`);
  }
}

function checkProcedure(modelId, p, indexInModel) {
  const where = `${modelId}/${p.id}`;
  if (!p.id) errors.push(`${modelId}: у процедуры №${indexInModel + 1} нет id`);
  if (!p.title) errors.push(`${where}: нет заголовка`);
  if (!p.system) errors.push(`${where}: нет системы`);
  if (!p.intro) errors.push(`${where}: нет вступления`);
  if (!p.steps?.length) errors.push(`${where}: нет шагов`);

  if (seenProcedureIds.has(p.id)) {
    errors.push(`${where}: id процедуры уже используется в ${seenProcedureIds.get(p.id)}`);
  } else {
    seenProcedureIds.set(p.id, where);
  }

  const warnIds = new Set((p.warnings || []).map(w => w.id));
  const specIds = new Set();
  const partNames = new Set((p.parts || []).map(x => x.name));

  (p.steps || []).forEach((s, i) => {
    const sw = `${where}#${s.id || i + 1}`;
    if (!s.id) errors.push(`${sw}: у шага нет id`);
    if (!s.title) errors.push(`${sw}: нет заголовка`);
    if (!s.body) errors.push(`${sw}: нет текста`);
    if (seenStepIds.has(s.id)) errors.push(`${sw}: id шага уже используется в ${seenStepIds.get(s.id)}`);
    else seenStepIds.set(s.id, sw);

    for (const d of s.diagrams || []) {
      usedDiagrams.add(d);
      if (!DIAGRAMS[d]) errors.push(`${sw}: схема «${d}» не найдена в diagramSpecs.ts`);
    }
    for (const w of s.warnings || []) {
      if (!warnIds.has(w)) errors.push(`${sw}: предупреждение «${w}» не объявлено в warnings процедуры`);
    }
    for (const sp of s.specs || []) {
      if (specIds.has(sp)) errors.push(`${sw}: спецификация «${sp}» объявлена дважды`);
      specIds.add(sp);
    }
    for (const part of s.parts || []) {
      if (!partNames.has(part.name)) warnings.push(`${sw}: деталь «${part.name}» не указана в parts процедуры`);
    }
    checkText(sw, `${s.title} ${s.body}`);
  });

  for (const w of p.warnings || []) checkText(`${where}/warning`, w.text);
  checkText(`${where}/intro`, p.intro);
  for (const c of p.codes || []) checkText(`${where}/code ${c.code}`, `${c.meaning} ${c.likely}`);
}

for (const pack of PACKS) {
  if (!pack.make) errors.push('Пакет без make');
  for (const m of pack.models) {
    if (!m.id) errors.push(`${pack.make}: модель без id`);
    if (!m.procedures?.length) errors.push(`${m.id}: у модели нет процедур`);
    m.procedures.forEach((p, i) => checkProcedure(m.id, p, i));
  }
}

// Универсальные памятки показываются для любой марки — проверяем так же строго
universalProcedures.forEach((p, i) => checkProcedure('universal', p, i));

// Уникальность id моделей
const modelIds = new Set();
for (const m of ALL_MODELS) {
  if (modelIds.has(m.id)) errors.push(`Повторяющийся id модели: ${m.id}`);
  modelIds.add(m.id);
}

// ── Геометрия схем ──────────────────────────────────────────────────────────
// Схемы рисуются по сетке; здесь проверяем, что ничего не выезжает за холст
// и что все связи ссылаются на существующие узлы.
const W = 700, COL = 224, PADL = 26, PADT = 30, ROW = 66;
for (const [id, spec] of Object.entries(DIAGRAMS)) {
  if (spec.kind === 'schematic') {
    const ids = new Set(spec.nodes.map(n => n.id));
    const cells = new Map();
    for (const n of spec.nodes) {
      const cell = n.at.join(':');
      if (cells.has(cell)) errors.push(`Схема «${id}»: узлы ${cells.get(cell)} и ${n.id} в одной ячейке сетки`);
      cells.set(cell, n.id);
    }
    for (const n of spec.nodes) {
      const [c, r] = n.at;
      if (c < 0 || c > 2) errors.push(`Схема «${id}»: узел ${n.id} в колонке ${c} (допустимо 0..2)`);
      if (r < 0 || r > 6) errors.push(`Схема «${id}»: узел ${n.id} в строке ${r}`);
      const right = PADL + c * COL + (COL - 26);
      if (right > W) errors.push(`Схема «${id}»: узел ${n.id} выходит за правый край (${right} > ${W})`);
      if ((n.label || '').length > 24) warnings.push(`Схема «${id}»: длинная подпись узла «${n.label}»`);
    }
    for (const w of spec.wires) {
      if (!ids.has(w.from)) errors.push(`Схема «${id}»: связь из неизвестного узла «${w.from}»`);
      if (!ids.has(w.to)) errors.push(`Схема «${id}»: связь в неизвестный узел «${w.to}»`);
    }
  }
  if (spec.kind === 'part') {
    const W2 = 700, H2 = 380;
    for (const p of spec.parts) {
      if (p.x < 150 || p.x > 450 || p.y < 70 || p.y > 310) errors.push(`Схема «${id}»: выноска ${p.n} вне зоны компонента`);
      if ((p.label || '').length > 30) warnings.push(`Схема «${id}»: длинная подпись выноски «${p.label}»`);
      const ly = 46 + (p.n - 1) * 46;
      if (ly > H2 - 10) errors.push(`Схема «${id}»: подпись выноски ${p.n} выходит за нижний край`);
      if (p.x > W2 || p.y > H2) errors.push(`Схема «${id}»: выноска ${p.n} вне холста`);
    }
  }
  if (spec.kind === 'flow') {
    for (const s of spec.steps) {
      if (s.text.length > 150) warnings.push(`Схема «${id}»: слишком длинный шаг схемы`);
    }
  }
  if (spec.kind === 'torque' && (spec.count < 2 || spec.count > 12)) {
    errors.push(`Схема «${id}»: число болтов ${spec.count} вне разумного диапазона`);
  }
}

// Неиспользуемые схемы — не ошибка, но повод почистить
for (const id of Object.keys(DIAGRAMS)) {
  if (!usedDiagrams.has(id)) warnings.push(`Схема «${id}» нигде не используется`);
}

const procCount = ALL_MODELS.reduce((n, m) => n + m.procedures.length, 0) + universalProcedures.length;
const stepCount = ALL_MODELS.reduce((n, m) => n + m.procedures.reduce((k, p) => k + p.steps.length, 0), 0) + universalProcedures.reduce((k, p) => k + p.steps.length, 0);

console.log(`Пакетов: ${PACKS.length}, моделей: ${ALL_MODELS.length}, процедур: ${procCount}, шагов: ${stepCount}, схем: ${Object.keys(DIAGRAMS).length}`);

if (warnings.length) {
  console.log(`\nПредупреждения (${warnings.length}):`);
  for (const w of warnings) console.log('  • ' + w);
}

if (errors.length) {
  console.error(`\nОшибки (${errors.length}):`);
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}

console.log('\nКонтент-паки корректны.');
