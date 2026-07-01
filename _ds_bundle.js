/* @ds-bundle: {"format":3,"namespace":"DesignSystem_2890b2","components":[{"name":"Chip","sourcePath":"components/core/Chip.jsx"},{"name":"ChipGroup","sourcePath":"components/core/Chip.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Select","sourcePath":"components/core/Select.jsx"},{"name":"TeamBadge","sourcePath":"components/core/TeamBadge.jsx"},{"name":"MatchCard","sourcePath":"components/data/MatchCard.jsx"},{"name":"ScorerRow","sourcePath":"components/data/ScorerRow.jsx"},{"name":"StandingsTable","sourcePath":"components/data/StandingsTable.jsx"},{"name":"StatGrid","sourcePath":"components/data/StatGrid.jsx"},{"name":"TeamCard","sourcePath":"components/data/TeamCard.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"BottomNav","sourcePath":"components/navigation/BottomNav.jsx"},{"name":"NAV_LINKS","sourcePath":"components/navigation/Header.jsx"},{"name":"Header","sourcePath":"components/navigation/Header.jsx"}],"sourceHashes":{"components/core/Chip.jsx":"9a1fd3151ed3","components/core/IconButton.jsx":"52edcd072cb2","components/core/Select.jsx":"cf4e3e571a97","components/core/TeamBadge.jsx":"3aed4d89bac0","components/data/MatchCard.jsx":"ea7f5b220506","components/data/ScorerRow.jsx":"e5f47cd7585d","components/data/StandingsTable.jsx":"854dbc13cfe7","components/data/StatGrid.jsx":"fceea65c6c97","components/data/TeamCard.jsx":"74a85f5f8800","components/feedback/EmptyState.jsx":"b4a26a7fa44e","components/navigation/BottomNav.jsx":"1e9fe1d3bb21","components/navigation/Header.jsx":"776c4d94b062","ui_kits/a-grupa/Screens.jsx":"db0def2a8dfb","ui_kits/a-grupa/Screens2.jsx":"1d48aecf79ff","ui_kits/a-grupa/mockData.js":"42d0ae518692"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DesignSystem_2890b2 = window.DesignSystem_2890b2 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Chip.jsx
try { (() => {
// Pill-shaped filter toggle, used in groups (see ChipGroup) for
// all/upcoming/results style filters.
function Chip({
  active = false,
  children,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      background: active ? "var(--accent-primary)" : "var(--surface-card)",
      border: `1px solid ${active ? "var(--accent-primary)" : "var(--surface-card-border)"}`,
      color: active ? "var(--text-on-accent)" : "var(--text-secondary)",
      padding: "7px 14px",
      borderRadius: "var(--radius-pill)",
      fontSize: "var(--text-body-sm)",
      fontWeight: "var(--weight-semibold)",
      fontFamily: "var(--font-sans)",
      cursor: "pointer"
    }
  }, children);
}

// Horizontal row of Chips with the standard 6px gap.
function ChipGroup({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "6px",
      flexWrap: "wrap"
    }
  }, children);
}
Object.assign(__ds_scope, { Chip, ChipGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Chip.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
// Small square icon-only button, e.g. the push-notification bell toggle.
// `on` renders the accent border to show an active/subscribed state.
function IconButton({
  children,
  on = false,
  disabled = false,
  onClick,
  title
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    disabled: disabled,
    title: title,
    style: {
      background: "var(--surface-card)",
      border: `1px solid ${on ? "var(--accent-primary)" : "var(--surface-card-border)"}`,
      color: "var(--text-primary)",
      width: 34,
      height: 34,
      borderRadius: "var(--radius-md)",
      fontSize: 15,
      cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.7 : 1
    }
  }, children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Select.jsx
try { (() => {
// Glass-style native select, used for the team filter dropdown.
function Select({
  value,
  onChange,
  children
}) {
  return /*#__PURE__*/React.createElement("select", {
    value: value,
    onChange: onChange,
    style: {
      background: "var(--surface-card)",
      border: "1px solid var(--surface-card-border)",
      color: "var(--text-primary)",
      padding: "7px 12px",
      borderRadius: "var(--radius-md)",
      fontSize: "var(--text-body-sm)",
      fontFamily: "var(--font-sans)"
    }
  }, children);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Select.jsx", error: String((e && e.message) || e) }); }

// components/core/TeamBadge.jsx
try { (() => {
const {
  useState
} = React; // Renders a team crest image with a graceful initials fallback when the
// badge fails to load (mirrors the source app's onError behavior).
function TeamBadge({
  src,
  name,
  size = 28
}) {
  const [failed, setFailed] = useState(!src);
  if (failed) {
    const initials = (name || "").split(/\s+/).map(w => w[0]).join("").slice(0, 3).toUpperCase();
    return /*#__PURE__*/React.createElement("span", {
      "aria-hidden": true,
      style: {
        width: size,
        height: size,
        fontSize: size * 0.36,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.08)",
        borderRadius: "var(--radius-md)",
        fontWeight: "var(--weight-bold)",
        color: "var(--text-secondary)",
        fontFamily: "var(--font-sans)",
        flexShrink: 0
      }
    }, initials);
  }
  return /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "",
    width: size,
    height: size,
    loading: "lazy",
    onError: () => setFailed(true),
    style: {
      width: size,
      height: size,
      objectFit: "contain",
      background: "rgba(255,255,255,0.03)",
      borderRadius: "var(--radius-sm)",
      flexShrink: 0
    }
  });
}
Object.assign(__ds_scope, { TeamBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/TeamBadge.jsx", error: String((e && e.message) || e) }); }

// components/data/MatchCard.jsx
try { (() => {
function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("bg-BG", {
    day: "2-digit",
    month: "2-digit"
  });
}

// Glass card for one fixture — shows score if played, kickoff time + round if upcoming.
function MatchCard({
  event
}) {
  const played = event.intHomeScore !== null && event.intHomeScore !== undefined && event.intHomeScore !== "";
  const status = event.strStatus;
  const isLive = status && !["FT", "Match Finished", "Not Started", "NS"].includes(status) && status !== "";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface-card)",
      border: "1px solid var(--surface-card-border)",
      borderRadius: "var(--radius-xl)",
      backdropFilter: "blur(6px)",
      padding: "12px 14px",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      fontSize: "var(--text-micro)",
      color: "var(--text-secondary)",
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: "var(--tracking-wide)"
    }
  }, /*#__PURE__*/React.createElement("span", null, formatDate(event.dateEvent)), event.strTime && !played && /*#__PURE__*/React.createElement("span", null, event.strTime.slice(0, 5)), isLive && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent-primary)",
      fontWeight: "var(--weight-bold)"
    }
  }, "\u041D\u0430 \u0436\u0438\u0432\u043E"), event.intRound && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto"
    }
  }, "\u043A\u0440\u044A\u0433 ", event.intRound)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flex: 1,
      fontSize: "var(--text-body)",
      fontWeight: "var(--weight-semibold)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.TeamBadge, {
    src: event.strHomeTeamBadge,
    name: event.strHomeTeam,
    size: 26
  }), /*#__PURE__*/React.createElement("span", null, event.strHomeTeam)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: "var(--weight-black)",
      fontSize: 15,
      minWidth: 46,
      textAlign: "center",
      color: "var(--text-primary)"
    }
  }, played ? /*#__PURE__*/React.createElement("span", null, event.intHomeScore, " : ", event.intAwayScore) : /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-secondary)",
      fontWeight: "var(--weight-medium)"
    }
  }, "\u2014")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flex: 1,
      fontSize: "var(--text-body)",
      fontWeight: "var(--weight-semibold)",
      justifyContent: "flex-end",
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("span", null, event.strAwayTeam), /*#__PURE__*/React.createElement(__ds_scope.TeamBadge, {
    src: event.strAwayTeamBadge,
    name: event.strAwayTeam,
    size: 26
  }))), event.strVenue && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      fontSize: "var(--text-micro)",
      color: "var(--text-secondary)"
    }
  }, event.strVenue));
}
Object.assign(__ds_scope, { MatchCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/MatchCard.jsx", error: String((e && e.message) || e) }); }

// components/data/ScorerRow.jsx
try { (() => {
// One row in the goalscorer ranking (Home preview + full Голмайстори page).
function ScorerRow({
  rank,
  player,
  team,
  teamBadge,
  goals
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "9px 12px",
      background: "var(--surface-card)",
      border: "1px solid var(--surface-card-border)",
      borderRadius: "var(--radius-md)",
      fontSize: "var(--text-body-sm)",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      color: "var(--text-secondary)",
      fontWeight: "var(--weight-bold)"
    }
  }, rank), /*#__PURE__*/React.createElement(__ds_scope.TeamBadge, {
    src: teamBadge,
    name: team,
    size: 22
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontWeight: "var(--weight-semibold)"
    }
  }, player), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: "var(--weight-black)",
      color: "var(--accent-primary)"
    }
  }, goals));
}
Object.assign(__ds_scope, { ScorerRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ScorerRow.jsx", error: String((e && e.message) || e) }); }

// components/data/StandingsTable.jsx
try { (() => {
// Full league table with zone highlighting (champion / Europe / relegation).
// `compact` hides secondary columns (W/D/L, GF:GA, form) for the homepage preview.
function StandingsTable({
  rows,
  compact = false
}) {
  if (!rows || !rows.length) {
    return /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--text-secondary)",
        padding: "14px 4px",
        fontSize: 14,
        fontFamily: "var(--font-sans)"
      }
    }, "\u041A\u043B\u0430\u0441\u0438\u0440\u0430\u043D\u0435\u0442\u043E \u0432\u0441\u0435 \u043E\u0449\u0435 \u043D\u0435 \u0435 \u043D\u0430\u043B\u0438\u0447\u043D\u043E \u0437\u0430 \u0442\u0435\u043A\u0443\u0449\u0438\u044F \u0441\u0435\u0437\u043E\u043D.");
  }
  const zoneShadow = rank => {
    if (rank <= 1) return "inset 3px 0 0 var(--zone-title)";
    if (rank <= 6) return "inset 3px 0 0 var(--zone-europe)";
    if (rank >= rows.length - 1) return "inset 3px 0 0 var(--zone-relegation)";
    return "none";
  };
  const th = {
    color: "var(--text-secondary)",
    fontWeight: "var(--weight-semibold)",
    fontSize: "var(--text-micro)",
    textTransform: "uppercase",
    letterSpacing: "var(--tracking-wider)",
    borderBottom: "1px solid var(--surface-card-border)",
    padding: "9px 8px",
    textAlign: "center"
  };
  const td = {
    padding: "9px 8px",
    textAlign: "center",
    whiteSpace: "nowrap"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: "auto",
      borderRadius: "var(--radius-xl)",
      border: "1px solid var(--surface-card-border)",
      background: "var(--surface-card)",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "var(--text-body-sm)",
      minWidth: 480
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      width: 32
    }
  }, "#"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: "left"
    }
  }, "\u041E\u0442\u0431\u043E\u0440"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "\u0418"), !compact && /*#__PURE__*/React.createElement("th", {
    style: th
  }, "\u041F"), !compact && /*#__PURE__*/React.createElement("th", {
    style: th
  }, "\u0420"), !compact && /*#__PURE__*/React.createElement("th", {
    style: th
  }, "\u0417"), !compact && /*#__PURE__*/React.createElement("th", {
    style: th
  }, "\u0413\u0420"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "+/-"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "\u0422"), !compact && /*#__PURE__*/React.createElement("th", {
    style: th
  }, "\u0424\u043E\u0440\u043C\u0430"))), /*#__PURE__*/React.createElement("tbody", null, rows.map(r => {
    const rank = Number(r.intRank);
    const diff = Number(r.intGoalDifference ?? 0);
    return /*#__PURE__*/React.createElement("tr", {
      key: r.idTeam,
      style: {
        borderBottom: "1px solid rgba(255,255,255,0.04)"
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        fontWeight: "var(--weight-bold)",
        color: "var(--text-secondary)",
        boxShadow: zoneShadow(rank)
      }
    }, rank), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        textAlign: "left"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.TeamBadge, {
      src: r.strBadge,
      name: r.strTeam,
      size: 22
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: "var(--weight-semibold)"
      }
    }, r.strTeam))), /*#__PURE__*/React.createElement("td", {
      style: td
    }, r.intPlayed), !compact && /*#__PURE__*/React.createElement("td", {
      style: td
    }, r.intWin), !compact && /*#__PURE__*/React.createElement("td", {
      style: td
    }, r.intDraw), !compact && /*#__PURE__*/React.createElement("td", {
      style: td
    }, r.intLoss), !compact && /*#__PURE__*/React.createElement("td", {
      style: td
    }, r.intGoalsFor, ":", r.intGoalsAgainst), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        color: diff > 0 ? "var(--accent-primary)" : diff < 0 ? "var(--status-danger)" : "var(--text-primary)"
      }
    }, diff > 0 ? `+${diff}` : diff), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        fontWeight: "var(--weight-black)"
      }
    }, r.intPoints), !compact && /*#__PURE__*/React.createElement("td", {
      style: td
    }, r.strForm ?? "—"));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 14,
      padding: "10px 12px",
      fontSize: "var(--text-micro)",
      color: "var(--text-secondary)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: "var(--zone-title)",
      display: "inline-block"
    }
  }), "\u0428\u0430\u043C\u043F\u0438\u043E\u043D"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: "var(--zone-europe)",
      display: "inline-block"
    }
  }), "\u041F\u043B\u0435\u0439\u043E\u0444 \u0437\u0430 \u0442\u0438\u0442\u043B\u0430\u0442\u0430 / \u0415\u0432\u0440\u043E\u043F\u0430"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: "var(--zone-relegation)",
      display: "inline-block"
    }
  }), "\u041F\u043B\u0435\u0439\u043E\u0444 \u0437\u0430 \u043E\u0441\u0442\u0430\u0432\u0430\u043D\u0435")));
}
Object.assign(__ds_scope, { StandingsTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StandingsTable.jsx", error: String((e && e.message) || e) }); }

// components/data/StatGrid.jsx
try { (() => {
// Row of stat tiles (season record) — 3 cols mobile, 6 cols desktop in the source app.
function StatGrid({
  stats
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 10,
      fontFamily: "var(--font-sans)"
    }
  }, stats.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.label,
    style: {
      background: "var(--surface-card)",
      border: "1px solid var(--surface-card-border)",
      borderRadius: "var(--radius-lg)",
      padding: "12px 8px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 20,
      fontWeight: "var(--weight-black)",
      color: "var(--text-primary)"
    }
  }, s.value), /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: "var(--text-micro)",
      color: "var(--text-secondary)",
      textTransform: "uppercase"
    }
  }, s.label))));
}
Object.assign(__ds_scope, { StatGrid });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatGrid.jsx", error: String((e && e.message) || e) }); }

// components/data/TeamCard.jsx
try { (() => {
// Grid tile linking to a team's detail page — used on the Отбори (Teams) grid.
function TeamCard({
  name,
  badgeSrc,
  onClick
}) {
  return /*#__PURE__*/React.createElement("a", {
    onClick: onClick,
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      padding: "18px 10px",
      fontSize: "var(--text-body-sm)",
      fontWeight: "var(--weight-semibold)",
      textAlign: "center",
      fontFamily: "var(--font-sans)",
      color: "var(--text-primary)",
      background: "var(--surface-card)",
      border: "1px solid var(--surface-card-border)",
      borderRadius: "var(--radius-xl)",
      backdropFilter: "blur(6px)",
      cursor: "pointer",
      textDecoration: "none"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.TeamBadge, {
    src: badgeSrc,
    name: name,
    size: 48
  }), /*#__PURE__*/React.createElement("span", null, name));
}
Object.assign(__ds_scope, { TeamCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/TeamCard.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
// Muted single-line note for loading/empty/error states — used across every page.
function EmptyState({
  children
}) {
  return /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-secondary)",
      padding: "14px 4px",
      fontSize: "var(--text-body)",
      fontFamily: "var(--font-sans)",
      margin: 0
    }
  }, children);
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Header.jsx
try { (() => {
const NAV_LINKS = [{
  to: "/",
  label: "Начало",
  icon: "🏠"
}, {
  to: "/klasirane",
  label: "Класиране",
  icon: "📊"
}, {
  to: "/machove",
  label: "Мачове",
  icon: "⚽"
}, {
  to: "/golmaistori",
  label: "Голмайстори",
  icon: "🥅"
}, {
  to: "/otbori",
  label: "Отбори",
  icon: "🛡️"
}, {
  to: "/arhiv",
  label: "Архив",
  icon: "🗂️"
}];

// Sticky top header: brand mark + desktop nav (hidden under 720px) + notify slot.
// `activePath` picks the highlighted link; `notifySlot` accepts an <IconButton>.
function Header({
  activePath = "/",
  onNavigate,
  notifySlot,
  logoSrc
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "14px 20px",
      position: "sticky",
      top: 0,
      zIndex: 20,
      background: "rgba(11, 15, 22, 0.85)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid var(--surface-card-border)",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontWeight: "var(--weight-bold)",
      letterSpacing: "var(--tracking-normal)"
    }
  }, logoSrc && /*#__PURE__*/React.createElement("img", {
    src: logoSrc,
    alt: "\u0410 \u0413\u0440\u0443\u043F\u0430",
    style: {
      width: 34,
      height: 34,
      objectFit: "contain"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-section)",
      color: "var(--text-primary)"
    }
  }, "\u0410 \u0413\u0440\u0443\u043F\u0430")), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "none",
      gap: 22
    },
    className: "ds-top-nav"
  }, NAV_LINKS.map(l => {
    const active = activePath === l.to;
    return /*#__PURE__*/React.createElement("a", {
      key: l.to,
      href: l.to,
      onClick: e => {
        e.preventDefault();
        onNavigate && onNavigate(l.to);
      },
      style: {
        color: active ? "var(--text-primary)" : "var(--text-secondary)",
        fontWeight: "var(--weight-semibold)",
        fontSize: "var(--text-body)",
        padding: "6px 2px",
        borderBottom: `2px solid ${active ? "var(--accent-primary)" : "transparent"}`,
        textDecoration: "none"
      }
    }, l.label);
  })), notifySlot, /*#__PURE__*/React.createElement("style", null, `@media (min-width: 720px) { .ds-top-nav { display: flex !important; } }`));
}
Object.assign(__ds_scope, { NAV_LINKS, Header });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Header.jsx", error: String((e && e.message) || e) }); }

// components/navigation/BottomNav.jsx
try { (() => {
// Fixed bottom tab bar (mobile only — hides at 720px+).
function BottomNav({
  activePath = "/",
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("nav", {
    className: "ds-bottom-nav",
    style: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "space-around",
      background: "rgba(11, 15, 22, 0.92)",
      backdropFilter: "blur(14px)",
      borderTop: "1px solid var(--surface-card-border)",
      padding: "6px 4px 6px",
      zIndex: 30,
      fontFamily: "var(--font-sans)"
    }
  }, __ds_scope.NAV_LINKS.map(l => {
    const active = activePath === l.to;
    return /*#__PURE__*/React.createElement("a", {
      key: l.to,
      href: l.to,
      onClick: e => {
        e.preventDefault();
        onNavigate && onNavigate(l.to);
      },
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        color: active ? "var(--accent-primary)" : "var(--text-secondary)",
        background: active ? "rgba(34,197,94,0.1)" : "transparent",
        fontSize: "var(--text-nano)",
        padding: "4px 10px",
        borderRadius: "var(--radius-md)",
        textDecoration: "none"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        lineHeight: 1
      }
    }, l.icon), /*#__PURE__*/React.createElement("span", null, l.label));
  }), /*#__PURE__*/React.createElement("style", null, `@media (min-width: 720px) { .ds-bottom-nav { display: none !important; } }`));
}
Object.assign(__ds_scope, { BottomNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/BottomNav.jsx", error: String((e && e.message) || e) }); }

// ui_kits/a-grupa/Screens.jsx
try { (() => {
const {
  StandingsTable,
  MatchCard,
  TeamCard,
  ScorerRow,
  StatGrid,
  EmptyState,
  Chip,
  ChipGroup,
  Select,
  TeamBadge
} = window.DesignSystem_2890b2;
function timeAgo(iso) {
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "току-що";
  if (diffMin < 60) return `преди ${diffMin} мин`;
  const h = Math.round(diffMin / 60);
  if (h < 24) return `преди ${h} ч`;
  return `преди ${Math.round(h / 24)} дни`;
}
const sectionHead = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  marginBottom: 10,
  padding: "0 2px"
};
const sectionH2 = {
  fontSize: "var(--text-section)",
  margin: 0,
  color: "var(--text-primary)"
};
const sectionLink = {
  fontSize: 13,
  color: "var(--accent-link)",
  fontWeight: "var(--weight-semibold)",
  textDecoration: "none",
  cursor: "pointer"
};
const matchGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10
};
const page = {
  fontFamily: "var(--font-sans)"
};
function Home({
  data,
  navigate
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: page
  }, /*#__PURE__*/React.createElement("section", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "20px 2px 8px"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logos/logo-square.png",
    alt: "\u0410 \u0413\u0440\u0443\u043F\u0430",
    style: {
      width: 64,
      height: 64,
      objectFit: "contain",
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: "var(--text-hero)",
      margin: "0 0 4px",
      letterSpacing: "var(--tracking-tight)",
      color: "var(--text-primary)"
    }
  }, "\u0410 \u0413\u0440\u0443\u043F\u0430"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "2px 0",
      color: "var(--text-secondary)"
    }
  }, "\u041A\u043B\u0430\u0441\u0438\u0440\u0430\u043D\u0435, \u043C\u0430\u0447\u043E\u0432\u0435 \u0438 \u0440\u0435\u0437\u0443\u043B\u0442\u0430\u0442\u0438 \u043E\u0442 efbet \u041B\u0438\u0433\u0430 \u2014 \u0441\u0435\u0437\u043E\u043D ", data.meta.season), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: "var(--text-secondary)",
      opacity: 0.8,
      margin: "2px 0"
    }
  }, "\u041E\u0431\u043D\u043E\u0432\u0435\u043D\u043E ", timeAgo(data.meta.updatedAt)))), /*#__PURE__*/React.createElement("section", {
    style: {
      marginTop: 26
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: sectionHead
  }, /*#__PURE__*/React.createElement("h2", {
    style: sectionH2
  }, "\u041A\u043B\u0430\u0441\u0438\u0440\u0430\u043D\u0435"), /*#__PURE__*/React.createElement("a", {
    style: sectionLink,
    onClick: () => navigate("klasirane")
  }, "\u041F\u044A\u043B\u043D\u043E \u043A\u043B\u0430\u0441\u0438\u0440\u0430\u043D\u0435 \u2192")), /*#__PURE__*/React.createElement(StandingsTable, {
    rows: data.table.slice(0, 8),
    compact: true
  })), /*#__PURE__*/React.createElement("section", {
    style: {
      marginTop: 26
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: sectionHead
  }, /*#__PURE__*/React.createElement("h2", {
    style: sectionH2
  }, "\u041F\u0440\u0435\u0434\u0441\u0442\u043E\u044F\u0449\u0438 \u043C\u0430\u0447\u043E\u0432\u0435"), /*#__PURE__*/React.createElement("a", {
    style: sectionLink,
    onClick: () => navigate("machove")
  }, "\u0412\u0441\u0438\u0447\u043A\u0438 \u043C\u0430\u0447\u043E\u0432\u0435 \u2192")), /*#__PURE__*/React.createElement("div", {
    style: matchGrid
  }, data.next.slice(0, 4).map(e => /*#__PURE__*/React.createElement(MatchCard, {
    key: e.idEvent,
    event: e
  })))), /*#__PURE__*/React.createElement("section", {
    style: {
      marginTop: 26
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: sectionHead
  }, /*#__PURE__*/React.createElement("h2", {
    style: sectionH2
  }, "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438 \u0440\u0435\u0437\u0443\u043B\u0442\u0430\u0442\u0438")), /*#__PURE__*/React.createElement("div", {
    style: matchGrid
  }, data.past.slice(0, 4).map(e => /*#__PURE__*/React.createElement(MatchCard, {
    key: e.idEvent,
    event: e
  })))), /*#__PURE__*/React.createElement("section", {
    style: {
      marginTop: 26
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: sectionHead
  }, /*#__PURE__*/React.createElement("h2", {
    style: sectionH2
  }, "\u0413\u043E\u043B\u043C\u0430\u0439\u0441\u0442\u043E\u0440\u0438"), /*#__PURE__*/React.createElement("a", {
    style: sectionLink,
    onClick: () => navigate("golmaistori")
  }, "\u041F\u044A\u043B\u043D\u0430 \u043A\u043B\u0430\u0441\u0430\u0446\u0438\u044F \u2192")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, data.scorers.list.slice(0, 5).map((s, i) => /*#__PURE__*/React.createElement(ScorerRow, {
    key: s.player,
    rank: i + 1,
    player: s.player,
    team: s.team,
    teamBadge: s.teamBadge,
    goals: s.goals
  })))));
}
function StandingsScreen({
  data
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: page
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: "var(--text-page-title)",
      margin: "12px 2px 2px",
      color: "var(--text-primary)"
    }
  }, "\u041A\u043B\u0430\u0441\u0438\u0440\u0430\u043D\u0435"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-secondary)",
      margin: "0 2px 14px",
      fontSize: 13
    }
  }, "\u0421\u0435\u0437\u043E\u043D ", data.meta.season), /*#__PURE__*/React.createElement(StandingsTable, {
    rows: data.table
  }));
}
function ScorersScreen({
  data
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: page
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: "var(--text-page-title)",
      margin: "12px 2px 2px",
      color: "var(--text-primary)"
    }
  }, "\u0413\u043E\u043B\u043C\u0430\u0439\u0441\u0442\u043E\u0440\u0438"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-secondary)",
      margin: "0 2px 14px",
      fontSize: 13
    }
  }, "\u0418\u0437\u0447\u0438\u0441\u043B\u0435\u043D\u043E \u043E\u0442 ", data.scorers.processedMatches, "/", data.scorers.totalMatches, " \u0438\u0437\u0438\u0433\u0440\u0430\u043D\u0438 \u043C\u0430\u0447\u0430"), /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: "var(--radius-xl)",
      border: "1px solid var(--surface-card-border)",
      background: "var(--surface-card)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 13,
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      width: 32,
      padding: "9px 8px",
      color: "var(--text-secondary)",
      fontSize: 11,
      textTransform: "uppercase",
      borderBottom: "1px solid var(--surface-card-border)"
    }
  }, "#"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: "left",
      padding: "9px 8px",
      color: "var(--text-secondary)",
      fontSize: 11,
      textTransform: "uppercase",
      borderBottom: "1px solid var(--surface-card-border)"
    }
  }, "\u0418\u0433\u0440\u0430\u0447"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: "9px 8px",
      color: "var(--text-secondary)",
      fontSize: 11,
      textTransform: "uppercase",
      borderBottom: "1px solid var(--surface-card-border)"
    }
  }, "\u041E\u0442\u0431\u043E\u0440"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: "9px 8px",
      color: "var(--text-secondary)",
      fontSize: 11,
      textTransform: "uppercase",
      borderBottom: "1px solid var(--surface-card-border)"
    }
  }, "\u0413\u043E\u043B\u043E\u0432\u0435"))), /*#__PURE__*/React.createElement("tbody", null, data.scorers.list.map((s, i) => /*#__PURE__*/React.createElement("tr", {
    key: s.player,
    style: {
      borderBottom: "1px solid rgba(255,255,255,0.04)"
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "9px 8px",
      textAlign: "center",
      fontWeight: 700,
      color: "var(--text-secondary)"
    }
  }, i + 1), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "9px 8px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(TeamBadge, {
    src: s.teamBadge,
    name: s.team,
    size: 22
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: "var(--text-primary)"
    }
  }, s.player))), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "9px 8px",
      textAlign: "center",
      color: "var(--text-secondary)"
    }
  }, s.team), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "9px 8px",
      textAlign: "center",
      fontWeight: 800,
      color: "var(--text-primary)"
    }
  }, s.goals)))))), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-secondary)",
      fontSize: 11,
      padding: "8px 4px 0"
    }
  }, data.scorers.note));
}
window.UIKitScreens = {
  Home,
  StandingsScreen,
  ScorersScreen
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/a-grupa/Screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/a-grupa/Screens2.jsx
try { (() => {
const {
  MatchCard,
  TeamCard,
  StandingsTable,
  StatGrid,
  EmptyState,
  Chip,
  ChipGroup,
  Select
} = window.DesignSystem_2890b2;
const page = {
  fontFamily: "var(--font-sans)"
};
const pageH1 = {
  fontSize: "var(--text-page-title)",
  margin: "12px 2px 2px",
  color: "var(--text-primary)"
};
const pageSub = {
  color: "var(--text-secondary)",
  margin: "0 2px 14px",
  fontSize: 13
};
function MatchesScreen({
  data
}) {
  const [filter, setFilter] = React.useState("all");
  const [team, setTeam] = React.useState("all");
  const teamNames = React.useMemo(() => {
    const set = new Set();
    data.events.forEach(e => {
      set.add(e.strHomeTeam);
      set.add(e.strAwayTeam);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "bg"));
  }, [data]);
  const filtered = React.useMemo(() => {
    let list = [...data.events];
    if (filter === "upcoming") list = list.filter(e => e.intHomeScore === null);
    if (filter === "results") list = list.filter(e => e.intHomeScore !== null);
    if (team !== "all") list = list.filter(e => e.strHomeTeam === team || e.strAwayTeam === team);
    list.sort((a, b) => a.dateEvent < b.dateEvent ? -1 : 1);
    if (filter === "results") list.reverse();
    return list;
  }, [data, filter, team]);
  return /*#__PURE__*/React.createElement("div", {
    style: page
  }, /*#__PURE__*/React.createElement("h1", {
    style: pageH1
  }, "\u041C\u0430\u0447\u043E\u0432\u0435"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 10,
      alignItems: "center",
      margin: "8px 2px 16px"
    }
  }, /*#__PURE__*/React.createElement(ChipGroup, null, ["all", "upcoming", "results"].map(f => /*#__PURE__*/React.createElement(Chip, {
    key: f,
    active: filter === f,
    onClick: () => setFilter(f)
  }, f === "all" ? "Всички" : f === "upcoming" ? "Предстоящи" : "Резултати"))), /*#__PURE__*/React.createElement(Select, {
    value: team,
    onChange: e => setTeam(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "\u0412\u0441\u0438\u0447\u043A\u0438 \u043E\u0442\u0431\u043E\u0440\u0438"), teamNames.map(t => /*#__PURE__*/React.createElement("option", {
    key: t,
    value: t
  }, t)))), !filtered.length && /*#__PURE__*/React.createElement(EmptyState, null, "\u041D\u044F\u043C\u0430 \u043C\u0430\u0447\u043E\u0432\u0435 \u043F\u043E \u0437\u0430\u0434\u0430\u0434\u0435\u043D\u0438\u0442\u0435 \u0444\u0438\u043B\u0442\u0440\u0438."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, filtered.map(e => /*#__PURE__*/React.createElement(MatchCard, {
    key: e.idEvent,
    event: e
  }))));
}
function TeamsScreen({
  data,
  navigate
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: page
  }, /*#__PURE__*/React.createElement("h1", {
    style: pageH1
  }, "\u041E\u0442\u0431\u043E\u0440\u0438"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 10,
      marginTop: 14
    }
  }, data.teams.map(t => /*#__PURE__*/React.createElement(TeamCard, {
    key: t.idTeam,
    name: t.strTeam,
    badgeSrc: t.strBadge,
    onClick: () => navigate("otbori/" + t.idTeam)
  }))));
}
function TeamDetailScreen({
  data,
  teamId,
  navigate
}) {
  const team = data.teams.find(t => t.idTeam === teamId) || data.teams[0];
  const row = data.table.find(r => r.idTeam === team.idTeam);
  const matches = data.events.filter(e => e.idHomeTeam === team.idTeam || e.idAwayTeam === team.idTeam);
  return /*#__PURE__*/React.createElement("div", {
    style: page
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => navigate("otbori"),
    style: {
      display: "inline-block",
      margin: "12px 2px",
      fontSize: 13,
      color: "var(--accent-link)",
      fontWeight: 600,
      cursor: "pointer"
    }
  }, "\u2190 \u0412\u0441\u0438\u0447\u043A\u0438 \u043E\u0442\u0431\u043E\u0440\u0438"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "6px 2px 4px"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: team.strBadge,
    alt: "",
    width: 64,
    height: 64,
    style: {
      objectFit: "contain",
      borderRadius: 6
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      color: "var(--text-primary)",
      fontSize: "var(--text-page-title)"
    }
  }, team.strTeam), team.strStadium && /*#__PURE__*/React.createElement("p", {
    style: pageSub
  }, team.strStadium))), row && /*#__PURE__*/React.createElement("section", {
    style: {
      marginTop: 26
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--text-section)",
      color: "var(--text-primary)"
    }
  }, "\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430 \u043E\u0442 \u0441\u0435\u0437\u043E\u043D\u0430"), /*#__PURE__*/React.createElement(StatGrid, {
    stats: [{
      value: row.intRank,
      label: "място"
    }, {
      value: row.intPoints,
      label: "точки"
    }, {
      value: row.intPlayed,
      label: "мачове"
    }, {
      value: row.intWin,
      label: "победи"
    }, {
      value: row.intDraw,
      label: "равни"
    }, {
      value: row.intLoss,
      label: "загуби"
    }]
  })), team.strDescriptionEN && /*#__PURE__*/React.createElement("section", {
    style: {
      marginTop: 26
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--text-section)",
      color: "var(--text-primary)"
    }
  }, "\u0417\u0430 \u043E\u0442\u0431\u043E\u0440\u0430"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-secondary)",
      fontSize: 14,
      lineHeight: 1.6
    }
  }, team.strDescriptionEN)), /*#__PURE__*/React.createElement("section", {
    style: {
      marginTop: 26
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--text-section)",
      color: "var(--text-primary)"
    }
  }, "\u041C\u0430\u0447\u043E\u0432\u0435"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, matches.map(e => /*#__PURE__*/React.createElement(MatchCard, {
    key: e.idEvent,
    event: e
  })))));
}
function ArchiveScreen({
  data
}) {
  const [season, setSeason] = React.useState(data.archiveSeasons[0]);
  return /*#__PURE__*/React.createElement("div", {
    style: page
  }, /*#__PURE__*/React.createElement("h1", {
    style: pageH1
  }, "\u0410\u0440\u0445\u0438\u0432"), /*#__PURE__*/React.createElement("p", {
    style: pageSub
  }, "\u041A\u043B\u0430\u0441\u0438\u0440\u0430\u043D\u0438\u044F \u0438 \u043C\u0430\u0447\u043E\u0432\u0435 \u043E\u0442 \u043F\u0440\u0435\u0434\u0445\u043E\u0434\u043D\u0438 \u0441\u0435\u0437\u043E\u043D\u0438"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      margin: "8px 2px 16px"
    }
  }, /*#__PURE__*/React.createElement(Select, {
    value: season,
    onChange: e => setSeason(e.target.value)
  }, data.archiveSeasons.map(s => /*#__PURE__*/React.createElement("option", {
    key: s,
    value: s
  }, "\u0421\u0435\u0437\u043E\u043D ", s)))), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--text-section)",
      color: "var(--text-primary)"
    }
  }, "\u041A\u043B\u0430\u0441\u0438\u0440\u0430\u043D\u0435 ", season), /*#__PURE__*/React.createElement(StandingsTable, {
    rows: data.table
  })), /*#__PURE__*/React.createElement("section", {
    style: {
      marginTop: 26
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--text-section)",
      color: "var(--text-primary)"
    }
  }, "\u041C\u0430\u0447\u043E\u0432\u0435 ", season), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, data.events.slice(0, 4).map(e => /*#__PURE__*/React.createElement(MatchCard, {
    key: e.idEvent,
    event: e
  }))), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-secondary)",
      padding: "14px 4px",
      fontSize: 13
    }
  }, "\u041F\u043E\u043A\u0430\u0437\u0430\u043D\u0438 \u0441\u0430 \u043F\u044A\u0440\u0432\u0438\u0442\u0435 4 \u043C\u0430\u0447\u0430 \u043E\u0442 \u0430\u0440\u0445\u0438\u0432\u043D\u0438\u044F \u0441\u0435\u0437\u043E\u043D (\u0434\u0435\u043C\u043E\u043D\u0441\u0442\u0440\u0430\u0446\u0438\u044F).")));
}
window.UIKitScreens2 = {
  MatchesScreen,
  TeamsScreen,
  TeamDetailScreen,
  ArchiveScreen
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/a-grupa/Screens2.jsx", error: String((e && e.message) || e) }); }

// ui_kits/a-grupa/mockData.js
try { (() => {
// Mock league data for the UI kit — modeled on src/types.ts shapes,
// with plausible Bulgarian club names/stats standing in for live TheSportsDB data.
window.MOCK = function () {
  const T = (id, name, file, stadium) => ({
    idTeam: id,
    strTeam: name,
    strBadge: `../../assets/teams/${file}`,
    strStadium: stadium,
    strDescriptionEN: name === "Лудогорец" ? "Ludogorets Razgrad is the most successful Bulgarian club of the last decade, a fixture in European group stages representing the town of Razgrad." : name === "Левски" ? "Levski Sofia is one of Bulgaria's most decorated and widely supported clubs, based in the capital Sofia." : `${name} is a founding member club of Bulgaria's top football division.`,
    intFormedYear: "1945"
  });
  const teams = [T("t1", "Лудогорец", "ludogorets.png", "Huvepharma Arena"), T("t2", "Левски", "levski.png", "Стадион Георги Аспарухов"), T("t3", "ЦСКА", "cska.png", "Българска армия"), T("t4", "Славия", "slavia.png", "Славия"), T("t5", "Локомотив Пловдив", "lokomotiv-plovdiv.png", "Локомотив"), T("t6", "Черно море", "cherno-more.png", "Тича"), T("t7", "Ботев Пловдив", "botev-plovdiv.png", "Христо Ботев"), T("t8", "ЦСКА 1948", "cska-1948.png", "Българска армия"), T("t9", "Спартак Варна", "spartak-varna.png", "Спартак"), T("t10", "Локомотив София", "lokomotiv-sofia.png", "Locomotive Sofia"), T("t11", "Дунав Русе", "dunav-ruse.png", "Дунав"), T("t12", "Септември София", "septemvri-sofia.png", "Septemvri"), T("t13", "Ботев Враца", "botev-vratsa.jpg", "Христо Ботев"), T("t14", "Арда", "arda.png", "Арда")];
  const table = [{
    idTeam: "t1",
    strTeam: "Лудогорец",
    strBadge: teams[0].strBadge,
    intRank: "1",
    intPlayed: "30",
    intWin: "22",
    intDraw: "5",
    intLoss: "3",
    intGoalsFor: "60",
    intGoalsAgainst: "20",
    intGoalDifference: "40",
    intPoints: "71",
    strForm: "ППППР"
  }, {
    idTeam: "t2",
    strTeam: "Левски",
    strBadge: teams[1].strBadge,
    intRank: "2",
    intPlayed: "30",
    intWin: "19",
    intDraw: "6",
    intLoss: "5",
    intGoalsFor: "55",
    intGoalsAgainst: "28",
    intGoalDifference: "27",
    intPoints: "63",
    strForm: "ППРПЗ"
  }, {
    idTeam: "t3",
    strTeam: "ЦСКА",
    strBadge: teams[2].strBadge,
    intRank: "3",
    intPlayed: "30",
    intWin: "17",
    intDraw: "7",
    intLoss: "6",
    intGoalsFor: "50",
    intGoalsAgainst: "30",
    intGoalDifference: "20",
    intPoints: "58",
    strForm: "РППЗП"
  }, {
    idTeam: "t4",
    strTeam: "Славия",
    strBadge: teams[3].strBadge,
    intRank: "4",
    intPlayed: "30",
    intWin: "15",
    intDraw: "8",
    intLoss: "7",
    intGoalsFor: "44",
    intGoalsAgainst: "32",
    intGoalDifference: "12",
    intPoints: "53",
    strForm: "ППЗРП"
  }, {
    idTeam: "t5",
    strTeam: "Локомотив Пловдив",
    strBadge: teams[4].strBadge,
    intRank: "5",
    intPlayed: "30",
    intWin: "13",
    intDraw: "9",
    intLoss: "8",
    intGoalsFor: "40",
    intGoalsAgainst: "34",
    intGoalDifference: "6",
    intPoints: "48",
    strForm: "ЗППРЗ"
  }, {
    idTeam: "t6",
    strTeam: "Черно море",
    strBadge: teams[5].strBadge,
    intRank: "6",
    intPlayed: "30",
    intWin: "12",
    intDraw: "9",
    intLoss: "9",
    intGoalsFor: "38",
    intGoalsAgainst: "35",
    intGoalDifference: "3",
    intPoints: "45",
    strForm: "РЗППЗ"
  }, {
    idTeam: "t7",
    strTeam: "Ботев Пловдив",
    strBadge: teams[6].strBadge,
    intRank: "7",
    intPlayed: "30",
    intWin: "11",
    intDraw: "8",
    intLoss: "11",
    intGoalsFor: "36",
    intGoalsAgainst: "37",
    intGoalDifference: "-1",
    intPoints: "41",
    strForm: "ЗРЗПП"
  }, {
    idTeam: "t8",
    strTeam: "ЦСКА 1948",
    strBadge: teams[7].strBadge,
    intRank: "8",
    intPlayed: "30",
    intWin: "10",
    intDraw: "8",
    intLoss: "12",
    intGoalsFor: "34",
    intGoalsAgainst: "38",
    intGoalDifference: "-4",
    intPoints: "38",
    strForm: "ППЗЗР"
  }, {
    idTeam: "t9",
    strTeam: "Спартак Варна",
    strBadge: teams[8].strBadge,
    intRank: "9",
    intPlayed: "30",
    intWin: "9",
    intDraw: "8",
    intLoss: "13",
    intGoalsFor: "32",
    intGoalsAgainst: "40",
    intGoalDifference: "-8",
    intPoints: "35",
    strForm: "ЗЗРПЗ"
  }, {
    idTeam: "t10",
    strTeam: "Локомотив София",
    strBadge: teams[9].strBadge,
    intRank: "10",
    intPlayed: "30",
    intWin: "8",
    intDraw: "9",
    intLoss: "13",
    intGoalsFor: "30",
    intGoalsAgainst: "41",
    intGoalDifference: "-11",
    intPoints: "33",
    strForm: "РЗЗПЗ"
  }, {
    idTeam: "t11",
    strTeam: "Дунав Русе",
    strBadge: teams[10].strBadge,
    intRank: "11",
    intPlayed: "30",
    intWin: "8",
    intDraw: "7",
    intLoss: "15",
    intGoalsFor: "29",
    intGoalsAgainst: "45",
    intGoalDifference: "-16",
    intPoints: "31",
    strForm: "ЗПЗРЗ"
  }, {
    idTeam: "t12",
    strTeam: "Септември София",
    strBadge: teams[11].strBadge,
    intRank: "12",
    intPlayed: "30",
    intWin: "7",
    intDraw: "8",
    intLoss: "15",
    intGoalsFor: "27",
    intGoalsAgainst: "47",
    intGoalDifference: "-20",
    intPoints: "29",
    strForm: "ЗЗПЗР"
  }, {
    idTeam: "t13",
    strTeam: "Ботев Враца",
    strBadge: teams[12].strBadge,
    intRank: "13",
    intPlayed: "30",
    intWin: "6",
    intDraw: "7",
    intLoss: "17",
    intGoalsFor: "26",
    intGoalsAgainst: "50",
    intGoalDifference: "-24",
    intPoints: "25",
    strForm: "ЗЗЗПЗ"
  }, {
    idTeam: "t14",
    strTeam: "Арда",
    strBadge: teams[13].strBadge,
    intRank: "14",
    intPlayed: "30",
    intWin: "5",
    intDraw: "7",
    intLoss: "18",
    intGoalsFor: "24",
    intGoalsAgainst: "55",
    intGoalDifference: "-31",
    intPoints: "22",
    strForm: "ЗЗРЗП"
  }];
  const next = [{
    idEvent: "e1",
    strHomeTeam: "Левски",
    strAwayTeam: "ЦСКА",
    idHomeTeam: "t2",
    idAwayTeam: "t3",
    strHomeTeamBadge: teams[1].strBadge,
    strAwayTeamBadge: teams[2].strBadge,
    intHomeScore: null,
    intAwayScore: null,
    dateEvent: "2026-07-05",
    strTime: "19:00:00",
    intRound: "31",
    strVenue: "Стадион Георги Аспарухов"
  }, {
    idEvent: "e2",
    strHomeTeam: "Лудогорец",
    strAwayTeam: "Славия",
    idHomeTeam: "t1",
    idAwayTeam: "t4",
    strHomeTeamBadge: teams[0].strBadge,
    strAwayTeamBadge: teams[3].strBadge,
    intHomeScore: null,
    intAwayScore: null,
    dateEvent: "2026-07-05",
    strTime: "21:30:00",
    intRound: "31",
    strVenue: "Huvepharma Arena"
  }, {
    idEvent: "e3",
    strHomeTeam: "Черно море",
    strAwayTeam: "Ботев Пловдив",
    idHomeTeam: "t6",
    idAwayTeam: "t7",
    strHomeTeamBadge: teams[5].strBadge,
    strAwayTeamBadge: teams[6].strBadge,
    intHomeScore: null,
    intAwayScore: null,
    dateEvent: "2026-07-06",
    strTime: "17:00:00",
    intRound: "31"
  }, {
    idEvent: "e4",
    strHomeTeam: "ЦСКА 1948",
    strAwayTeam: "Спартак Варна",
    idHomeTeam: "t8",
    idAwayTeam: "t9",
    strHomeTeamBadge: teams[7].strBadge,
    strAwayTeamBadge: teams[8].strBadge,
    intHomeScore: null,
    intAwayScore: null,
    dateEvent: "2026-07-06",
    strTime: "19:00:00",
    intRound: "31"
  }];
  const past = [{
    idEvent: "e5",
    strHomeTeam: "Локомотив Пловдив",
    strAwayTeam: "Дунав Русе",
    idHomeTeam: "t5",
    idAwayTeam: "t11",
    strHomeTeamBadge: teams[4].strBadge,
    strAwayTeamBadge: teams[10].strBadge,
    intHomeScore: "3",
    intAwayScore: "1",
    dateEvent: "2026-06-28",
    intRound: "30",
    strVenue: "Локомотив"
  }, {
    idEvent: "e6",
    strHomeTeam: "Арда",
    strAwayTeam: "Локомотив София",
    idHomeTeam: "t14",
    idAwayTeam: "t10",
    strHomeTeamBadge: teams[13].strBadge,
    strAwayTeamBadge: teams[9].strBadge,
    intHomeScore: "0",
    intAwayScore: "0",
    dateEvent: "2026-06-28",
    intRound: "30"
  }, {
    idEvent: "e7",
    strHomeTeam: "Ботев Враца",
    strAwayTeam: "Септември София",
    idHomeTeam: "t13",
    idAwayTeam: "t12",
    strHomeTeamBadge: teams[12].strBadge,
    strAwayTeamBadge: teams[11].strBadge,
    intHomeScore: "2",
    intAwayScore: "2",
    dateEvent: "2026-06-27",
    intRound: "30"
  }, {
    idEvent: "e8",
    strHomeTeam: "ЦСКА",
    strAwayTeam: "Черно море",
    idHomeTeam: "t3",
    idAwayTeam: "t6",
    strHomeTeamBadge: teams[2].strBadge,
    strAwayTeamBadge: teams[5].strBadge,
    intHomeScore: "2",
    intAwayScore: "0",
    dateEvent: "2026-06-27",
    intRound: "30",
    strVenue: "Българска армия"
  }];
  const events = [...past, ...next].concat([{
    idEvent: "e9",
    strHomeTeam: "Лудогорец",
    strAwayTeam: "ЦСКА",
    idHomeTeam: "t1",
    idAwayTeam: "t3",
    strHomeTeamBadge: teams[0].strBadge,
    strAwayTeamBadge: teams[2].strBadge,
    intHomeScore: "4",
    intAwayScore: "1",
    dateEvent: "2026-06-14",
    intRound: "29"
  }, {
    idEvent: "e10",
    strHomeTeam: "Левски",
    strAwayTeam: "Славия",
    idHomeTeam: "t2",
    idAwayTeam: "t4",
    strHomeTeamBadge: teams[1].strBadge,
    strAwayTeamBadge: teams[3].strBadge,
    intHomeScore: "1",
    intAwayScore: "1",
    dateEvent: "2026-06-14",
    intRound: "29"
  }]);
  const scorers = [{
    player: "Клаудиу Кешеру",
    team: "Лудогорец",
    teamBadge: teams[0].strBadge,
    goals: 19
  }, {
    player: "Джиджи Марин",
    team: "Левски",
    teamBadge: teams[1].strBadge,
    goals: 15
  }, {
    player: "Ивайло Чочев",
    team: "ЦСКА",
    teamBadge: teams[2].strBadge,
    goals: 13
  }, {
    player: "Петър Занев",
    team: "Славия",
    teamBadge: teams[3].strBadge,
    goals: 11
  }, {
    player: "Тодор Неделев",
    team: "Локомотив Пловдив",
    teamBadge: teams[4].strBadge,
    goals: 10
  }, {
    player: "Марио Крамарич",
    team: "Черно море",
    teamBadge: teams[5].strBadge,
    goals: 9
  }, {
    player: "Симеон Райков",
    team: "Ботев Пловдив",
    teamBadge: teams[6].strBadge,
    goals: 8
  }];
  const archiveSeasons = ["2024/2025", "2023/2024"];
  return {
    meta: {
      season: "2025/2026",
      leagueId: "4626",
      updatedAt: new Date(Date.now() - 12 * 60000).toISOString(),
      source: "TheSportsDB"
    },
    teams,
    table,
    events,
    next,
    past,
    scorers: {
      updatedAt: new Date().toISOString(),
      processedMatches: 214,
      totalMatches: 240,
      note: "Класацията е ориентировъчна — безплатният API ключ връща само частичен timeline на мача.",
      list: scorers
    },
    archiveSeasons
  };
}();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/a-grupa/mockData.js", error: String((e && e.message) || e) }); }

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.ChipGroup = __ds_scope.ChipGroup;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.TeamBadge = __ds_scope.TeamBadge;

__ds_ns.MatchCard = __ds_scope.MatchCard;

__ds_ns.ScorerRow = __ds_scope.ScorerRow;

__ds_ns.StandingsTable = __ds_scope.StandingsTable;

__ds_ns.StatGrid = __ds_scope.StatGrid;

__ds_ns.TeamCard = __ds_scope.TeamCard;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.BottomNav = __ds_scope.BottomNav;

__ds_ns.NAV_LINKS = __ds_scope.NAV_LINKS;

__ds_ns.Header = __ds_scope.Header;

})();
