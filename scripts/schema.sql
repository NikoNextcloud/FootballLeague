create table if not exists bf_snapshots (
  id bigserial primary key,
  source text not null,
  fetched_at timestamptz not null default now(),
  payload jsonb not null
);

create table if not exists bf_matches (
  match_uid text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists bf_standings_snapshot (
  id bigserial primary key,
  snapshot_at timestamptz not null default now(),
  team text not null,
  rank integer,
  played integer,
  wins integer,
  draws integer,
  losses integer,
  goals_for integer,
  goals_against integer,
  points integer
);

create index if not exists bf_snapshots_fetched_at_idx on bf_snapshots(fetched_at desc);
create index if not exists bf_matches_updated_at_idx on bf_matches(updated_at desc);
create index if not exists bf_standings_snapshot_team_idx on bf_standings_snapshot(team, snapshot_at desc);
