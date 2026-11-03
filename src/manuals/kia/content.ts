import type {MakePack} from '../types.ts';
import {engineProcedures} from './engine.ts';
import {electronicsProcedures} from './electronics.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Kia Ceed (CD, 2018–2023) — авторские памятки по ремонту и диагностике.
//
// ЗДЕСЬ НЕТ моментов затяжки, объёмов и «фирменных» кодов: по правилам проекта
// такие значения показываются только со страниц загруженного PDF. Шаги, где
// нужна спецификация, помечены `specs: [...]`, и интерфейс показывает
// «не подтверждено» до привязки источника.
//
// Как добавить свою машину: скопируйте папку kia → mymake, поменяйте данные,
// подключите пак в src/manuals/index.ts и проверьте `npm run content:check`.
// ─────────────────────────────────────────────────────────────────────────────

export const kiaPack: MakePack = {
  make: 'Kia',
  needsManualHint:
    'Для моментов затяжки и объёмов загрузите страницы сервисной книги Kia Ceed CD для вашего двигателя во вкладке «Мои источники» — приложение подставит их к шагам.',
  models: [
    {
      id: 'ceed-cd',
      make: 'Kia',
      model: 'Ceed',
      variants: '2018–2023 · CD · 1.0 T-GDI / 1.4 MPI / 1.6 MPI / 1.4 T-GDI',
      engine: '1.4 MPI · 1.6 MPI · 1.4 T-GDI · 1.0 T-GDI',
      procedures: [...engineProcedures, ...electronicsProcedures],
    },
  ],
};
