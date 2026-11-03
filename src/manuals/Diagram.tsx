import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Рендерер авторских схем. Каждая схема — это данные (см. diagramSpecs.ts),
// а не нарисованная вручную картинка: так проще поддерживать и невозможно
// «разъехаться» подписям при правках.
// Типы схем:
//   schematic — электрическая цепь по сетке (колонки/строки), с символами
//   part      — выноски к компоненту (разнесённый вид)
//   flow      — алгоритм диагностики с ветвлениями
//   torque    — порядок затяжки (диск с болтами по кругу)
// ─────────────────────────────────────────────────────────────────────────────

export type Sym =
  | 'ecu' | 'battery' | 'fuse' | 'relay' | 'sensor' | 'motor' | 'ground'
  | 'connector' | 'switch' | 'lamp' | 'pump' | 'valve' | 'ignition' | 'generic';

export interface SchNode {
  id: string;
  label: string;
  sym?: Sym;
  /** колонка 0..2, строка 0..4 */
  at: [number, number];
  sub?: string;
  tone?: 'power' | 'signal' | 'ground';
}

export interface SchWire {
  from: string;
  to: string;
  label?: string;
  /** цвет линии: red = +12В, black = масса, blue = сигнал */
  color?: 'red' | 'black' | 'blue' | 'green' | 'amber';
  dashed?: boolean;
}

export interface SchematicSpec {
  kind: 'schematic';
  title: string;
  caption?: string;
  nodes: SchNode[];
  wires: SchWire[];
}

export interface PartSpec {
  kind: 'part';
  title: string;
  caption?: string;
  /** Стилизованная подложка: какую деталь «фотографируем» */
  backdrop?: 'brake' | 'engine' | 'filter' | 'gearbox' | 'bay' | 'wheel' | 'body' | 'battery';
  parts: { n: number; label: string; x: number; y: number; note?: string }[];
}

export interface FlowSpec {
  kind: 'flow';
  title: string;
  caption?: string;
  steps: { text: string; branch?: string; tone?: 'ok' | 'stop' | 'act' }[];
}

export interface TorqueSpec {
  kind: 'torque';
  title: string;
  caption?: string;
  /** Количество болтов и подписи по порядку */
  count: number;
  center?: string;
  note?: string;
}

export type DiagramSpec = SchematicSpec | PartSpec | FlowSpec | TorqueSpec;

const W = 700;
const COL = 224;
const ROW = 66;
const PADL = 26;
const PADT = 30;

const wireColor: Record<string, string> = {
  red: '#e2685f',
  black: '#8d98a8',
  blue: '#7c9cff',
  green: '#4fcf9d',
  amber: '#e0b062',
};

function symPath(sym: Sym) {
  // Мини-символы рисуются внутри 26×26 у левого края блока.
  switch (sym) {
    case 'battery':
      return <g><rect x="3" y="8" width="20" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M8 5v4M16 5v4" stroke="currentColor" strokeWidth="1.6"/><path d="M6 13.5h15" stroke="currentColor" strokeWidth="1.6"/></g>;
    case 'fuse':
      return <g><rect x="4" y="6" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M4 13h18" stroke="currentColor" strokeWidth="1.6"/><path d="M9 13c1.5-3 3.5-3 5 0s3.5 3 5 0" fill="none" stroke="currentColor" strokeWidth="1.4"/></g>;
    case 'relay':
      return <g><rect x="4" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M12 9v4" stroke="currentColor" strokeWidth="1.4"/><path d="M8.5 13l3.5-1.5L15.5 13" fill="none" stroke="currentColor" strokeWidth="1.4"/><circle cx="12" cy="18" r="1.4" fill="currentColor"/></g>;
    case 'sensor':
      return <g><circle cx="13" cy="13" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M13 7v6l4 2" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="M2 13h4M20 13h4" stroke="currentColor" strokeWidth="1.4"/></g>;
    case 'motor':
      return <g><circle cx="13" cy="13" r="7" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M13 6.5v3.2M12 9.7h2" stroke="currentColor" strokeWidth="1.4"/><text x="13" y="20" textAnchor="middle" fontSize="8" fill="currentColor" fontFamily="monospace">M</text></g>;
    case 'pump':
      return <g><circle cx="13" cy="13" r="7" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M9 16l5-3-5-3z" fill="currentColor" opacity=".8"/></g>;
    case 'ground':
      return <g><path d="M13 5v9" stroke="currentColor" strokeWidth="1.6"/><path d="M6 14h14M8.5 17.5h9M11 21h4" stroke="currentColor" strokeWidth="1.8"/></g>;
    case 'connector':
      return <g><rect x="3" y="8" width="20" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6"/><circle cx="9" cy="13" r="1.3" fill="currentColor"/><circle cx="13" cy="13" r="1.3" fill="currentColor"/><circle cx="17" cy="13" r="1.3" fill="currentColor"/></g>;
    case 'switch':
      return <g><circle cx="7" cy="13" r="1.6" fill="currentColor"/><circle cx="19" cy="13" r="1.6" fill="currentColor"/><path d="M8 12.4L18 8.5" stroke="currentColor" strokeWidth="1.6"/></g>;
    case 'lamp':
      return <g><circle cx="13" cy="13" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M7 7l12 12M19 7L7 19" stroke="currentColor" strokeWidth="1.2"/></g>;
    case 'valve':
      return <g><path d="M4 13h6l4-5 4 5h5" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M14 8v10" stroke="currentColor" strokeWidth="1.4"/></g>;
    case 'ignition':
      return <g><path d="M13 4l-5 10h4l-2 8 6-11h-4z" fill="currentColor" opacity=".85"/></g>;
    case 'ecu':
      return <g><rect x="4" y="6" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M8 10h3v6H8z" fill="currentColor" opacity=".35"/><path d="M14 11h5M14 14h4" stroke="currentColor" strokeWidth="1.3"/></g>;
    default:
      return <g><rect x="4" y="6" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6"/></g>;
  }
}

function nodeBox(n: SchNode) {
  const x = PADL + n.at[0] * COL;
  const y = PADT + n.at[1] * ROW;
  const tone = n.tone === 'power' ? '#e2685f' : n.tone === 'ground' ? '#8d98a8' : '#8fa6ff';
  return {x, y, w: COL - 26, h: 46, tone};
}

function Schematic({spec}: {spec: SchematicSpec}) {
  const boxes = new Map(spec.nodes.map(n => [n.id, nodeBox(n)]));
  const maxRow = Math.max(...spec.nodes.map(n => n.at[1]));
  const height = PADT + maxRow * ROW + 80;
  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="diagram-svg" role="img" aria-label={spec.title}>
      <defs>
        <marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0L8 4L0 8z" fill="#7d8ba3"/>
        </marker>
      </defs>
      {spec.wires.map((w, i) => {
        const a = boxes.get(w.from), b = boxes.get(w.to);
        if (!a || !b) return null;
        const ax = a.x + a.w, ay = a.y + a.h / 2;
        const bx = b.x, by = b.y + b.h / 2;
        const c = wireColor[w.color || 'blue'];
        let d: string, lx: number, ly: number;
        if (Math.abs(a.x - b.x) < 1) {
          // один столбец: вертикальное соединение снизу вверх
          const vx = a.x + a.w / 2;
          d = `M${vx} ${a.y + a.h}V${b.y}`;
          lx = vx + 8; ly = (a.y + a.h + b.y) / 2;
        } else if (b.x < a.x) {
          // обратное направление: обходим снизу, чтобы линия не легла на блоки
          const axc = a.x + Math.min(70, a.w / 2), bxc = b.x + Math.min(70, b.w / 2);
          const ch = Math.max(a.y + a.h, b.y + b.h) + 20;
          d = `M${axc} ${a.y + a.h}V${ch}H${bxc}V${b.y + b.h}`;
          lx = (axc + bxc) / 2; ly = ch - 5;
        } else if (Math.abs(ay - by) < 1) {
          d = `M${ax} ${ay}H${bx}`;
          lx = (ax + bx) / 2; ly = ay - 6;
        } else {
          const mx = ax + Math.min(34, (bx - ax) / 2);
          d = `M${ax} ${ay}H${mx}V${by}H${bx}`;
          lx = mx + 6; ly = (ay + by) / 2;
        }
        return (
          <g key={i}>
            <path d={d} fill="none" stroke={c} strokeWidth="2" strokeDasharray={w.dashed ? '5 4' : undefined} markerEnd="url(#arr)" opacity=".9"/>
            {w.label && <text x={lx} y={ly} fontSize="9.5" fill={c} fontFamily="'DM Sans',sans-serif" opacity=".95">{w.label}</text>}
          </g>
        );
      })}
      {spec.nodes.map(n => {
        const b = boxes.get(n.id)!;
        return (
          <g key={n.id}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="8" fill="#182231" stroke="#2f3d52"/>
            <g transform={`translate(${b.x + 8},${b.y + 9})`} color={b.tone}>{symPath(n.sym || 'generic')}</g>
            <text x={b.x + 42} y={b.y + 20} fontSize="12" fontWeight="600" fill="#dfe6f2" fontFamily="'DM Sans',sans-serif">{n.label}</text>
            {n.sub && <text x={b.x + 42} y={b.y + 34} fontSize="9.5" fill="#8593a7" fontFamily="'DM Sans',sans-serif">{n.sub}</text>}
          </g>
        );
      })}
    </svg>
  );
}

const backdrops: Record<string, {label: string; draw: React.ReactNode}> = {};

function Part({spec}: {spec: PartSpec}) {
  const height = 380;
  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="diagram-svg" role="img" aria-label={spec.title}>
      <defs>
        <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a3648"/><stop offset="1" stopColor="#151d29"/>
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="45%" r="60%">
          <stop offset="0" stopColor="#33456a" stopOpacity=".55"/><stop offset="1" stopColor="#0d1219" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect x="0" y="0" width={W} height={height} fill="#0f151d"/>
      <ellipse cx={W * 0.42} cy={height * 0.5} rx="270" ry="160" fill="url(#glow)"/>
      {/* стилизованный «компонент»: крупная сборочная форма */}
      <g opacity=".95">
        <rect x="150" y="70" width="300" height="240" rx="26" fill="url(#metal)" stroke="#3b4a5f"/>
        <rect x="182" y="100" width="236" height="180" rx="18" fill="none" stroke="#40506a" strokeDasharray="6 6"/>
        <circle cx="300" cy="190" r="58" fill="none" stroke="#4a5c76" strokeWidth="2"/>
        <circle cx="300" cy="190" r="30" fill="#1b2636" stroke="#54677f"/>
      </g>
      {spec.parts.map(p => {
        const lx = 512, ly = 46 + (p.n - 1) * 46;
        return (
          <g key={p.n}>
            <path d={`M${p.x} ${p.y}L${lx - 16} ${ly - 4}`} stroke="#5a6d88" strokeWidth="1" strokeDasharray="3 3"/>
            <circle cx={p.x} cy={p.y} r="12" fill="#647cff" opacity=".18"/>
            <circle cx={p.x} cy={p.y} r="12" fill="none" stroke="#8fa6ff"/>
            <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#cfd9ff" fontFamily="'DM Sans',sans-serif">{p.n}</text>
            <circle cx={lx - 16} cy={ly - 4} r="3" fill="#8fa6ff"/>
            <text x={lx} y={ly} fontSize="11" fontWeight="600" fill="#dfe6f2" fontFamily="'DM Sans',sans-serif">{p.label}</text>
            {p.note && <text x={lx} y={ly + 13} fontSize="9.5" fill="#8593a7" fontFamily="'DM Sans',sans-serif">{p.note}</text>}
          </g>
        );
      })}
    </svg>
  );
}

function Flow({spec}: {spec: FlowSpec}) {
  const stepH = 62, gap = 26;
  const height = 20 + spec.steps.length * (stepH + gap);
  const tones: Record<string, {bg: string; bd: string; tx: string}> = {
    ok: {bg: '#12251f', bd: '#2b5b46', tx: '#7fe3bd'},
    stop: {bg: '#2a1a1d', bd: '#6a3540', tx: '#f0a1ab'},
    act: {bg: '#16203a', bd: '#354b7d', tx: '#a8bbff'},
  };
  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="diagram-svg" role="img" aria-label={spec.title}>
      <defs>
        <marker id="arr2" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0L8 4L0 8z" fill="#5f6e85"/>
        </marker>
      </defs>
      {spec.steps.map((s, i) => {
        const y = 14 + i * (stepH + gap);
        const t = tones[s.tone || 'act'];
        const lines = s.text.length > 78 ? [s.text.slice(0, 78), s.text.slice(78)] : [s.text];
        return (
          <g key={i}>
            <rect x="40" y={y} width={W - 150} height={stepH} rx="10" fill={t.bg} stroke={t.bd}/>
            <circle cx="70" cy={y + 31} r="13" fill="#101722" stroke={t.bd}/>
            <text x="70" y={y + 35} textAnchor="middle" fontSize="11" fontWeight="700" fill={t.tx} fontFamily="'DM Sans',sans-serif">{i + 1}</text>
            {lines.map((ln, k) => (
              <text key={k} x="96" y={y + (lines.length > 1 ? 26 + k * 15 : 35)} fontSize="11.5" fill="#d8e0ec" fontFamily="'DM Sans',sans-serif">{ln}</text>
            ))}
            {s.branch && (
              <>
                <path d={`M${W - 110} ${y + 31}H${W - 24}`} stroke="#5f6e85" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arr2)"/>
                <text x={W - 108} y={y + 24} fontSize="9.5" fill="#8494ab" fontFamily="'DM Sans',sans-serif">{s.branch}</text>
              </>
            )}
            {i < spec.steps.length - 1 && (
              <path d={`M${(W - 110) / 2 + 20} ${y + stepH}V${y + stepH + gap}`} stroke="#3d4a5e" strokeWidth="2" markerEnd="url(#arr2)"/>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Torque({spec}: {spec: TorqueSpec}) {
  const cx = 300, cy = 200, r = 118;
  const pts = Array.from({length: spec.count}, (_, i) => {
    const a = (-Math.PI / 2) + (i * 2 * Math.PI) / spec.count;
    return {x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), n: i + 1};
  });
  return (
    <svg viewBox={`0 0 ${W} 400`} className="diagram-svg" role="img" aria-label={spec.title}>
      <rect x="0" y="0" width={W} height="400" fill="#0f151d"/>
      <circle cx={cx} cy={cy} r="140" fill="#182231" stroke="#33425a"/>
      <circle cx={cx} cy={cy} r="96" fill="none" stroke="#3b4c66" strokeDasharray="6 5"/>
      <circle cx={cx} cy={cy} r="40" fill="#111a24" stroke="#42556e"/>
      {spec.center && <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fill="#93a3b8" fontFamily="'DM Sans',sans-serif">{spec.center}</text>}
      {pts.map(p => (
        <g key={p.n}>
          <circle cx={p.x} cy={p.y} r="15" fill="#1d2a3b" stroke="#5b7bb8"/>
          <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#b7c8ff" fontFamily="'DM Sans',sans-serif">{p.n}</text>
        </g>
      ))}
      <text x="516" y="150" fontSize="11.5" fill="#dfe6f2" fontFamily="'DM Sans',sans-serif">Порядок затяжки</text>
      <text x="516" y="172" fontSize="10.5" fill="#8593a7" fontFamily="'DM Sans',sans-serif">по номерам, в несколько этапов</text>
      <text x="516" y="192" fontSize="10.5" fill="#8593a7" fontFamily="'DM Sans',sans-serif">{spec.note || 'момент — из сервисной книги'}</text>
    </svg>
  );
}

export function Diagram({spec}: {spec: DiagramSpec}) {
  if (spec.kind === 'schematic') return <Schematic spec={spec}/>;
  if (spec.kind === 'part') return <Part spec={spec}/>;
  if (spec.kind === 'flow') return <Flow spec={spec}/>;
  return <Torque spec={spec}/>;
}
