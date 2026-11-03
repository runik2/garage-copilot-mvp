import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import {pool, exec} from './db.js';
import {splitStatements} from './sql-split.js';

// Применяет все db/*.sql по порядку — так новые таблицы можно добавлять
// отдельными файлами, не переписывая схему.
const dir = new URL('../db/', import.meta.url);
const files = (await fs.readdir(dir)).filter(f => f.endsWith('.sql')).sort();

for (const f of files) {
  const sql = await fs.readFile(new URL(f, dir), 'utf8');
  const statements = splitStatements(sql);
  for (const statement of statements) await exec(statement);
  console.log(`Применено: db/${f} (${statements.length} команд)`);
}

const email = process.env.ADMIN_EMAIL || 'owner@local';
const password = process.env.ADMIN_PASSWORD || 'change-me-now';
const hash = await bcrypt.hash(password, 12);
await pool.query(
  'insert into users(email,password_hash) values($1,$2) on conflict(email) do update set password_hash=excluded.password_hash',
  [email, hash]
);
console.log(`Database ready. Single owner: ${email}`);
console.log(`Файлы миграций: ${files.join(', ')} → ${path.resolve(process.cwd(), 'db')}`);
await pool.end();
