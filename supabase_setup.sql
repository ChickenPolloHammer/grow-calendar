-- ============================================================
-- Ejecuta esto en SQL Editor de Supabase (reemplaza el anterior)
-- ============================================================

-- Eliminar tabla antigua si existe
drop table if exists grow_data;

-- Tabla de cultivos: uno por fila, N cultivos por usuario
create table if not exists grows (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null default 'Cultivo sin nombre',
  germ_date  text,
  harvest_date text,
  calendar_data jsonb not null default '{}'::jsonb,
  schedule_base jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índice para cargar rápido los cultivos de un usuario
create index if not exists grows_user_id_idx on grows(user_id, updated_at desc);

-- RLS: cada usuario solo ve y modifica sus cultivos
alter table grows enable row level security;

drop policy if exists "users_own_grows" on grows;
create policy "users_own_grows" on grows
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
