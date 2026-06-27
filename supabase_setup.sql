-- Ejecuta esto en el SQL Editor de tu proyecto Supabase
-- Si ya tienes la tabla antigua (con device_id), ejecuta primero el bloque de migración al final

-- ─── TABLA PRINCIPAL ───────────────────────────────────────────────────────────
create table if not exists grow_data (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  payload    jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ─── ROW LEVEL SECURITY ────────────────────────────────────────────────────────
-- Cada usuario solo puede ver y modificar sus propios datos
alter table grow_data enable row level security;

drop policy if exists "users_own_data" on grow_data;
create policy "users_own_data" on grow_data
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── MIGRACIÓN (solo si venías de la versión con device_id) ────────────────────
-- Si tu tabla antigua se llama grow_data y tenía device_id como primary key,
-- renómbrala primero y luego recrea:
--
-- alter table grow_data rename to grow_data_old;
-- (luego ejecuta el bloque de arriba)
