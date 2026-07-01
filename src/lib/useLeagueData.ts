// src/lib/useLeagueData.ts
import { useEffect, useState } from "react";
import type { LeagueData } from "../types";

const DATA_URL = `${import.meta.env.BASE_URL}data/league.json`;

interface State {
  data: LeagueData | null;
  loading: boolean;
  error: string | null;
}

export function useLeagueData() {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    fetch(`${DATA_URL}?t=${Date.now()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: LeagueData) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ data: null, loading: false, error: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
