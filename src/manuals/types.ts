// Типы «Руководства по ремонту».
//
// Контент-пак — это обычные TypeScript-модули, которые импортируются и сервером
// (для валидации: `npm run content:check`), и фронтендом (для отображения).
// Ключевой принцип: каждый шаг процедуры ссылается на источник — либо на
// страницу загруженного пользователем PDF (source: 'pdf'), либо на авторскую
// иллюстрированную памятку из этого пакета (source: 'pack'). Спецификации
// (затяжки, объёмы) берутся ТОЛЬКО из загруженного PDF: в контент-паке их
// держать структурно невозможно — валидатор этого не пропустит.

/** Может быть строкой или текстом с OCR-конфиденциальным replace и т.п. */
export type LocalizedText = string;

export type SafetyLevel = 'normal' | 'caution' | 'danger';

export interface Spec {
  /** «Момент затяжки болтов ГБЦ» / «Объём масла» */
  label: LocalizedText;
  /** «9 ± 1 Н·м, до 40 Н·м, затем 90°» */
  value: LocalizedText;
  note?: LocalizedText;
  /** Откуда значение — обязательный текстовая ссылка на документ/страницу */
  source?: LocalizedText;
}

export interface ManualStep {
  /** Стабильный идентификатор шага (для заметок пользователя и дедупа при ре-импорте). */
  id: string;
  title: LocalizedText;
  body: LocalizedText;
  safety?: SafetyLevel;
  /** Инструмент и материалы для конкретного шага */
  tools?: string[];
  /** id возможностей из src/manuals/diagrams.tsx */
  diagrams?: string[];
  /** id спецификаций, которые появляются после привязки PDF */
  specs?: string[];
  /** id предупреждений из warnings процедуры */
  warnings?: string[];
  /** id деталей */
  parts?: string[];
}

export interface Part {
  name: LocalizedText;
  oem?: string;
  note?: LocalizedText;
}

export interface TroubleCode {
  code: string;
  meaning: LocalizedText;
  likely: LocalizedText;
  check?: LocalizedText;
}

export interface Procedure {
  /** Уникальный в рамках модели идентификатор. */
  id: string;
  title: LocalizedText;
  /** Один-два абзаца введения: зачем, когда, что получите. */
  intro: LocalizedText;
  /** Система: 'Двигатель', 'Тормозная система', 'Электрика' … */
  system: string;
  /** Сколько времени занимает, по оценке автора (не из сервисной книги). */
  time?: string;
  /** Уровень сложности 1..5 */
  difficulty?: 1 | 2 | 3 | 4 | 5;
  /** Инструменты для всей процедуры */
  tools?: string[];
  /** Жидкости/расходники */
  consumables?: string[];
  parts?: Part[];
  /** Предупреждения с id, на которые ссылаются шаги */
  warnings?: { id: string; text: LocalizedText; level: SafetyLevel }[];
  steps: ManualStep[];
  /** Коды неисправностей, относящиеся к процедуре */
  codes?: TroubleCode[];
  /** Какие страницы PDF искать при привязке: ключевые слова, разделы */
  keywords?: string[];
  /** Необязательные разделы «проверка после ремонта» */
  verify?: string[];
  /** Пункты «что делать, если не помогло» */
  fallback?: string[];
}

export interface ModelManual {
  /** Слаг модели, используется в URL данных: kia/ceed. */
  id: string;
  make: string;
  model: string;
  /** Необязательная строка: «2018–2023, 1.6 MPI / 1.4 T-GDI» */
  variants?: string;
  /** Покрываемый двигатель — для сопоставления шагов с VIN/комплектацией */
  engine?: string;
  procedures: Procedure[];
}

export interface MakePack {
  make: string;
  /** Документ-источник, который пользователь должен загрузить для спецификаций. */
  needsManualHint?: string;
  models: ModelManual[];
}
