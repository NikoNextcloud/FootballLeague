// Mock league data for the UI kit — modeled on src/types.ts shapes,
// with plausible Bulgarian club names/stats standing in for live TheSportsDB data.
window.MOCK = (function () {
  const T = (id, name, file, stadium) => ({
    idTeam: id,
    strTeam: name,
    strBadge: `../../assets/teams/${file}`,
    strStadium: stadium,
    strDescriptionEN:
      name === "Лудогорец"
        ? "Ludogorets Razgrad is the most successful Bulgarian club of the last decade, a fixture in European group stages representing the town of Razgrad."
        : name === "Левски"
        ? "Levski Sofia is one of Bulgaria's most decorated and widely supported clubs, based in the capital Sofia."
        : `${name} is a founding member club of Bulgaria's top football division.`,
    intFormedYear: "1945",
  });

  const teams = [
    T("t1", "Лудогорец", "ludogorets.png", "Huvepharma Arena"),
    T("t2", "Левски", "levski.png", "Стадион Георги Аспарухов"),
    T("t3", "ЦСКА", "cska.png", "Българска армия"),
    T("t4", "Славия", "slavia.png", "Славия"),
    T("t5", "Локомотив Пловдив", "lokomotiv-plovdiv.png", "Локомотив"),
    T("t6", "Черно море", "cherno-more.png", "Тича"),
    T("t7", "Ботев Пловдив", "botev-plovdiv.png", "Христо Ботев"),
    T("t8", "ЦСКА 1948", "cska-1948.png", "Българска армия"),
    T("t9", "Спартак Варна", "spartak-varna.png", "Спартак"),
    T("t10", "Локомотив София", "lokomotiv-sofia.png", "Locomotive Sofia"),
    T("t11", "Дунав Русе", "dunav-ruse.png", "Дунав"),
    T("t12", "Септември София", "septemvri-sofia.png", "Septemvri"),
    T("t13", "Ботев Враца", "botev-vratsa.jpg", "Христо Ботев"),
    T("t14", "Арда", "arda.png", "Арда"),
  ];

  const table = [
    { idTeam: "t1", strTeam: "Лудогорец", strBadge: teams[0].strBadge, intRank: "1", intPlayed: "30", intWin: "22", intDraw: "5", intLoss: "3", intGoalsFor: "60", intGoalsAgainst: "20", intGoalDifference: "40", intPoints: "71", strForm: "ППППР" },
    { idTeam: "t2", strTeam: "Левски", strBadge: teams[1].strBadge, intRank: "2", intPlayed: "30", intWin: "19", intDraw: "6", intLoss: "5", intGoalsFor: "55", intGoalsAgainst: "28", intGoalDifference: "27", intPoints: "63", strForm: "ППРПЗ" },
    { idTeam: "t3", strTeam: "ЦСКА", strBadge: teams[2].strBadge, intRank: "3", intPlayed: "30", intWin: "17", intDraw: "7", intLoss: "6", intGoalsFor: "50", intGoalsAgainst: "30", intGoalDifference: "20", intPoints: "58", strForm: "РППЗП" },
    { idTeam: "t4", strTeam: "Славия", strBadge: teams[3].strBadge, intRank: "4", intPlayed: "30", intWin: "15", intDraw: "8", intLoss: "7", intGoalsFor: "44", intGoalsAgainst: "32", intGoalDifference: "12", intPoints: "53", strForm: "ППЗРП" },
    { idTeam: "t5", strTeam: "Локомотив Пловдив", strBadge: teams[4].strBadge, intRank: "5", intPlayed: "30", intWin: "13", intDraw: "9", intLoss: "8", intGoalsFor: "40", intGoalsAgainst: "34", intGoalDifference: "6", intPoints: "48", strForm: "ЗППРЗ" },
    { idTeam: "t6", strTeam: "Черно море", strBadge: teams[5].strBadge, intRank: "6", intPlayed: "30", intWin: "12", intDraw: "9", intLoss: "9", intGoalsFor: "38", intGoalsAgainst: "35", intGoalDifference: "3", intPoints: "45", strForm: "РЗППЗ" },
    { idTeam: "t7", strTeam: "Ботев Пловдив", strBadge: teams[6].strBadge, intRank: "7", intPlayed: "30", intWin: "11", intDraw: "8", intLoss: "11", intGoalsFor: "36", intGoalsAgainst: "37", intGoalDifference: "-1", intPoints: "41", strForm: "ЗРЗПП" },
    { idTeam: "t8", strTeam: "ЦСКА 1948", strBadge: teams[7].strBadge, intRank: "8", intPlayed: "30", intWin: "10", intDraw: "8", intLoss: "12", intGoalsFor: "34", intGoalsAgainst: "38", intGoalDifference: "-4", intPoints: "38", strForm: "ППЗЗР" },
    { idTeam: "t9", strTeam: "Спартак Варна", strBadge: teams[8].strBadge, intRank: "9", intPlayed: "30", intWin: "9", intDraw: "8", intLoss: "13", intGoalsFor: "32", intGoalsAgainst: "40", intGoalDifference: "-8", intPoints: "35", strForm: "ЗЗРПЗ" },
    { idTeam: "t10", strTeam: "Локомотив София", strBadge: teams[9].strBadge, intRank: "10", intPlayed: "30", intWin: "8", intDraw: "9", intLoss: "13", intGoalsFor: "30", intGoalsAgainst: "41", intGoalDifference: "-11", intPoints: "33", strForm: "РЗЗПЗ" },
    { idTeam: "t11", strTeam: "Дунав Русе", strBadge: teams[10].strBadge, intRank: "11", intPlayed: "30", intWin: "8", intDraw: "7", intLoss: "15", intGoalsFor: "29", intGoalsAgainst: "45", intGoalDifference: "-16", intPoints: "31", strForm: "ЗПЗРЗ" },
    { idTeam: "t12", strTeam: "Септември София", strBadge: teams[11].strBadge, intRank: "12", intPlayed: "30", intWin: "7", intDraw: "8", intLoss: "15", intGoalsFor: "27", intGoalsAgainst: "47", intGoalDifference: "-20", intPoints: "29", strForm: "ЗЗПЗР" },
    { idTeam: "t13", strTeam: "Ботев Враца", strBadge: teams[12].strBadge, intRank: "13", intPlayed: "30", intWin: "6", intDraw: "7", intLoss: "17", intGoalsFor: "26", intGoalsAgainst: "50", intGoalDifference: "-24", intPoints: "25", strForm: "ЗЗЗПЗ" },
    { idTeam: "t14", strTeam: "Арда", strBadge: teams[13].strBadge, intRank: "14", intPlayed: "30", intWin: "5", intDraw: "7", intLoss: "18", intGoalsFor: "24", intGoalsAgainst: "55", intGoalDifference: "-31", intPoints: "22", strForm: "ЗЗРЗП" },
  ];

  const next = [
    { idEvent: "e1", strHomeTeam: "Левски", strAwayTeam: "ЦСКА", idHomeTeam: "t2", idAwayTeam: "t3", strHomeTeamBadge: teams[1].strBadge, strAwayTeamBadge: teams[2].strBadge, intHomeScore: null, intAwayScore: null, dateEvent: "2026-07-05", strTime: "19:00:00", intRound: "31", strVenue: "Стадион Георги Аспарухов" },
    { idEvent: "e2", strHomeTeam: "Лудогорец", strAwayTeam: "Славия", idHomeTeam: "t1", idAwayTeam: "t4", strHomeTeamBadge: teams[0].strBadge, strAwayTeamBadge: teams[3].strBadge, intHomeScore: null, intAwayScore: null, dateEvent: "2026-07-05", strTime: "21:30:00", intRound: "31", strVenue: "Huvepharma Arena" },
    { idEvent: "e3", strHomeTeam: "Черно море", strAwayTeam: "Ботев Пловдив", idHomeTeam: "t6", idAwayTeam: "t7", strHomeTeamBadge: teams[5].strBadge, strAwayTeamBadge: teams[6].strBadge, intHomeScore: null, intAwayScore: null, dateEvent: "2026-07-06", strTime: "17:00:00", intRound: "31" },
    { idEvent: "e4", strHomeTeam: "ЦСКА 1948", strAwayTeam: "Спартак Варна", idHomeTeam: "t8", idAwayTeam: "t9", strHomeTeamBadge: teams[7].strBadge, strAwayTeamBadge: teams[8].strBadge, intHomeScore: null, intAwayScore: null, dateEvent: "2026-07-06", strTime: "19:00:00", intRound: "31" },
  ];

  const past = [
    { idEvent: "e5", strHomeTeam: "Локомотив Пловдив", strAwayTeam: "Дунав Русе", idHomeTeam: "t5", idAwayTeam: "t11", strHomeTeamBadge: teams[4].strBadge, strAwayTeamBadge: teams[10].strBadge, intHomeScore: "3", intAwayScore: "1", dateEvent: "2026-06-28", intRound: "30", strVenue: "Локомотив" },
    { idEvent: "e6", strHomeTeam: "Арда", strAwayTeam: "Локомотив София", idHomeTeam: "t14", idAwayTeam: "t10", strHomeTeamBadge: teams[13].strBadge, strAwayTeamBadge: teams[9].strBadge, intHomeScore: "0", intAwayScore: "0", dateEvent: "2026-06-28", intRound: "30" },
    { idEvent: "e7", strHomeTeam: "Ботев Враца", strAwayTeam: "Септември София", idHomeTeam: "t13", idAwayTeam: "t12", strHomeTeamBadge: teams[12].strBadge, strAwayTeamBadge: teams[11].strBadge, intHomeScore: "2", intAwayScore: "2", dateEvent: "2026-06-27", intRound: "30" },
    { idEvent: "e8", strHomeTeam: "ЦСКА", strAwayTeam: "Черно море", idHomeTeam: "t3", idAwayTeam: "t6", strHomeTeamBadge: teams[2].strBadge, strAwayTeamBadge: teams[5].strBadge, intHomeScore: "2", intAwayScore: "0", dateEvent: "2026-06-27", intRound: "30", strVenue: "Българска армия" },
  ];

  const events = [...past, ...next].concat([
    { idEvent: "e9", strHomeTeam: "Лудогорец", strAwayTeam: "ЦСКА", idHomeTeam: "t1", idAwayTeam: "t3", strHomeTeamBadge: teams[0].strBadge, strAwayTeamBadge: teams[2].strBadge, intHomeScore: "4", intAwayScore: "1", dateEvent: "2026-06-14", intRound: "29" },
    { idEvent: "e10", strHomeTeam: "Левски", strAwayTeam: "Славия", idHomeTeam: "t2", idAwayTeam: "t4", strHomeTeamBadge: teams[1].strBadge, strAwayTeamBadge: teams[3].strBadge, intHomeScore: "1", intAwayScore: "1", dateEvent: "2026-06-14", intRound: "29" },
  ]);

  const scorers = [
    { player: "Клаудиу Кешеру", team: "Лудогорец", teamBadge: teams[0].strBadge, goals: 19 },
    { player: "Джиджи Марин", team: "Левски", teamBadge: teams[1].strBadge, goals: 15 },
    { player: "Ивайло Чочев", team: "ЦСКА", teamBadge: teams[2].strBadge, goals: 13 },
    { player: "Петър Занев", team: "Славия", teamBadge: teams[3].strBadge, goals: 11 },
    { player: "Тодор Неделев", team: "Локомотив Пловдив", teamBadge: teams[4].strBadge, goals: 10 },
    { player: "Марио Крамарич", team: "Черно море", teamBadge: teams[5].strBadge, goals: 9 },
    { player: "Симеон Райков", team: "Ботев Пловдив", teamBadge: teams[6].strBadge, goals: 8 },
  ];

  const archiveSeasons = ["2024/2025", "2023/2024"];

  return {
    meta: { season: "2025/2026", leagueId: "4626", updatedAt: new Date(Date.now() - 12 * 60000).toISOString(), source: "TheSportsDB" },
    teams,
    table,
    events,
    next,
    past,
    scorers: { updatedAt: new Date().toISOString(), processedMatches: 214, totalMatches: 240, note: "Класацията е ориентировъчна — безплатният API ключ връща само частичен timeline на мача.", list: scorers },
    archiveSeasons,
  };
})();
