// src/components/Nav.tsx
import { NavLink } from "react-router-dom";
import NotifyButton from "./NotifyButton";

const links = [
  { to: "/", label: "Начало", icon: "🏠" },
  { to: "/klasirane", label: "Класиране", icon: "📊" },
  { to: "/machove", label: "Мачове", icon: "⚽" },
  { to: "/golmaistori", label: "Голмайстори", icon: "🥅" },
  { to: "/otbori", label: "Отбори", icon: "🛡️" },
  { to: "/arhiv", label: "Архив", icon: "🗂️" },
];

export function Header() {
  return (
    <header className="site-header">
      <div className="brand">
        <img src="./logo-square.png" alt="А Група" className="brand-mark" />
        <span className="brand-text">А Група</span>
      </div>
      <nav className="top-nav">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.to === "/"} className={({ isActive }) => (isActive ? "active" : "")}>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <NotifyButton />
    </header>
  );
}

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      {links.map((l) => (
        <NavLink key={l.to} to={l.to} end={l.to === "/"} className={({ isActive }) => (isActive ? "active" : "")}>
          <span className="bn-icon">{l.icon}</span>
          <span className="bn-label">{l.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
