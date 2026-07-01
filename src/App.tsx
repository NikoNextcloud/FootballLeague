// src/App.tsx
import { HashRouter, Routes, Route } from "react-router-dom";
import { Header, BottomNav } from "./components/Nav";
import Home from "./pages/Home";
import Standings from "./pages/Standings";
import Matches from "./pages/Matches";
import Teams from "./pages/Teams";
import TeamDetail from "./pages/TeamDetail";
import Scorers from "./pages/Scorers";
import Archive from "./pages/Archive";

export default function App() {
  return (
    <HashRouter>
      <Header />
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/klasirane" element={<Standings />} />
          <Route path="/machove" element={<Matches />} />
          <Route path="/golmaistori" element={<Scorers />} />
          <Route path="/otbori" element={<Teams />} />
          <Route path="/otbori/:id" element={<TeamDetail />} />
          <Route path="/arhiv" element={<Archive />} />
        </Routes>
      </main>
      <BottomNav />
      <footer className="site-footer">
        <p>А Група — фен сайт с автоматично обновявани данни от TheSportsDB</p>
      </footer>
    </HashRouter>
  );
}
