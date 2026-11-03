import type {MakePack, ModelManual, Procedure} from './types.ts';
import {kiaPack} from './kia/content.ts';
import {universalProcedures} from './universal/content.ts';
import {DIAGRAMS} from './diagramSpecs.ts';
import {CATALOG, OFFICIAL_SOURCES, CATALOG_SIZE, type CatalogEntry, type OfficialSource} from './catalog.ts';

export type {MakePack, ModelManual, Procedure} from './types.ts';
export type {CatalogEntry, OfficialSource} from './catalog.ts';
export {DIAGRAMS} from './diagramSpecs.ts';
export {CATALOG, OFFICIAL_SOURCES, CATALOG_SIZE} from './catalog.ts';
export {universalProcedures};

/** Все пакеты с авторским контентом. Новую марку подключайте здесь. */
export const PACKS: MakePack[] = [kiaPack];

const norm = (s: string) => (s || '').toLowerCase().replace(/[\s_.\-/]/g, '');

/** Русские и латинские варианты названий марок. */
const MAKE_ALIASES: Record<string, string> = {
  ваз: 'lada', vaz: 'lada', лада: 'lada',
  бмв: 'bmw', мерседес: 'mercedesbenz', мерс: 'mercedesbenz', mercedes: 'mercedesbenz', mb: 'mercedesbenz',
  тойота: 'toyota', лексус: 'lexus', фольксваген: 'volkswagen', фв: 'volkswagen',
  шкода: 'skoda', ниссан: 'nissan', форд: 'ford', шевроле: 'chevrolet',
  мицубиси: 'mitsubishi', мазда: 'mazda', рено: 'renault', киа: 'kia',
  хендай: 'hyundai', хундай: 'hyundai', опель: 'opel', пежо: 'peugeot', пыжо: 'peugeot',
  ситроен: 'citroen', сузуки: 'suzuki', хонда: 'honda', субару: 'subaru',
  вольво: 'volvo', ауди: 'audi', уаз: 'uaz', дэу: 'daewoo', деу: 'daewoo',
  чери: 'chery', джили: 'geely', хавал: 'haval', эксид: 'exeed', чанган: 'changan',
};

function normalizeMake(make: string) {
  const m = norm(make);
  return MAKE_ALIASES[m] || m;
}

export const ALL_MODELS: ModelManual[] = PACKS.flatMap(p => p.models);

/** Системы в порядке отображения. */
export const SYSTEMS = ['Двигатель', 'Тормозная система', 'Трансмиссия', 'Ходовая часть', 'Электрика', 'Обслуживание'];

export function systemGroup(system: string): string {
  if (system.startsWith('Электрика')) return 'Электрика';
  if (system.startsWith('Двигатель')) return 'Двигатель';
  if (system.startsWith('Тормозная')) return 'Тормозная система';
  if (system.startsWith('Ходовая')) return 'Ходовая часть';
  if (system.startsWith('Трансмиссия')) return 'Трансмиссия';
  return system;
}

function catalogMatch(make: string, model: string): CatalogEntry | null {
  const mk = normalizeMake(make);
  const md = norm(model);
  if (!mk || !md) return null;
  const sameMake = CATALOG.filter(e => normalizeMake(e.make) === mk);
  for (const e of sameMake) {
    if (norm(e.model) === md) return e;
    if ((e.aliases || []).some(a => norm(a) === md)) return e;
  }
  for (const e of sameMake) {
    const em = norm(e.model);
    if (em.length >= 3 && (md.includes(em) || em.includes(md))) return e;
    if ((e.aliases || []).some(a => norm(a).length >= 3 && (md.includes(norm(a)) || norm(a).includes(md)))) return e;
  }
  return null;
}

/** Ищет марку/модель в каталоге (для выбора автомобиля и импорта). */
export function findInCatalog(make: string, model: string): CatalogEntry | null {
  return catalogMatch(make, model);
}

/** Все модели каталога для конкретной марки. */
export function catalogModelsOf(make: string): CatalogEntry[] {
  const mk = normalizeMake(make);
  return CATALOG.filter(e => normalizeMake(e.make) === mk);
}

export interface Resolved {
  /** Найденный пакет модели (null — только универсальные памятки) */
  model: ModelManual | null;
  pack: MakePack | null;
  procedures: Procedure[];
  /** true, если показаны универсальные памятки вместо пакета модели */
  fallback: boolean;
  /** Модели этой же марки, которые есть в каталоге с авторским пакетом */
  siblings: ModelManual[];
  /** Запись каталога: поколения, кузов, алиасы */
  catalog: CatalogEntry | null;
  /** Где легально взять документацию по этой марке */
  sources: OfficialSource[];
}

export function resolveVehicle(vehicle?: {make?: string; model?: string} | null): Resolved {
  if (!vehicle?.make) {
    return {model: null, pack: null, procedures: universalProcedures, fallback: true, siblings: [], catalog: null, sources: []};
  }

  const mk = normalizeMake(vehicle.make);
  const md = norm(vehicle.model || '');
  const entry = catalogMatch(vehicle.make, vehicle.model || '');
  const sources = OFFICIAL_SOURCES[vehicle.make]
    || OFFICIAL_SOURCES[CATALOG.find(e => normalizeMake(e.make) === mk)?.make || '']
    || [];

  let pack: MakePack | null = null;
  for (const p of PACKS) if (normalizeMake(p.make) === mk) { pack = p; break; }

  const base = {procedures: universalProcedures, fallback: true, siblings: [], catalog: entry, sources};

  if (!pack) return {model: null, pack: null, ...base};

  const model = pack.models.find(m => norm(m.model) === md)
    || pack.models.find(m => md && (norm(m.model).includes(md) || md.includes(norm(m.model))))
    || null;

  if (!model) return {model: null, pack, ...base, siblings: pack.models};

  return {
    model, pack, procedures: model.procedures, fallback: false,
    siblings: pack.models.filter(m => m.id !== model.id),
    catalog: entry, sources,
  };
}

/** Список марок/моделей для выбора «или посмотрите каталог». */
export function catalog() {
  return PACKS.map(p => ({
    make: p.make,
    models: p.models.map(m => ({id: m.id, model: m.model, variants: m.variants, count: m.procedures.length})),
  }));
}

/** Поиск по всем процедурам: заголовки, системы, ключевые слова, коды. */
export function searchProcedures(q: string, procedures: Procedure[]): Procedure[] {
  const t = norm(q);
  if (!t) return procedures;
  return procedures.filter(p => {
    const hay = [p.title, p.system, p.intro, ...(p.keywords || []), ...(p.codes || []).map(c => c.code + ' ' + c.meaning)]
      .join(' ')
      .toLowerCase();
    return norm(hay).includes(t) || hay.toLowerCase().includes(q.toLowerCase());
  });
}

/** Все схемы, на которые ссылаются шаги процедуры (в порядке появления). */
export function procedureDiagrams(p: Procedure): {id: string; title: string}[] {
  const ids = new Set<string>();
  for (const s of p.steps) for (const d of s.diagrams || []) ids.add(d);
  return [...ids].map(id => ({id, title: DIAGRAMS[id]?.title || id}));
}
