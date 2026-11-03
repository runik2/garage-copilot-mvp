import {Router} from 'express';
import {query} from './db.js';
import {requireAuth} from './auth.js';

/**
 * Подтверждённые значения (моменты затяжки, объёмы, номиналы).
 *
 * Ключевая идея: приложение не выдумывает цифры. Пользователь находит нужную
 * страницу в своём PDF и один раз привязывает значение к автомобилю; после
 * этого во всех шагах руководства вместо «не подтверждено» показывается
 * значение вместе с источником и номером страницы.
 */
export const guideRouter = Router();

async function ownsVehicle(vehicleId, userId) {
  const r = await query('select 1 from vehicles where id=$1 and user_id=$2', [vehicleId, userId]);
  return r.rowCount > 0;
}

// Список подтверждённых значений по автомобилю
guideRouter.get('/specs', requireAuth, async (req, res, next) => {
  try {
    const vehicleId = req.query.vehicle_id;
    if (!vehicleId) return res.status(400).json({error: 'Не указан автомобиль'});
    if (!await ownsVehicle(vehicleId, req.user.sub)) return res.status(404).json({error: 'Автомобиль не найден'});
    const r = await query(
      `select vs.*, s.title as source_title, s.publisher as source_publisher
         from vehicle_specs vs left join sources s on s.id = vs.source_id
        where vs.vehicle_id = $1
        order by vs.spec_key`,
      [vehicleId]
    );
    res.json(r.rows);
  } catch (e) { next(e); }
});

// Создать или обновить подтверждённое значение
guideRouter.post('/specs', requireAuth, async (req, res, next) => {
  try {
    const {vehicle_id, spec_key, value, unit, source_id, source_page, note} = req.body || {};
    if (!vehicle_id || !spec_key) return res.status(400).json({error: 'Нужны vehicle_id и spec_key'});
    if (!value || !String(value).trim()) return res.status(400).json({error: 'Укажите значение'});
    if (!await ownsVehicle(vehicle_id, req.user.sub)) return res.status(404).json({error: 'Автомобиль не найден'});

    // Источник должен принадлежать пользователю: иначе можно сослаться на чужой файл
    if (source_id) {
      const own = await query('select 1 from sources where id=$1 and user_id=$2', [source_id, req.user.sub]);
      if (!own.rowCount) return res.status(404).json({error: 'Источник не найден'});
    }

    const r = await query(
      `insert into vehicle_specs(vehicle_id, spec_key, value, unit, source_id, source_page, note)
       values($1,$2,$3,$4,$5,$6,$7)
       on conflict(vehicle_id, spec_key) do update
         set value=excluded.value, unit=excluded.unit, source_id=excluded.source_id,
             source_page=excluded.source_page, note=excluded.note, updated_at=now()
       returning *`,
      [vehicle_id, spec_key, String(value).trim(), unit || null, source_id || null,
       Number.isInteger(source_page) ? source_page : (source_page ? Number(source_page) : null), note || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { next(e); }
});

guideRouter.delete('/specs/:id', requireAuth, async (req, res, next) => {
  try {
    const r = await query(
      `delete from vehicle_specs vs using vehicles v
        where vs.id=$1 and v.id=vs.vehicle_id and v.user_id=$2 returning vs.id`,
      [req.params.id, req.user.sub]
    );
    if (!r.rowCount) return res.status(404).json({error: 'Значение не найдено'});
    res.json({ok: true});
  } catch (e) { next(e); }
});

// Полный текст страницы источника — чтобы открыть её рядом с шагом
guideRouter.get('/sources/:id/pages/:page', requireAuth, async (req, res, next) => {
  try {
    const r = await query(
      `select sp.page_number, sp.content, s.title, s.publisher, s.source_date, s.id as source_id
         from source_pages sp join sources s on s.id = sp.source_id
        where sp.source_id=$1 and sp.page_number=$2 and s.user_id=$3`,
      [req.params.id, Number(req.params.page), req.user.sub]
    );
    if (!r.rowCount) return res.status(404).json({error: 'Страница не найдена'});
    res.json(r.rows[0]);
  } catch (e) { next(e); }
});

// Поиск по страницам источников с учётом автомобиля (для руководства)
guideRouter.get('/pages/search', requireAuth, async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    const vehicleId = req.query.vehicle_id;
    if (!q) return res.json([]);

    const params = [req.user.sub, `%${q}%`];
    let filter = '';
    if (vehicleId) {
      params.push(vehicleId);
      filter = ` and (s.vehicle_id = $3 or s.vehicle_id is null)`;
    }
    const r = await query(
      `select sp.source_id, sp.page_number, left(sp.content, 900) as content,
              s.title, s.node, s.publisher
         from source_pages sp join sources s on s.id = sp.source_id
        where s.user_id = $1 and sp.content ilike $2${filter}
        order by sp.source_id, sp.page_number
        limit 25`,
      params
    );
    res.json(r.rows);
  } catch (e) { next(e); }
});
