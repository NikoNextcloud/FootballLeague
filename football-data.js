/* Shared data rules: source standings are authoritative; times belong to Bulgaria. */
(function (root) {
  'use strict';
  const TIME_ZONE = 'Europe/Sofia';
  const FINISHED = new Set(['finished', 'final', 'FT', 'AET', 'PEN', 'awarded']);
  const INACTIVE = new Set(['postponed', 'cancelled', 'abandoned', 'suspended']);
  const score = value => value !== null && value !== undefined && value !== '' && /^\d+$/.test(String(value));
  function played(event) {
    return !INACTIVE.has(event.status) && score(event.intHomeScore) && score(event.intAwayScore)
      && (!event.status || FINISHED.has(event.status));
  }
  function dateKey(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
    const get = type => parts.find(p => p.type === type)?.value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  }
  function kickoff(event) {
    if (event.kickoffAt && Number.isFinite(Date.parse(event.kickoffAt))) return Date.parse(event.kickoffAt);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(event.dateEvent || '') || !/^\d{1,2}:\d{2}(:\d{2})?$/.test(event.strTime || '')) return NaN;
    const [y, m, d] = event.dateEvent.split('-').map(Number);
    const [h, min, sec = 0] = event.strTime.split(':').map(Number);
    if (h > 23 || min > 59 || sec > 59) return NaN;
    const target = Date.UTC(y, m - 1, d, h, min, sec);
    if (new Date(target).toISOString().slice(0, 10) !== event.dateEvent) return NaN;
    // Resolve the named timezone on the event date, including summer/winter time.
    let instant = target;
    for (let i = 0; i < 3; i++) {
      const p = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(instant));
      const n = type => Number(p.find(part => part.type === type).value);
      const wall = Date.UTC(n('year'), n('month') - 1, n('day'), n('hour'), n('minute'), n('second'));
      const delta = target - wall;
      instant += delta;
      if (!delta) break;
    }
    return instant;
  }
  function upcoming(event, now = Date.now()) {
    if (played(event) || INACTIVE.has(event.status) || FINISHED.has(event.status) || ['LIVE','1H','2H','HT','ET','P'].includes(event.status) || !event.dateEvent) return false;
    const start = kickoff(event);
    return Number.isFinite(start) ? start >= now : event.dateEvent >= dateKey(new Date(now));
  }
  function compareEvents(a, b) {
    return `${a.dateEvent || '9999'}T${a.strTime || '23:59:59'}`.localeCompare(`${b.dateEvent || '9999'}T${b.strTime || '23:59:59'}`);
  }
  function validateSnapshot(file, normalized = false) {
    if (!file || !Array.isArray(file.table) || file.table.length < 10 || file.table.length > 24 || !Array.isArray(file.events) || !file.events.length) return false;
    const checked = Date.parse(file.lastSuccessAt || file.updatedAt);
    if (!Number.isFinite(checked) || checked > Date.now() + 5 * 60_000) return false;
    if (!/^20\d{2}-20\d{2}$/.test(file.season || '')) return false;
    const validNumber = value => (typeof value === 'number' || (typeof value === 'string' && /^-?\d+$/.test(value))) && Number.isFinite(Number(value)) && Number.isInteger(Number(value));
    const names = file.table.map(row => row?.strTeam);
    if (names.some(name => typeof name !== 'string' || !name.trim()) || new Set(names).size !== names.length) return false;
    if (!file.table.every((row, index) => ['intRank','intPoints','intPlayed','intWin','intDraw','intLoss','intGoalsFor','intGoalsAgainst','intGoalDifference'].every(key=>validNumber(row[key])) && Number(row.intRank) === index+1 && Number(row.intPlayed) >= 0)) return false;
    if (['scorers','warnings'].some(key => file[key] !== undefined && !Array.isArray(file[key]))) return false;
    if (file.scorers && !file.scorers.every(scorer=>scorer && typeof scorer.player === 'string' && typeof scorer.team === 'string' && validNumber(scorer.goals))) return false;
    if (file.europe != null && (typeof file.europe !== 'object' || !Array.isArray(file.europe.events) || !Array.isArray(file.europe.participants))) return false;
    if (file.europe && (!file.europe.events.every(event=>event && typeof event.strHomeTeam === 'string' && typeof event.strAwayTeam === 'string') || !file.europe.participants.every(item=>item && typeof item.team === 'string' && typeof item.competition === 'string'))) return false;
    if (!file.events.every(event => event && typeof event.strHomeTeam === 'string' && typeof event.strAwayTeam === 'string'
        && /^\d{4}-\d{2}-\d{2}$/.test(event.dateEvent || '') && names.includes(event.strHomeTeam) && names.includes(event.strAwayTeam))) return false;
    if (normalized && (!Array.isArray(file.teams) || file.teams.length !== names.length || !file.teams.every(team => team && typeof team.idTeam === 'string' && names.includes(team.strTeam)))) return false;
    return true;
  }
  function health(data, now = Date.now()) {
    const checked = data?.lastSuccessAt || data?.updatedAt;
    const age = now - Date.parse(checked);
    if (!Number.isFinite(age) || age < -5 * 60_000) return { level: 'unknown', label: 'Няма потвърдена проверка', checked: null };
    if (data?.offline) return { level: 'offline', label: 'Запазени данни · без връзка', checked };
    if (age > 6 * 60 * 60_000) return { level: 'stale', label: 'Данните се нуждаят от обновяване', checked };
    if (data?.warnings?.length) return { level: 'partial', label: 'Данни с предупреждение от източника', checked };
    return { level: 'fresh', label: 'Последна успешна проверка', checked };
  }
  root.FootballData = { TIME_ZONE, played, kickoff, upcoming, dateKey, compareEvents, validateSnapshot, health };
  if (typeof module !== 'undefined') module.exports = root.FootballData;
})(typeof globalThis !== 'undefined' ? globalThis : this);
