create table if not exists vehicle_specs (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  spec_key text not null,
  value text not null,
  unit text,
  source_id uuid references sources(id) on delete set null,
  source_page int,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (vehicle_id, spec_key)
);
create index if not exists vehicle_specs_vehicle on vehicle_specs(vehicle_id);
