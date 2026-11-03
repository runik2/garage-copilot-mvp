import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {DIAGRAMS} from './diagramSpecs.ts';
import {Diagram} from './Diagram.tsx';
import Guide, {SpecCard} from '../Guide.jsx';

/** Галерея всех схем: используется для проверки и как офлайн-превью. */
export function renderDiagramGallery(): string {
  const parts: string[] = [];
  for (const [id, spec] of Object.entries(DIAGRAMS)) {
    parts.push(
      `<section class="card"><h2>${id}</h2><h3>${spec.title}</h3>${spec.caption ? `<p>${spec.caption}</p>` : ''}` +
      `<div class="frame">${renderToStaticMarkup(React.createElement(Diagram, {spec}))}</div></section>`
    );
  }
  return parts.join('\n');
}

const demoKia = [{id: 'k1', make: 'Kia', model: 'Ceed', model_year: 2019, engine: '1.6 MPI'}];
const demoToyota = [{id: 't1', make: 'Toyota', model: 'Camry', model_year: 2016}];

export function renderScreens(): {kia: string; toyota: string; specCards: string} {
  const props = {
    sources: [], open: () => {}, onSaveJob: async () => {}, onFindSources: async () => [], demo: true,
    onLoadSpecs: async () => [], onSaveSpec: async () => ({}), onOpenSource: async () => null,
  };
  // Эффекты в SSR не выполняются, поэтому ветку «значение подтверждено»
  // проверяем отдельным рендером карточки спецификации.
  const specCards = renderToStaticMarkup(
    React.createElement('div', null,
      React.createElement(SpecCard, {
        id: 'oil.plug_torque',
        confirmed: {value: '35', unit: 'Н·м', source_title: 'Rukovodstvo Ceed CD.pdf', source_page: 41, source_id: 'src-1'},
        onFind: async () => [], onBind: async () => {}, onOpenSource: () => {},
      }),
      React.createElement(SpecCard, {
        id: 'oil.volume',
        onFind: async () => [], onBind: async () => {}, onOpenSource: () => {},
      })
    )
  );
  return {
    kia: renderToStaticMarkup(
      React.createElement(Guide, {...props, cars: demoKia, selected: 'k1', setSelected: () => {}})
    ),
    specCards,
    toyota: renderToStaticMarkup(
      React.createElement(Guide, {...props, cars: demoToyota, selected: 't1', setSelected: () => {}})
    ),
  };
}

export function renderPage(title: string, body: string): string {
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${title}</title>
<style>
  body{margin:0;padding:28px;background:#0b0e14;color:#e8ecf5;font-family:'DM Sans',system-ui,sans-serif}
  h1{font-size:20px;margin:0 0 6px}
  .card{background:#131a24;border:1px solid #26303e;border-radius:12px;padding:14px;margin:0 0 16px}
  .card h2{margin:0;font-size:11px;color:#7f8da3;font-family:ui-monospace,monospace;font-weight:500}
  .card h3{margin:5px 0 0;font-size:15px}
  .card p{color:#93a1b7;font-size:12px;margin:7px 0 0;line-height:1.55}
  .frame{margin-top:12px;border:1px solid #26303e;border-radius:9px;overflow:hidden;background:#0f151d}
</style></head><body><h1>${title}</h1>${body}</body></html>`;
}
