import React, {useEffect, useMemo, useState} from 'react';
import {
  AlertTriangle, BookMarked, BookOpen, CarFront, CheckCircle2, ChevronRight, Circle, FileText,
  Images, Link2, Printer, Search, Settings, ShieldCheck, Upload, Wrench, Zap, X, Loader2,
} from 'lucide-react';
import {resolveVehicle, catalog, searchProcedures, systemGroup, DIAGRAMS, CATALOG_SIZE} from './manuals/index.ts';
import {SPEC_LABELS} from './manuals/specs.ts';
import {Diagram} from './manuals/Diagram.tsx';

const DIFF = ['', 'просто', 'легко', 'средне', 'сложно', 'для опытных'];

function Badge({children, tone = ''}) {
  return <span className={'badge ' + tone}>{children}</span>;
}

function SafetyChip({level}) {
  if (!level || level === 'normal') return null;
  return (
    <Badge tone={level === 'danger' ? 'red' : 'amber'}>
      <AlertTriangle size={12}/> {level === 'danger' ? 'опасно' : 'осторожно'}
    </Badge>
  );
}

/**
 * Слот спецификации. Пока значения нет — показываем честное «не подтверждено»
 * и кнопку поиска по загруженным PDF. Когда пользователь находит страницу и
 * привязывает значение, слот становится зелёным и ссылается на источник.
 */
export function SpecCard({id, confirmed, onFind, onBind, onOpenSource}) {  const label = SPEC_LABELS[id] || id;
  const [finding, setFinding] = useState(false);
  const [hits, setHits] = useState(null);
  const [binding, setBinding] = useState(null);   // выбранная страница
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function find() {
    setFinding(true);
    try { setHits(await onFind() || []); }
    finally { setFinding(false); }
  }

  async function bind() {
    if (!value.trim()) { setError('Впишите значение так, как оно напечатано в документе'); return; }
    setSaving(true);
    try {
      await onBind({spec_key: id, value: value.trim(), source_id: binding?.source_id, source_page: binding?.page_number});
      setBinding(null);
      setValue('');
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  if (confirmed) {
    return (
      <div className="spec-card confirmed">
        <div className="spec-icon"><CheckCircle2 size={16}/></div>
        <div className="spec-body">
          <b>{label}</b>
          <strong>{confirmed.value}{confirmed.unit ? ' ' + confirmed.unit : ''}</strong>
          <span>
            {confirmed.source_title
              ? <>Источник: {confirmed.source_title}{confirmed.source_page ? `, стр. ${confirmed.source_page}` : ''}</>
              : 'Источник не привязан — значение введено вручную'}
          </span>
        </div>
        {confirmed.source_id && confirmed.source_page && (
          <button className="secondary tiny" onClick={() => onOpenSource(confirmed.source_id, confirmed.source_page)}>
            <FileText size={14}/>Страница
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="spec-card">
      <div className="spec-icon"><FileText size={16}/></div>
      <div className="spec-body">
        <b>{label}</b>
        <span>Значения нет: приложение не придумывает цифры. Найдите страницу в своём PDF и привяжите значение — оно появится во всех шагах.</span>
      </div>
      <button className="secondary tiny" onClick={find} disabled={finding}>
        {finding ? <Loader2 size={14} className="spin"/> : <Search size={14}/>}
        Найти в источниках
      </button>

      {hits && hits.length === 0 && (
        <div className="spec-hits"><div className="muted-note">Совпадений нет. Загрузите PDF во вкладке «Мои источники».</div></div>
      )}

      {hits?.length > 0 && !binding && (
        <div className="spec-hits">
          {hits.slice(0, 4).map((h, i) => (
            <div key={i}>
              <FileText size={13}/>
              <b>{h.title}</b><span>стр. {h.page_number}</span>
              <button className="link-btn" onClick={() => { setBinding(h); setValue(''); setError(''); }}>привязать</button>
              <small>{h.excerpt || (h.content || '').slice(0, 220)}</small>
            </div>
          ))}
        </div>
      )}

      {binding && (
        <div className="bind-form">
          <div className="bind-head">
            <Link2 size={14}/>
            <span>{binding.title}, стр. {binding.page_number}</span>
            <button className="icon-btn" onClick={() => setBinding(null)}><X size={14}/></button>
          </div>
          <label>Значение из документа
            <input value={value} onChange={e => setValue(e.target.value)} placeholder="Например: 35 Н·м" autoFocus/>
          </label>
          {error && <div className="bind-error">{error}</div>}
          <button className="primary tiny" onClick={bind} disabled={saving}>
            {saving ? <Loader2 size={14} className="spin"/> : <CheckCircle2 size={14}/>}Сохранить значение
          </button>
        </div>
      )}
    </div>
  );
}

function StepCard({step, index, warnings, onDiagram, renderSpec, onOpenSource}) {
  const stepWarnings = (step.warnings || []).map(id => warnings.find(w => w.id === id)).filter(Boolean);
  return (
    <article className="guide-step">
      <div className="step-rail"><span className="step-num">{index}</span></div>
      <div className="step-body">
        <header>
          <h3>{step.title}</h3>
          <SafetyChip level={step.safety}/>
        </header>
        <p>{step.body}</p>

        {stepWarnings.map(w => (
          <div className={'step-warn ' + (w.level === 'danger' ? 'danger' : '')} key={w.id}>
            <AlertTriangle size={15}/><span>{w.text}</span>
          </div>
        ))}

        {step.tools?.length > 0 && (
          <div className="step-chips">
            {step.tools.map(t => <span className="chip" key={t}><Wrench size={12}/>{t}</span>)}
          </div>
        )}
        {step.parts?.length > 0 && (
          <div className="step-chips">
            {step.parts.map(p => <span className="chip part" key={p.name}><Settings size={12}/>{p.name}{p.note ? ' · ' + p.note : ''}</span>)}
          </div>
        )}

        {(step.specs || []).map(id => <React.Fragment key={id}>{renderSpec(id)}</React.Fragment>)}

        {(step.diagrams || []).length > 0 && (
          <div className="step-diagrams">
            {(step.diagrams || []).map(d => {
              const spec = DIAGRAMS[d];
              if (!spec) return null;
              return (
                <figure key={d} className="diagram-fig" onClick={() => onDiagram(d)} title="Открыть схему">
                  <div className="diagram-thumb"><Diagram spec={spec}/></div>
                  <figcaption><Images size={13}/>{spec.title}</figcaption>
                </figure>
              );
            })}
          </div>
        )}

        {step.verify?.length > 0 && (
          <div className="verify">
            <ShieldCheck size={15}/>
            <div><b>Проверка после шага</b><ul>{step.verify.map(v => <li key={v}>{v}</li>)}</ul></div>
          </div>
        )}
      </div>
    </article>
  );
}

function ProcedureView({proc, car, specs, onDiagram, onFindSources, onSave, onBindSpec, onOpenSource, saved, demo}) {
  const [kb, setKb] = useState(null);
  const [kbLoading, setKbLoading] = useState(false);
  const [page, setPage] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => { setKb(null); setPage(null); }, [proc.id]);

  const specByKey = useMemo(() => {
    const m = {};
    for (const s of specs || []) m[s.spec_key] = s;
    return m;
  }, [specs]);

  async function findInSources() {
    setKbLoading(true);
    try { setKb(await onFindSources(proc.keywords || [proc.title]) || []); }
    finally { setKbLoading(false); }
  }

  async function openPage(sourceId, pageNumber) {
    const p = await onOpenSource(sourceId, pageNumber);
    if (p) setPage(p);
  }

  const groups = [];
  for (const s of proc.steps) {
    const key = 'Порядок работ';
    const g = groups.find(x => x.key === key);
    if (g) g.items.push(s); else groups.push({key, items: [s]});
  }
  let n = 0;

  function renderSpec(id) {
    return (
      <SpecCard id={id}
        confirmed={specByKey[id]}
        onFind={() => onFindSources([SPEC_LABELS[id] || id, proc.title, ...(proc.keywords || []).slice(0, 2)])}
        onBind={body => onBindSpec({...body, vehicle_id: car?.id})}
        onOpenSource={openPage}/>
    );
  }

  return (
    <div className="procedure-doc">
      <div className="proc-head">
        <div className="proc-head-main">
          <div className="proc-badges">
            <Badge tone="green"><span className="dot"/>{proc.system}</Badge>
            {proc.time && <Badge>≈ {proc.time}</Badge>}
            {proc.difficulty && <Badge>сложность: {DIFF[proc.difficulty]}</Badge>}
            <Badge><CarFront size={12}/>{car?.make} {car?.model} {car?.model_year || ''}</Badge>
          </div>
          <h1>{proc.title}</h1>
          <p className="proc-intro">{proc.intro}</p>
        </div>
        <div className="proc-actions">
          <button className="secondary tiny" onClick={() => window.print()}><Printer size={14}/>Печать</button>
          <button className="primary tiny" onClick={() => onSave(proc)} disabled={saved}>
            <BookMarked size={14}/>{saved ? 'Сохранено' : 'В историю'}
          </button>
        </div>
      </div>

      <div className="proc-safety">
        <ShieldCheck size={16}/>
        <span>
          Авторская памятка по порядку работ, а не заводская инструкция. Моменты затяжки, объёмы и номиналы
          приходят только из ваших документов — привяжите их к шагу, и они будут показаны со ссылкой на страницу.
        </span>
      </div>

      <div className="proc-meta-grid">
        {proc.tools?.length > 0 && (
          <section className="meta-box">
            <h4><Wrench size={14}/>Инструмент</h4>
            <ul>{proc.tools.map(t => <li key={t}>{t}</li>)}</ul>
          </section>
        )}
        {proc.consumables?.length > 0 && (
          <section className="meta-box">
            <h4><Circle size={13}/>Материалы и жидкости</h4>
            <ul>{proc.consumables.map(t => <li key={t}>{t}</li>)}</ul>
          </section>
        )}
        {proc.parts?.length > 0 && (
          <section className="meta-box">
            <h4><Settings size={14}/>Детали</h4>
            <ul>{proc.parts.map(p => <li key={p.name}>{p.name}{p.note && <small>{p.note}</small>}</li>)}</ul>
          </section>
        )}
      </div>

      {groups.map(g => (
        <section className="steps-group" key={g.key}>
          <h2>{g.key}</h2>
          {g.items.map(step => {
            n += 1;
            return (
              <StepCard key={step.id} step={step} index={n} warnings={proc.warnings || []}
                onDiagram={onDiagram} renderSpec={renderSpec} onOpenSource={openPage}/>
            );
          })}
        </section>
      ))}

      {proc.verify?.length > 0 && (
        <section className="finish-box">
          <h3><ShieldCheck size={16}/>Проверка после ремонта</h3>
          <ul>{proc.verify.map(v => <li key={v}>{v}</li>)}</ul>
        </section>
      )}

      {proc.fallback?.length > 0 && (
        <section className="finish-box warn">
          <h3><AlertTriangle size={16}/>Если не помогло</h3>
          <ul>{proc.fallback.map(v => <li key={v}>{v}</li>)}</ul>
        </section>
      )}

      {proc.codes?.length > 0 && (
        <section className="codes">
          <h3><Zap size={16}/>Коды неисправностей по теме</h3>
          <p className="hint">Расшифровки ориентировочные. Точные условия появления кода и порядок проверки — в документе для вашей модели.</p>
          <div className="codes-table">
            {proc.codes.map(c => (
              <div className="code-row" key={c.code}>
                <b>{c.code}</b>
                <div>
                  <span>{c.meaning}</span>
                  <small>Вероятные причины: {c.likely}{c.check ? ' · Проверка: ' + c.check : ''}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="proc-sources">
        <div className="sources-head">
          <h3><BookOpen size={16}/>Ваши источники по этой теме</h3>
          <button className="secondary tiny" onClick={findInSources} disabled={kbLoading}>
            {kbLoading ? <Loader2 size={14} className="spin"/> : <Search size={14}/>}
            Искать в загруженных PDF
          </button>
        </div>
        <p className="hint">
          Поиск идёт по тексту PDF, которые вы загрузили. Приложение не скачивает чужие базы: только то, что вы вправе использовать.
        </p>
        {kb && kb.length === 0 && <div className="empty-inline">Совпадений нет. Загрузите страницы руководства во вкладке «Мои источники».</div>}
        {kb?.length > 0 && (
          <div className="kb-hits">
            {kb.slice(0, 8).map((h, i) => (
              <div key={i}>
                <FileText size={14}/>
                <span>
                  <b>{h.title}</b><small>стр. {h.page_number}</small><em>{h.excerpt}</em>
                </span>
                <button className="link-btn" onClick={() => openPage(h.source_id, h.page_number)}>открыть</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {demo && <div className="notice">Демо-режим: источники, значения и история работ не сохраняются. Запустите сервер, чтобы привязывать страницы PDF.</div>}

      {page && (
        <div className="modal-backdrop" onClick={() => setPage(null)}>
          <div className="page-viewer" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2>{page.title}</h2>
                <p>Страница {page.page_number}{page.publisher ? ' · ' + page.publisher : ''}</p>
              </div>
              <button className="icon-btn" onClick={() => setPage(null)}><X/></button>
            </div>
            <pre className="page-text">{page.content}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Guide({cars, selected, setSelected, sources, open, onSaveJob, onFindSources, onLoadSpecs, onSaveSpec, onOpenSource, demo}) {
  const [q, setQ] = useState('');
  const [system, setSystem] = useState('Все');
  const [procId, setProcId] = useState(null);
  const [diagram, setDiagram] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [specs, setSpecs] = useState([]);

  const car = cars.find(c => c.id === selected) || cars[0] || null;
  const resolved = useMemo(() => resolveVehicle(car), [car?.make, car?.model]);

  useEffect(() => {
    let alive = true;
    if (!car?.id || car.id.startsWith('demo-')) { setSpecs([]); return; }
    onLoadSpecs?.(car.id).then(rows => { if (alive) setSpecs(rows || []); }).catch(() => {});
    return () => { alive = false; };
  }, [car?.id]);

  const systems = useMemo(() => {
    const s = new Set(resolved.procedures.map(p => systemGroup(p.system)));
    return ['Все', ...s];
  }, [resolved]);

  const list = useMemo(() => {
    let items = searchProcedures(q, resolved.procedures);
    if (system !== 'Все') items = items.filter(p => systemGroup(p.system) === system);
    return items;
  }, [q, system, resolved]);

  const active = list.find(p => p.id === procId) || list[0] || null;

  useEffect(() => { setProcId(null); }, [car?.id]);

  async function save(proc) {
    if (!car) return;
    await onSaveJob({vehicle_id: car.id, title: proc.title, symptom: proc.intro});
    setSavedJobs(s => [...s, proc.id]);
  }

  async function bindSpec(body) {
    const row = await onSaveSpec(body);
    setSpecs(prev => {
      const rest = prev.filter(s => s.spec_key !== row.spec_key);
      return [...rest, row];
    });
  }

  async function openSource(sourceId, pageNumber) {
    return await onOpenSource?.(sourceId, pageNumber) || null;
  }

  return (
    <section className="page guide-page">
      <div className="page-head">
        <div>
          <h1>Руководство по ремонту</h1>
          <p>{CATALOG_SIZE} моделей в каталоге. Выберите автомобиль — откроются пошаговые памятки: мотор, тормоза, ходовая, электрика, схемы и коды.</p>
        </div>
        <button className="secondary" onClick={() => open('source')}><Upload size={16}/>Добавить документ</button>
      </div>

      {!car && (
        <div className="panel empty-state">
          <CarFront size={30}/>
          <b>Сначала выберите автомобиль</b>
          <p>Добавьте карточку автомобиля или откройте демо-режим — руководство строится под конкретную марку и модель.</p>
          <button className="primary" onClick={() => open('vehicle')}>Добавить автомобиль</button>
        </div>
      )}

      {car && (
        <>
          <div className="guide-bar panel">
            <div className="guide-car">
              <CarFront size={18}/>
              <div>
                <b>{car.make} {car.model} {car.model_year || ''}</b>
                <small>{resolved.model ? (resolved.model.variants || 'пакет для модели') : resolved.catalog ? resolved.catalog.years + ' · ' + resolved.catalog.body : 'универсальные памятки'}</small>
              </div>
              {cars.length > 1 && (
                <select value={car.id} onChange={e => setSelected(e.target.value)}>
                  {cars.map(c => <option key={c.id} value={c.id}>{c.make} {c.model} {c.model_year || ''}</option>)}
                </select>
              )}
            </div>
            <div className="guide-stats">
              <span><b>{resolved.procedures.length}</b> процедур</span>
              <span><b>{resolved.procedures.reduce((n, p) => n + p.steps.length, 0)}</b> шагов</span>
              <span><b>{specs.length}</b> значений</span>
              <span><b>{sources.length}</b> источников</span>
            </div>
          </div>

          {resolved.fallback && (
            <div className="notice warn">
              <AlertTriangle size={16}/>
              <span>
                Для {car.make} {car.model} пока нет отдельного авторского пакета — показаны универсальные памятки.
                Спецификации всё равно берутся из ваших PDF.
                {resolved.siblings.length > 0 && ' Для этой марки есть пакет другой модели: ' + resolved.siblings.map(s => s.model).join(', ') + '.'}
              </span>
            </div>
          )}

          <div className="guide-layout">
            <aside className="guide-side panel">
              <div className="guide-search">
                <Search size={15}/>
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Ремонт, код ошибки, узел…"/>
              </div>
              <div className="system-tabs">
                {systems.map(s => (
                  <button key={s} className={system === s ? 'on' : ''} onClick={() => setSystem(s)}>{s}</button>
                ))}
              </div>
              <div className="proc-list">
                {list.length === 0 && <div className="empty-inline">Ничего не найдено. Измените запрос.</div>}
                {list.map(p => (
                  <button key={p.id} className={'proc-item' + (active?.id === p.id ? ' active' : '')} onClick={() => setProcId(p.id)}>
                    <span className="proc-item-icon">{p.system.startsWith('Электрика') ? <Zap size={15}/> : <Wrench size={15}/>}</span>
                    <span>
                      <b>{p.title}</b>
                      <small>{p.system} · {p.steps.length} шагов{p.time ? ' · ' + p.time : ''}</small>
                    </span>
                    <ChevronRight size={14}/>
                  </button>
                ))}
              </div>

              {resolved.sources.length > 0 && (
                <div className="official">
                  <b>Где взять документацию</b>
                  {resolved.sources.map(src => (
                    <a key={src.url} href={src.url} target="_blank" rel="noreferrer noopener">
                      <FileText size={13}/>{src.label}
                      {src.note && <small>{src.note}</small>}
                    </a>
                  ))}
                  <p>Порталы производителей платные, но законные. Скачайте документ и загрузите в «Мои источники» — приложение проиндексирует страницы.</p>
                </div>
              )}

              <details className="catalog">
                <summary>Каталог авторских пакетов</summary>
                {catalog().map(p => (
                  <div key={p.make}>
                    <b>{p.make}</b>
                    <ul>{p.models.map(m => <li key={m.id}>{m.model} <small>{m.count} процедур</small></li>)}</ul>
                  </div>
                ))}
                <p>Нет вашей марки? Загрузите PDF во вкладке «Мои источники» — руководство будет искать по нему.</p>
              </details>
            </aside>

            <main className="guide-main">
              {active
                ? <ProcedureView key={active.id} proc={active} car={car} demo={demo} specs={specs}
                    onDiagram={setDiagram}
                    onFindSources={onFindSources}
                    onSave={save} onBindSpec={bindSpec} onOpenSource={openSource}
                    saved={savedJobs.includes(active.id)}/>
                : <div className="empty-inline big">Выберите процедуру слева</div>}
            </main>
          </div>
        </>
      )}

      {car && (
        <section className="author-note panel">
          <img src="/illustrations/oil-service-prep.png" alt="Авторская иллюстрация подготовки к сервису масла"/>
          <div>
            <Badge>Авторская памятка</Badge>
            <h3>Иллюстрации — часть руководства</h3>
            <p>
              Схемы и выноски в этом разделе нарисованы для приложения: они объясняют порядок работ и логику цепи.
              Это не копии заводских чертежей. Точные данные — номиналы, моменты, расположение разъёмов — всегда
              приходят из документа, который вы загрузили.
            </p>
          </div>
        </section>
      )}

      {diagram && (
        <div className="modal-backdrop" onClick={() => setDiagram(null)}>
          <div className="diagram-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2>{DIAGRAMS[diagram]?.title}</h2>
                {DIAGRAMS[diagram]?.caption && <p>{DIAGRAMS[diagram].caption}</p>}
              </div>
              <button className="icon-btn" onClick={() => setDiagram(null)}><X/></button>
            </div>
            <div className="diagram-full"><Diagram spec={DIAGRAMS[diagram]}/></div>
          </div>
        </div>
      )}
    </section>
  );
}
