-- ============================================================================
-- Actividad 2 Evaluable - Desarrollo de Interfaces (2º DAM - Instituto Nebrija)
-- Proyecto: LogiTrack Express (React 19 + Ionic Framework v8 + TypeScript + Supabase)
-- Alumno: Luis Lázaro Pimentel
-- ============================================================================

create extension if not exists "pgcrypto";

drop table if exists public.warehouse_operators cascade;
drop table if exists public.warehouse_packages cascade;

-- 1. Tabla principal de paquetes en cinta transportadora (Tarea 1 - WarehousePackage)
create table public.warehouse_packages (
  id uuid primary key default gen_random_uuid(),
  tracking_code varchar(30) not null unique,
  destination_hub varchar(150) not null,
  weight_kg numeric(6,2) not null check (weight_kg > 0),
  priority varchar(20) not null check (priority in ('CRITICAL', 'STANDARD', 'LOW')),
  status varchar(20) not null check (status in ('IN_TRANSIT', 'INSPECTED', 'REJECTED')),
  timestamp timestamptz not null default now(),
  aisle_bay varchar(40) not null default 'BAY-A01',
  inspector_notes text default ''
);

-- 2. Tabla de operarios de almacén para autenticación real y trazabilidad de turno
create table public.warehouse_operators (
  id uuid primary key default gen_random_uuid(),
  badge_id varchar(30) not null unique,
  full_name varchar(120) not null,
  email varchar(150) not null unique,
  access_pin varchar(60) not null,
  role varchar(100) not null default 'Senior Line Inspector',
  assigned_hub varchar(120) not null default 'MAD-HUB-01 (Coslada)',
  shift varchar(120) not null default 'Turno Noche · Baja Luminosidad',
  active boolean not null default true
);

-- 3. Permisos y Políticas RLS para acceso desde el cliente frontend
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.warehouse_packages to anon, authenticated;
grant select, insert, update, delete on table public.warehouse_operators to anon, authenticated;

alter table public.warehouse_packages enable row level security;
alter table public.warehouse_operators enable row level security;

create policy "logitrack_packages_rls_policy"
  on public.warehouse_packages
  for all
  to anon, authenticated
  using (true)
  with check (true);

create policy "logitrack_operators_rls_policy"
  on public.warehouse_operators
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- 4. Semilla inicial de paquetes (formato oficial LTK-XXXX-ES y UUIDs v4 reales)
insert into public.warehouse_packages (
  id, tracking_code, destination_hub, weight_kg, priority, status, timestamp, aisle_bay, inspector_notes
)
values
  ('a1f4e8c2-7b3d-4e9a-9c1b-2d8f6a4e5b10', 'LTK-4821-ES', 'MAD-Cargo Terminal T4', 18.45, 'CRITICAL', 'IN_TRANSIT', now() - interval '42 minutes', 'CONVEYOR-C1 · S04', 'Carga farmacéutica termolábil - Requiere verificación prioritaria de precinto'),
  ('b2e7d9a1-5c4f-4a8b-8d2e-3f9a7b5c6d21', 'LTK-9034-ES', 'BCN-ZAL Prat Logistics', 6.80, 'STANDARD', 'INSPECTED', now() - interval '1 hour 15 minutes', 'CONVEYOR-A2 · S01', 'Inspección óptica superada sin anomalías estructurales'),
  ('c3d6c0b4-3e5a-4b7c-9e3f-4a0b8c6d7e32', 'LTK-1150-ES', 'VLC-Puerto Hub Este', 32.10, 'CRITICAL', 'IN_TRANSIT', now() - interval '18 minutes', 'CONVEYOR-C1 · S08', 'Componentes electrónicos de alta densidad - Revisión de sensor de impacto'),
  ('d4c5b1a3-1f6b-4c6d-8f4a-5b1c9d7e8f43', 'LTK-7742-ES', 'SVQ-Aerópolis Sur', 11.20, 'STANDARD', 'IN_TRANSIT', now() - interval '55 minutes', 'CONVEYOR-B3 · S02', 'Embalaje estándar paletizado en tránsito por cinta secundaria'),
  ('e5b4a2f6-9a7c-4d5e-9a5b-6c2d0e8f9a54', 'LTK-3390-ES', 'BIO-Abando Industrial', 24.90, 'LOW', 'REJECTED', now() - interval '2 hours 10 minutes', 'QUARANTINE-Q1 · R02', 'Etiqueta RFID deteriorada y discrepancia de tara (+2.4 kg)'),
  ('f6a3f3e5-7b8d-4e4f-8b6c-7d3e1f9a0b65', 'LTK-6208-ES', 'ZAZ-Plaza Plataforma', 4.35, 'STANDARD', 'INSPECTED', now() - interval '1 hour 40 minutes', 'CONVEYOR-A2 · S05', 'Verificación láser completada y clasificado para salida nacional'),
  ('0792e4d8-5c9e-4f3a-9c7d-8e4f2a0b1c76', 'LTK-8519-ES', 'MAD-Coslada Hub Central', 41.60, 'CRITICAL', 'IN_TRANSIT', now() - interval '9 minutes', 'CONVEYOR-C1 · S09', 'Maquinaria de precisión urgente - Prioridad de embarque inmediato'),
  ('1881d5c7-3d0f-4a2b-8d8e-9f5a3b1c2d87', 'LTK-2047-ES', 'AGP-Parque Tecnológico', 2.75, 'LOW', 'IN_TRANSIT', now() - interval '3 hours 05 minutes', 'CONVEYOR-B3 · S07', 'Paquetería ligera consolidada pendiente de escaneo final');

-- 5. Semilla inicial de operarios autorizados para el terminal industrial
insert into public.warehouse_operators (
  id, badge_id, full_name, email, access_pin, role, assigned_hub, shift, active
)
values
  ('91a0b2c3-4d5e-4f6a-8b7c-9d0e1f2a3b4c', 'OP-MAD-0488', 'Luis Lázaro Pimentel', 'llazaro@logitrack-express.es', 'LT-2026-DAM', 'Lead Telemetry & QA Inspector', 'MAD-HUB-01 · Cinta Transportadora C1', 'Turno Industrial Nocturno (Baja Luminosidad)', true),
  ('82b1c3d4-5e6f-4a7b-9c8d-0e1f2a3b4c5d', 'OP-BCN-0219', 'Elena Vance', 'evance@logitrack-express.es', 'LT-2026-BCN', 'Senior Line Operator', 'BCN-ZAL · Sector Clasificación A2', 'Turno Tarde · Alta Cadencia', true);

-- Forzar recarga inmediata de esquema en PostgREST
notify pgrst, 'reload schema';
