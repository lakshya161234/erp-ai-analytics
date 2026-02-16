const { DateTime } = require('luxon');

/**
 * Minimal fixed-date holiday calendar (India-centric) for demo.
 * NOTE: movable holidays (Diwali, Eid, etc.) are not included.
 */
function getFixedHolidaysForYear(year, zone = 'Asia/Kolkata') {
  const mk = (month, day, name) => ({
    date: DateTime.fromObject({ year, month, day }, { zone }).toFormat('yyyy-LL-dd'),
    name,
  });

  return [
    mk(1, 1, 'New Year'),
    mk(1, 26, 'Republic Day (IN)'),
    mk(8, 15, 'Independence Day (IN)'),
    mk(10, 2, 'Gandhi Jayanti (IN)'),
    mk(12, 25, 'Christmas'),
  ];
}

function indexHolidays({ fromISO, toISO, zone = 'Asia/Kolkata' }) {
  const from = DateTime.fromISO(fromISO, { zone });
  const to = DateTime.fromISO(toISO, { zone });

  const years = new Set();
  for (let y = from.year; y <= to.year; y++) years.add(y);

  const map = new Map();
  for (const y of years) {
    for (const h of getFixedHolidaysForYear(y, zone)) {
      map.set(h.date, h.name);
    }
  }
  return map;
}

module.exports = { getFixedHolidaysForYear, indexHolidays };
