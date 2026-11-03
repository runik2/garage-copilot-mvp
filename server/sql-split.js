/**
 * Разбивает SQL-файл на отдельные команды.
 *
 * Зачем: PGlite не умеет выполнять скрипт из нескольких команд одним вызовом
 * (и путается на `$$`-блоках), а драйвер `pg` такое умеет, но не везде.
 * Поэтому миграции идут по одной команде, а этот разборщик корректно
 * пропускает `$$ ... $$`, строковые литералы и комментарии.
 */
export function splitStatements(text) {
  const out = [];
  let cur = '';
  let inString = false;
  let inIdent = false;
  let inDollar = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    // комментарий -- до конца строки
    if (!inString && !inIdent && !inDollar && ch === '-' && text[i + 1] === '-') {
      while (i < text.length && text[i] !== '\n') i++;
      cur += '\n';
      continue;
    }

    if (!inIdent && !inDollar && ch === "'") inString = !inString;
    if (!inString && !inDollar && ch === '"') inIdent = !inIdent;

    if (!inString && !inIdent && ch === '$' && text[i + 1] === '$') {
      inDollar = !inDollar;
      cur += '$$';
      i++;
      continue;
    }

    if (!inString && !inIdent && !inDollar && ch === ';') {
      out.push(cur.trim());
      cur = '';
      continue;
    }

    cur += ch;
  }

  if (cur.trim()) out.push(cur.trim());
  return out.filter(Boolean);
}
