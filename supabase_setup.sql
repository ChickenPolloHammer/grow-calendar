-- Ejecuta esto en el SQL Editor de tu proyecto Supabase
-- (supabase.com → tu proyecto → SQL Editor → New query)

create table if not exists grow_data (
  device_id  text primary key,
  payload    jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Permite lectura y escritura pública (sin auth, como localStorage)
alter table grow_data enable row level security;

create policy "allow_all" on grow_data
  for all using (true) with check (true);
