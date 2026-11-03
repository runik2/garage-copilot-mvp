// Каталог популярных в России/СНГ легковых автомобилей: по нему приложение
// узнаёт модель, показывает поколения/кузов и подсказывает, где легально взять
// документацию. Это НЕ ремонтные данные: ни моментов, ни объёмов здесь нет.
//
// Официальные порталы: адреса и условия меняются, проверяйте актуальность.
// Часть порталов платные (подписка на час/сутки/месяц) — это нормальная
// практика, обход оплаты в приложении не реализован и не поддерживается.

export interface CatalogEntry {
  make: string;
  model: string;
  years: string;
  body: string;
  /** Как модель ещё называют в объявлениях и документах */
  aliases?: string[];
}

export const CATALOG: CatalogEntry[] = [
  // ── LADA / ВАЗ ────────────────────────────────────────────────────────────
  {make: 'LADA', model: 'Granta', years: '2011–н.в.', body: 'седан/лифтбек/хэтчбек', aliases: ['ВАЗ 2190', 'Гранта']},
  {make: 'LADA', model: 'Vesta', years: '2015–н.в.', body: 'седан/универсал/кросс', aliases: ['Веста']},
  {make: 'LADA', model: 'Niva Legend', years: '1977–н.в.', body: 'внедорожник 3 дв.', aliases: ['4x4', 'Нива']},
  {make: 'LADA', model: 'Niva Travel', years: '1998–н.в.', body: 'внедорожник 5 дв.', aliases: ['Chevrolet Niva', 'Нива Тревел']},
  {make: 'LADA', model: 'Largus', years: '2012–н.в.', body: 'универсал/фургон', aliases: ['Ларгус']},
  {make: 'LADA', model: 'Vesta SW Cross', years: '2017–н.в.', body: 'универсал', aliases: ['Веста СВ Кросс']},

  // ── Kia ──────────────────────────────────────────────────────────────────
  {make: 'Kia', model: 'Rio', years: '2011–2023', body: 'седан/хэтчбек', aliases: ['Рио', 'Rio X']},
  {make: 'Kia', model: 'Ceed', years: '2007–н.в.', body: 'хэтчбек/универсал', aliases: ['Сид', 'ProCeed']},
  {make: 'Kia', model: 'Sportage', years: '2004–н.в.', body: 'кроссовер', aliases: ['Спортейдж']},
  {make: 'Kia', model: 'Seltos', years: '2019–н.в.', body: 'кроссовер', aliases: ['Селтос']},
  {make: 'Kia', model: 'K5', years: '2010–н.в.', body: 'седан', aliases: ['Optima', 'Оптима']},
  {make: 'Kia', model: 'Sorento', years: '2002–н.в.', body: 'кроссовер', aliases: ['Соренто']},
  {make: 'Kia', model: 'Soul', years: '2008–н.в.', body: 'хэтчбек', aliases: ['Соул']},
  {make: 'Kia', model: 'Cerato', years: '2004–н.в.', body: 'седан', aliases: ['Spectra', 'Серато']},

  // ── Hyundai ──────────────────────────────────────────────────────────────
  {make: 'Hyundai', model: 'Solaris', years: '2010–н.в.', body: 'седан/хэтчбек', aliases: ['Солярис', 'Accent']},
  {make: 'Hyundai', model: 'Creta', years: '2016–н.в.', body: 'кроссовер', aliases: ['Крета']},
  {make: 'Hyundai', model: 'Tucson', years: '2004–н.в.', body: 'кроссовер', aliases: ['Туссан', 'ix35']},
  {make: 'Hyundai', model: 'Elantra', years: '2000–н.в.', body: 'седан', aliases: ['Элантра', 'Avante']},
  {make: 'Hyundai', model: 'Santa Fe', years: '2000–н.в.', body: 'кроссовер', aliases: ['Санта Фе']},
  {make: 'Hyundai', model: 'i30', years: '2007–н.в.', body: 'хэтчбек/универсал'},
  {make: 'Hyundai', model: 'Accent', years: '1994–2011', body: 'седан/хэтчбек', aliases: ['Акцент', 'ТагАЗ Accent']},
  {make: 'Hyundai', model: 'Sonata', years: '1988–н.в.', body: 'седан', aliases: ['Соната']},

  // ── Toyota ───────────────────────────────────────────────────────────────
  {make: 'Toyota', model: 'Camry', years: '1982–н.в.', body: 'седан', aliases: ['Камри']},
  {make: 'Toyota', model: 'Corolla', years: '1966–н.в.', body: 'седан/хэтчбек', aliases: ['Королла']},
  {make: 'Toyota', model: 'RAV4', years: '1994–н.в.', body: 'кроссовер', aliases: ['Рав 4']},
  {make: 'Toyota', model: 'Land Cruiser 200', years: '2007–2021', body: 'внедорожник', aliases: ['LC200', 'Крузак']},
  {make: 'Toyota', model: 'Land Cruiser 300', years: '2021–н.в.', body: 'внедорожник', aliases: ['LC300']},
  {make: 'Toyota', model: 'Land Cruiser Prado', years: '1990–н.в.', body: 'внедорожник', aliases: ['Прадо', 'LC150']},
  {make: 'Toyota', model: 'Highlander', years: '2000–н.в.', body: 'кроссовер', aliases: ['Хайлендер']},
  {make: 'Toyota', model: 'Avensis', years: '1997–2018', body: 'седан/универсал'},
  {make: 'Toyota', model: 'C-HR', years: '2016–н.в.', body: 'кроссовер'},
  {make: 'Toyota', model: 'Hilux', years: '1968–н.в.', body: 'пикап', aliases: ['Хайлюкс']},

  // ── Renault / Dacia ──────────────────────────────────────────────────────
  {make: 'Renault', model: 'Logan', years: '2004–н.в.', body: 'седан', aliases: ['Логан']},
  {make: 'Renault', model: 'Sandero', years: '2008–н.в.', body: 'хэтчбек/степвей', aliases: ['Сандеро', 'Stepway']},
  {make: 'Renault', model: 'Duster', years: '2010–н.в.', body: 'кроссовер', aliases: ['Дастер']},
  {make: 'Renault', model: 'Kaptur', years: '2016–н.в.', body: 'кроссовер', aliases: ['Каптюр']},
  {make: 'Renault', model: 'Arkana', years: '2019–н.в.', body: 'кроссовер-купе', aliases: ['Аркана']},
  {make: 'Renault', model: 'Megane', years: '1995–н.в.', body: 'хэтчбек/седан', aliases: ['Меган']},
  {make: 'Renault', model: 'Scenic', years: '1996–н.в.', body: 'минивэн', aliases: ['Сценик']},

  // ── Volkswagen ───────────────────────────────────────────────────────────
  {make: 'Volkswagen', model: 'Polo', years: '1975–н.в.', body: 'седан/хэтчбек', aliases: ['Поло']},
  {make: 'Volkswagen', model: 'Tiguan', years: '2007–н.в.', body: 'кроссовер', aliases: ['Тигуан']},
  {make: 'Volkswagen', model: 'Passat', years: '1973–н.в.', body: 'седан/универсал', aliases: ['Пассат']},
  {make: 'Volkswagen', model: 'Golf', years: '1974–н.в.', body: 'хэтчбек', aliases: ['Гольф']},
  {make: 'Volkswagen', model: 'Jetta', years: '1979–н.в.', body: 'седан', aliases: ['Джетта']},
  {make: 'Volkswagen', model: 'Touareg', years: '2002–н.в.', body: 'кроссовер', aliases: ['Туарег']},
  {make: 'Volkswagen', model: 'Teramont', years: '2016–н.в.', body: 'кроссовер'},

  // ── Skoda ────────────────────────────────────────────────────────────────
  {make: 'Skoda', model: 'Octavia', years: '1996–н.в.', body: 'лифтбек/универсал', aliases: ['Октавия']},
  {make: 'Skoda', model: 'Rapid', years: '2012–2019', body: 'лифтбек', aliases: ['Рапид']},
  {make: 'Skoda', model: 'Fabia', years: '1999–н.в.', body: 'хэтчбек', aliases: ['Фабия']},
  {make: 'Skoda', model: 'Kodiaq', years: '2016–н.в.', body: 'кроссовер', aliases: ['Кодиак']},
  {make: 'Skoda', model: 'Karoq', years: '2017–н.в.', body: 'кроссовер', aliases: ['Карок']},
  {make: 'Skoda', model: 'Superb', years: '2001–н.в.', body: 'лифтбек', aliases: ['Суперб']},

  // ── Nissan ───────────────────────────────────────────────────────────────
  {make: 'Nissan', model: 'Qashqai', years: '2006–н.в.', body: 'кроссовер', aliases: ['Кашкай']},
  {make: 'Nissan', model: 'X-Trail', years: '2000–н.в.', body: 'кроссовер', aliases: ['Икстрейл']},
  {make: 'Nissan', model: 'Almera', years: '1995–2018', body: 'седан/хэтчбек', aliases: ['Альмера']},
  {make: 'Nissan', model: 'Juke', years: '2010–н.в.', body: 'кроссовер', aliases: ['Джук']},
  {make: 'Nissan', model: 'Terrano', years: '1985–н.в.', body: 'внедорожник', aliases: ['Террано']},
  {make: 'Nissan', model: 'Note', years: '2004–н.в.', body: 'хэтчбек', aliases: ['Ноут']},
  {make: 'Nissan', model: 'Murano', years: '2002–н.в.', body: 'кроссовер', aliases: ['Мурано']},

  // ── Ford ─────────────────────────────────────────────────────────────────
  {make: 'Ford', model: 'Focus', years: '1998–н.в.', body: 'седан/хэтчбек', aliases: ['Фокус']},
  {make: 'Ford', model: 'Mondeo', years: '1992–н.в.', body: 'седан/хэтчбек', aliases: ['Мондео']},
  {make: 'Ford', model: 'Kuga', years: '2008–н.в.', body: 'кроссовер', aliases: ['Куга', 'Escape']},
  {make: 'Ford', model: 'Fiesta', years: '1976–н.в.', body: 'хэтчбек', aliases: ['Фиеста']},
  {make: 'Ford', model: 'Explorer', years: '1990–н.в.', body: 'кроссовер', aliases: ['Эксплорер']},
  {make: 'Ford', model: 'Transit', years: '1965–н.в.', body: 'фургон', aliases: ['Транзит']},

  // ── Chevrolet / Daewoo / Opel ────────────────────────────────────────────
  {make: 'Chevrolet', model: 'Cruze', years: '2008–2016', body: 'седан/хэтчбек', aliases: ['Круз']},
  {make: 'Chevrolet', model: 'Aveo', years: '2002–2011', body: 'седан/хэтчбек', aliases: ['Авео']},
  {make: 'Chevrolet', model: 'Lacetti', years: '2002–2013', body: 'седан/хэтчбек', aliases: ['Лачетти']},
  {make: 'Chevrolet', model: 'Captiva', years: '2006–2018', body: 'кроссовер', aliases: ['Каптива']},
  {make: 'Chevrolet', model: 'Orlando', years: '2011–2018', body: 'минивэн', aliases: ['Орландо']},
  {make: 'Chevrolet', model: 'Niva', years: '2002–2020', body: 'внедорожник', aliases: ['Шевроле Нива']},
  {make: 'Daewoo', model: 'Nexia', years: '1994–2016', body: 'седан', aliases: ['Нексия']},
  {make: 'Daewoo', model: 'Matiz', years: '1998–2010', body: 'хэтчбек', aliases: ['Матиз']},
  {make: 'Opel', model: 'Astra', years: '1991–н.в.', body: 'седан/хэтчбек', aliases: ['Астра']},
  {make: 'Opel', model: 'Insignia', years: '2008–н.в.', body: 'седан/хэтчбек', aliases: ['Инсигния']},
  {make: 'Opel', model: 'Corsa', years: '1982–н.в.', body: 'хэтчбек', aliases: ['Корса']},
  {make: 'Opel', model: 'Mokka', years: '2012–н.в.', body: 'кроссовер', aliases: ['Мокка']},

  // ── Mitsubishi ───────────────────────────────────────────────────────────
  {make: 'Mitsubishi', model: 'Outlander', years: '2001–н.в.', body: 'кроссовер', aliases: ['Аутлендер']},
  {make: 'Mitsubishi', model: 'Lancer X', years: '2007–2017', body: 'седан', aliases: ['Лансер']},
  {make: 'Mitsubishi', model: 'ASX', years: '2010–н.в.', body: 'кроссовер', aliases: ['АСХ']},
  {make: 'Mitsubishi', model: 'Pajero', years: '1982–н.в.', body: 'внедорожник', aliases: ['Паджеро']},
  {make: 'Mitsubishi', model: 'Pajero Sport', years: '1996–н.в.', body: 'внедорожник'},
  {make: 'Mitsubishi', model: 'Eclipse Cross', years: '2017–н.в.', body: 'кроссовер'},

  // ── Mazda ────────────────────────────────────────────────────────────────
  {make: 'Mazda', model: '3', years: '2003–н.в.', body: 'седан/хэтчбек', aliases: ['Mazda3', 'Мазда 3']},
  {make: 'Mazda', model: '6', years: '2002–н.в.', body: 'седан/универсал', aliases: ['Mazda6', 'Мазда 6']},
  {make: 'Mazda', model: 'CX-5', years: '2011–н.в.', body: 'кроссовер'},
  {make: 'Mazda', model: 'CX-7', years: '2006–2012', body: 'кроссовер'},

  // ── BMW / Mercedes / Audi / Volvo ────────────────────────────────────────
  {make: 'BMW', model: '3 Series', years: '1975–н.в.', body: 'седан/универсал', aliases: ['E90', 'F30', 'G20', '320i']},
  {make: 'BMW', model: '5 Series', years: '1972–н.в.', body: 'седан', aliases: ['E60', 'F10', 'G30', '520d']},
  {make: 'BMW', model: 'X3', years: '2003–н.в.', body: 'кроссовер', aliases: ['E83', 'F25', 'G01']},
  {make: 'BMW', model: 'X5', years: '1999–н.в.', body: 'кроссовер', aliases: ['E53', 'E70', 'F15']},
  {make: 'Mercedes-Benz', model: 'C-Class', years: '1993–н.в.', body: 'седан', aliases: ['W204', 'W205', 'C200']},
  {make: 'Mercedes-Benz', model: 'E-Class', years: '1995–н.в.', body: 'седан', aliases: ['W212', 'W213', 'E200']},
  {make: 'Mercedes-Benz', model: 'GLC', years: '2015–н.в.', body: 'кроссовер', aliases: ['GLK', 'X253']},
  {make: 'Mercedes-Benz', model: 'Sprinter', years: '1995–н.в.', body: 'фургон', aliases: ['Спринтер']},
  {make: 'Audi', model: 'A4', years: '1994–н.в.', body: 'седан/универсал', aliases: ['B8', 'B9']},
  {make: 'Audi', model: 'A6', years: '1994–н.в.', body: 'седан', aliases: ['C6', 'C7', 'C8']},
  {make: 'Audi', model: 'Q5', years: '2008–н.в.', body: 'кроссовер'},
  {make: 'Audi', model: 'A3', years: '1996–н.в.', body: 'хэтчбек/седан'},
  {make: 'Volvo', model: 'XC60', years: '2008–н.в.', body: 'кроссовер'},
  {make: 'Volvo', model: 'XC90', years: '2002–н.в.', body: 'кроссовер'},
  {make: 'Volvo', model: 'S60', years: '2000–н.в.', body: 'седан'},
  {make: 'Volvo', model: 'V40', years: '1996–2019', body: 'хэтчбек'},

  // ── Honda / Subaru / Suzuki ──────────────────────────────────────────────
  {make: 'Honda', model: 'CR-V', years: '1995–н.в.', body: 'кроссовер', aliases: ['СР-В']},
  {make: 'Honda', model: 'Civic', years: '1972–н.в.', body: 'седан/хэтчбек', aliases: ['Цивик']},
  {make: 'Honda', model: 'Accord', years: '1976–н.в.', body: 'седан', aliases: ['Аккорд']},
  {make: 'Subaru', model: 'Forester', years: '1997–н.в.', body: 'кроссовер', aliases: ['Форестер']},
  {make: 'Subaru', model: 'Outback', years: '1994–н.в.', body: 'универсал', aliases: ['Аутбек']},
  {make: 'Subaru', model: 'Impreza', years: '1992–н.в.', body: 'седан/хэтчбек'},
  {make: 'Suzuki', model: 'Vitara', years: '1988–н.в.', body: 'кроссовер', aliases: ['Витара']},
  {make: 'Suzuki', model: 'SX4', years: '2006–2014', body: 'хэтчбек/седан', aliases: ['SX4 Classic']},
  {make: 'Suzuki', model: 'Jimny', years: '1970–н.в.', body: 'внедорожник', aliases: ['Джимни']},

  // ── Peugeot / Citroen ────────────────────────────────────────────────────
  {make: 'Peugeot', model: '308', years: '2007–н.в.', body: 'хэтчбек/седан'},
  {make: 'Peugeot', model: '408', years: '2012–н.в.', body: 'седан'},
  {make: 'Peugeot', model: '3008', years: '2009–н.в.', body: 'кроссовер'},
  {make: 'Peugeot', model: '2008', years: '2013–н.в.', body: 'кроссовер'},
  {make: 'Citroen', model: 'C4', years: '2004–н.в.', body: 'хэтчбек/седан'},
  {make: 'Citroen', model: 'C5', years: '2001–2017', body: 'седан/универсал'},
  {make: 'Citroen', model: 'Berlingo', years: '1996–н.в.', body: 'фургон'},

  // ── Китайские марки ──────────────────────────────────────────────────────
  {make: 'Chery', model: 'Tiggo 4', years: '2017–н.в.', body: 'кроссовер'},
  {make: 'Chery', model: 'Tiggo 7 Pro', years: '2016–н.в.', body: 'кроссовер'},
  {make: 'Chery', model: 'Tiggo 8 Pro', years: '2018–н.в.', body: 'кроссовер'},
  {make: 'Chery', model: 'Arrizo 8', years: '2022–н.в.', body: 'седан'},
  {make: 'Geely', model: 'Coolray', years: '2018–н.в.', body: 'кроссовер'},
  {make: 'Geely', model: 'Atlas', years: '2016–н.в.', body: 'кроссовер', aliases: ['Atlas Pro']},
  {make: 'Geely', model: 'Tugella', years: '2019–н.в.', body: 'кроссовер-купе'},
  {make: 'Geely', model: 'Monjaro', years: '2021–н.в.', body: 'кроссовер'},
  {make: 'Geely', model: 'Emgrand', years: '2009–н.в.', body: 'седан'},
  {make: 'Haval', model: 'Jolion', years: '2021–н.в.', body: 'кроссовер'},
  {make: 'Haval', model: 'F7', years: '2018–н.в.', body: 'кроссовер', aliases: ['F7x']},
  {make: 'Haval', model: 'Dargo', years: '2021–н.в.', body: 'кроссовер'},
  {make: 'Haval', model: 'H9', years: '2014–н.в.', body: 'внедорожник'},
  {make: 'Exeed', model: 'TXL', years: '2019–н.в.', body: 'кроссовер'},
  {make: 'Exeed', model: 'VX', years: '2020–н.в.', body: 'кроссовер'},
  {make: 'Changan', model: 'CS35 Plus', years: '2018–н.в.', body: 'кроссовер'},
  {make: 'Changan', model: 'CS75', years: '2014–н.в.', body: 'кроссовер'},
  {make: 'Omoda', model: 'C5', years: '2022–н.в.', body: 'кроссовер'},

  // ── Прочие массовые ──────────────────────────────────────────────────────
  {make: 'UAZ', model: 'Patriot', years: '2005–н.в.', body: 'внедорожник', aliases: ['Патриот']},
  {make: 'UAZ', model: 'Hunter', years: '2003–н.в.', body: 'внедорожник', aliases: ['Хантер']},
  {make: 'SsangYong', model: 'Actyon', years: '2005–2018', body: 'кроссовер', aliases: ['Актион']},
  {make: 'SsangYong', model: 'Kyron', years: '2005–2015', body: 'кроссовер', aliases: ['Кайрон']},
  {make: 'Datsun', model: 'on-DO', years: '2014–2020', body: 'седан'},
  {make: 'Lexus', model: 'RX', years: '1998–н.в.', body: 'кроссовер'},
  {make: 'Lexus', model: 'ES', years: '1989–н.в.', body: 'седан'},
  {make: 'Lexus', model: 'NX', years: '2014–н.в.', body: 'кроссовер'},
  {make: 'Infiniti', model: 'QX70', years: '2002–2017', body: 'кроссовер', aliases: ['FX']},
  {make: 'Jeep', model: 'Grand Cherokee', years: '1992–н.в.', body: 'внедорожник'},
  {make: 'Land Rover', model: 'Range Rover Evoque', years: '2011–н.в.', body: 'кроссовер'},
  {make: 'Land Rover', model: 'Discovery', years: '1989–н.в.', body: 'внедорожник'},
  {make: 'Porsche', model: 'Cayenne', years: '2002–н.в.', body: 'кроссовер'},
  {make: 'Porsche', model: 'Macan', years: '2014–н.в.', body: 'кроссовер'},
];

export interface OfficialSource {
  label: string;
  url: string;
  note?: string;
}

/**
 * Куда идти за легальной документацией. Часть порталов платные: подписка на
 * доступ — обычная практика. Приложение не обходит оплату и не хранит чужие
 * файлы: вы скачиваете документ сами и загружаете его в «Мои источники».
 */
const ERWIN_NOTE = 'официальный портал VAG, платная подписка на доступ';

export const OFFICIAL_SOURCES: Record<string, OfficialSource[]> = {
  'Volkswagen': [{label: 'erWin Volkswagen', url: 'https://erwin.volkswagen.de', note: ERWIN_NOTE}],
  'Audi': [{label: 'erWin Audi', url: 'https://erwin.audi.com', note: ERWIN_NOTE}],
  'Skoda': [{label: 'erWin Skoda', url: 'https://erwin.skoda-auto.cz', note: ERWIN_NOTE}],
  'Toyota': [{label: 'Toyota Technical Information (TIS)', url: 'https://www.toyota-tech.eu', note: 'платная подписка'}],
  'Lexus': [{label: 'Toyota/Lexus TIS', url: 'https://www.toyota-tech.eu', note: 'платная подписка'}],
  'Kia': [{label: 'Kia Technical Information', url: 'https://www.kiatechinfo.com'}],
  'Hyundai': [{label: 'Hyundai Service (HMAService)', url: 'https://www.hmaservice.com'}],
  'Nissan': [{label: 'Nissan TechInfo', url: 'https://www.nissan-techinfo.com'}],
  'Infiniti': [{label: 'Nissan/Infiniti TechInfo', url: 'https://www.nissan-techinfo.com'}],
  'Ford': [{label: 'Motorcraft Service', url: 'https://www.motorcraftservice.com'}],
  'Mitsubishi': [{label: 'Mitsubishi TechInfo', url: 'https://www.mitsubishitechinfo.com'}],
  'Honda': [{label: 'Honda TechInfo', url: 'https://techinfo.honda.com'}],
  'Subaru': [{label: 'Subaru Technical Information', url: 'https://techinfo.subaru.com'}],
  'Volvo': [{label: 'Volvo TechInfo', url: 'https://www.volvotechinfo.com'}],
  'BMW': [{label: 'BMW Technical Information System', url: 'https://www.bmwtis.com'}],
  'Mercedes-Benz': [{label: 'Mercedes-Benz StarTekInfo', url: 'https://www.startekinfo.com'}],
  'Chevrolet': [{label: 'ACDelco TechConnect (GM)', url: 'https://www.acdelcotechconnect.com'}],
  'Peugeot': [{label: 'Service Box Peugeot', url: 'https://public.servicebox.peugeot.com'}],
  'Citroen': [{label: 'Service Box Citroen', url: 'https://public.servicebox.citroen.com'}],
  'LADA': [{label: 'LADA — руководства и документация', url: 'https://www.lada.ru', note: 'руководства владельца на сайте производителя'}],
  'Renault': [{label: 'Renault — документация', url: 'https://www.renault.ru', note: 'руководства владельца'}],
  'Chery': [{label: 'Chery Россия', url: 'https://www.chery.ru', note: 'руководства владельца в PDF'}],
  'Geely': [{label: 'Geely Россия', url: 'https://www.geely-motors.com', note: 'руководства владельца в PDF'}],
  'Haval': [{label: 'Haval Россия', url: 'https://haval.ru', note: 'руководства владельца в PDF'}],
  'Exeed': [{label: 'EXEED Россия', url: 'https://exeed.ru', note: 'руководства владельца в PDF'}],
  'UAZ': [{label: 'УАЗ — документация', url: 'https://www.uaz.ru', note: 'руководства владельца'}],
};

/** Сколько позиций в каталоге — используется в интерфейсе. */
export const CATALOG_SIZE = CATALOG.length;
