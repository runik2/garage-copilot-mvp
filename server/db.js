import 'dotenv/config';
import pg from 'pg';

/**
 * Два режима базы:
 *  • обычный — внешний PostgreSQL по DATABASE_URL (Docker, локальная установка);
 *  • локальный — PGlite (настоящий PostgreSQL в WASM) прямо в процессе Node,
 *    если DATABASE_URL не задан или указан DB_MODE=local. Docker не нужен.
 *
 * Наружу отдаётся единый интерфейс:
 *   query(text, params) → {rows, rowCount}   — один запрос с параметрами
 *   exec(sql)                                — скрипт из нескольких команд
 * Поэтому остальной серверный код про режим ничего не знает.
 */

const url = process.env.DATABASE_URL;
const useLocal = !url || process.env.DB_MODE === 'local' || url.startsWith('pglite:');

let query;
let exec;
let pool;

if (useLocal) {
  const {PGlite} = await import('@electric-sql/pglite');
  const dir = process.env.PGLITE_DIR || './data/pgdata';
  const db = await PGlite.create(dir);

  // PGlite выполняет SQL через prepared statements, поэтому многооператорные
  // скрипты идут отдельным методом exec.
  exec = sql => db.exec(sql);

  query = async (text, params = []) => {
    const result = await db.query(text, params);
    // PGlite всегда отдаёт affectedRows (для SELECT это 0), поэтому нельзя
    // слепо предпочитать его длине rows — иначе SELECT «не находит» строки.
    const rowCount = result.rows.length > 0
      ? result.rows.length
      : (typeof result.affectedRows === 'number' ? result.affectedRows : 0);
    return {rows: result.rows, rowCount};
  };

  pool = {query, exec, end: () => db.close()};

  if (process.env.DB_SILENT !== '1') console.log(`[db] локальный PostgreSQL (PGlite) → ${dir}`);
} else {
  pool = new pg.Pool({connectionString: url, max: 10});
  query = (text, params = []) => pool.query(text, params);
  exec = sql => pool.query(sql);
  if (process.env.DB_SILENT !== '1') console.log('[db] внешний PostgreSQL по DATABASE_URL');
}

export {query, exec, pool};
export const isLocalDb = useLocal;
