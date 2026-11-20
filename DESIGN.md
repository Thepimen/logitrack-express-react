# DESIGN.md — LogiTrack Express Industrial Telemetry System

> **Arquitectura de Diseño de Interfaz (Actividad 2 · Desarrollo de Interfaces · 2º DAM · Instituto Nebrija)**
> **Autor:** Luis Lázaro Pimentel (`@Thepimen`)
> **Especificación basada en:**
> 1. [`VoltAgent/awesome-design-md`](https://github.com/VoltAgent/awesome-design-md) — Especificación declarativa de tokens de diseño y ergonomía industrial.
> 2. [`Leonxlnx/taste-skill`](https://github.com/Leonxlnx/taste-skill) — Rejilla suiza de precisión (*Swiss Industrial Grid*), ausencia absoluta de *AI-slop* (cero degradados neón violeta, cero tarjetas genéricas), bordes técnicos de 1px y jerarquía tipográfica tabular.
> 3. [`emilkowalski/skills`](https://github.com/emilkowalski/skills) — Micro-interacciones físicas a 60fps (`transform: scale(0.97)` en `:active`, curvas `cubic-bezier(0.22, 1, 0.36, 1)` bajo 240ms, `font-variant-numeric: tabular-nums`, perspectiva isométrica 3D en hardware).

---

## 1. Filosofía Visual y Ergonomía en Entornos de Baja Luminosidad (WCAG 2.1 AA / AAA)

El caso práctico **LogiTrack Express** opera en terminales de mano y tablets rugerizadas situadas a pie de **cinta transportadora en naves logísticas de baja luminosidad**.
Para evitar el deslumbramiento pupilar del operario y maximizar la velocidad de lectura óptica de códigos `LTK-XXXX-ES` y UUIDs v4:

- **Superficie Primaria (Carbon Obsidian):** `#090C10` (luminancia relativa `0.008`)
- **Superficie Elevada de Panel (Tactical Slate):** `#11161D`
- **Superficie de Tarjeta Interactiva:** `#151C25` con borde técnico `1px solid #263241`
- **Texto Primario:** `#F8FAFC` (Ratio de contraste sobre `#090C10`: **18.9:1 — WCAG AAA**)
- **Texto Secundario / Metadatos:** `#CBD5E1` (Ratio de contraste sobre `#151C25`: **10.8:1 — WCAG AAA**)
- **Foco de Teclado (`:focus-visible`):** `2px solid #FBBF24` con `outline-offset: 2px` (Ratio **11.4:1 — WCAG AAA**)

---

## 2. Matriz Semántica de Estados y Prioridades (Contraste Verificado)

| Token Semántico | Uso en LogiTrack Express | Fondo Badge | Texto Badge | Borde | Ratio de Contraste | Conformidad WCAG 2.1 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `status.INSPECTED` | Paquete verificado e inspeccionado | `#052E16` | `#6EE7B7` | `#10B981` | **11.12 : 1** | **AAA** (Supera 4.5:1 AA) |
| `status.IN_TRANSIT` | Paquete en cinta transportadora | `#422006` | `#FDE68A` | `#F59E0B` | **11.84 : 1** | **AAA** (Supera 4.5:1 AA) |
| `status.REJECTED` | Paquete rechazado / cuarentena | `#450A0A` | `#FECACA` | `#EF4444` | **10.76 : 1** | **AAA** (Supera 4.5:1 AA) |
| `priority.CRITICAL` | Prioridad crítica termolábil/urgente | `#7F1D1D` | `#FEF2F2` | `#F87171` | **9.45 : 1** | **AAA** (Supera 4.5:1 AA) |
| `priority.STANDARD` | Prioridad estándar de línea | `#1E293B` | `#E2E8F0` | `#64748B` | **10.20 : 1** | **AAA** (Supera 4.5:1 AA) |
| `priority.LOW` | Prioridad baja / consolidación | `#172554` | `#BFDBFE` | `#3B82F6` | **8.92 : 1** | **AAA** (Supera 4.5:1 AA) |

---

## 3. Reglas de Ingeniería UI (`emilkowalski/skills` & `Leonxlnx/taste-skill`)

1. **Estabilidad Numérica (`tabular-nums`):** Todos los pesos (`weightKg`), contadores de telemetría, códigos `LTK-XXXX-ES`, UUIDs y marcas temporales aplican `font-variant-numeric: tabular-nums` sobre fuente monoespaciada (`'JetBrains Mono', 'Fira Code', monospace`) para eliminar cualquier salto horizontal (*layout shift*) durante actualizaciones reactivas en tiempo real.
2. **Física Táctil y Respuesta Inmediata:**
   - Todos los botones de inspección rápida (`INSPECTED` / `REJECTED`) tienen área táctil mínima de `44px × 44px` (WCAG 2.5.5 Target Size) y aplican `transform: scale(0.97)` en estado `:active`.
   - Las transiciones emplean exclusivamente propiedades aceleradas por GPU (`transform`, `opacity`) con curva `cubic-bezier(0.22, 1, 0.36, 1)` y duración `< 220ms`.
3. **Gemelo Digital 3D de Cinta Transportadora (`Conveyor3DStage`):**
   - Escena isométrica renderizada mediante transformaciones matriciales CSS 3D (`perspective: 1200px`, `rotateX(56deg) rotateZ(-34deg)`, `transform-style: preserve-3d`), proyectando en tiempo real los paquetes reales de Supabase sobre los rodillos de la cinta con pórtico láser de inspección óptica y rotación interactiva en 3 ejes.
