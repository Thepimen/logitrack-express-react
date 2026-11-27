# DESIGN.md — LogiTrack Express v3.0 (Sapphire Blue Glassmorphism & Psychological UI)

> **Arquitectura de Diseño de Interfaz (Actividad 2 · Desarrollo de Interfaces · 2º DAM · Instituto Nebrija)**
> **Autor:** Luis Lázaro Pimentel (`@Thepimen`)
> **Especificación basada en:**
> 1. **Psicología del Color Azul (450–495 nm):** Calibración óptica para claridad cognitiva, confianza técnica y reducción de fatiga retiniana tanto en la Landing Page editorial (`/`) como en el terminal nocturno (`/terminal`).
> 2. **Glassmorphism de Precisión (`backdrop-filter: blur(20px) saturate(170%)`):** Capas translúcidas con reflejo especular superior (`1px`) y elevación interactiva con **Framer Motion** (`staggerChildren`, `whileHover={{ y: -5 }}`).
> 3. [`emilkowalski/skills`](https://github.com/emilkowalski/skills), [`Leonxlnx/taste-skill`](https://github.com/Leonxlnx/taste-skill) y [`VoltAgent/awesome-design-md`](https://github.com/VoltAgent/awesome-design-md).

---

## 1. Psicología Cromática Azul y Sistema Dual de Luminosidad

| Capa / Superficie | Token Cromático | Hex / RGBA | Uso y Fundamento Psicológico | Contraste WCAG 2.1 |
| :--- | :--- | :--- | :--- | :--- |
| **Landing Canvas (Día)** | `glacier.canvas` | `#F5F9FF → #E4EFFE` | Descanso retiniano evitando el blanco absoluto `#FFFFFF`; transmite apertura y claridad. | **15.2 : 1 (AAA)** con `#0A1E3D` |
| **Acento Primario** | `cobalt.trust` | `#1D4ED8 → #0369A1` | Confianza institucional y dirección focal de CTAs primarios. | **7.1 : 1 (AAA)** con `#FFFFFF` |
| **Foco y Vidrio** | `cerulean.focus` | `#38BDF8 / #BAE6FD` | Micro-interacciones, bordes especulares de vidrio y anillo `:focus-visible`. | **11.6 : 1 (AAA)** sobre `#050B18` |
| **Terminal Nocturno** | `abyssal.sapphire` | `#050B18 → #071226` | Entornos industriales de baja luminosidad sin deslumbramiento pupilar. | **16.5 : 1 (AAA)** con `#F0F7FF` |
| **Panel Translúcido** | `glass.surface` | `rgba(16, 36, 72, 0.74)` + `blur(20px)` | Profundidad espacial inmediata mediante refracción controlada sobre orbes zafiro. | **11.5 : 1 (AAA)** con `#CBD9EE` |

---

## 2. Matriz Semántica de Estados Logísticos (Contraste Verificado AAA)

| Token Semántico | Fondo Badge | Texto Badge | Borde | Ratio de Contraste | Conformidad WCAG 2.1 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `status.INSPECTED` | `#052E16` | `#6EE7B7` | `#10B981` | **11.12 : 1** | **AAA** |
| `status.IN_TRANSIT` | `#0C2D57` | `#BAE6FD` | `#38BDF8` | **10.94 : 1** | **AAA** |
| `status.REJECTED` | `#450A0A` | `#FECACA` | `#EF4444` | **10.76 : 1** | **AAA** |
| `priority.CRITICAL` | `#7F1D1D` | `#FEF2F2` | `#F87171` | **9.45 : 1** | **AAA** |
| `priority.STANDARD` | `#172554` | `#DBEAFE` | `#60A5FA` | **10.42 : 1** | **AAA** |

---

## 3. Coreografía de Animaciones Glassy (`Framer Motion` + `GlassyReveal.tsx`)

1. **Despliegue Orquestado en Cascada (`GlassyStagger`):** Al montar cada vista o pulsar `ANIMAR`, todos los KPIs, paneles de cristal, bloques del AWS Emulator y tarjetas de paquetes entran secuencialmente con `staggerChildren: 0.065`, física de resorte (`stiffness: 250, damping: 24`) y barrido especular GPU (`.lt-glass-sheen`).
2. **Respuesta Táctil y Hover Elástico:** Elevación `whileHover={{ y: -5 }}` y compresión `scale(0.97)` al pulsar, respetando automáticamente `prefers-reduced-motion` mediante `<MotionConfig reducedMotion="user">`.
3. **Landing Page Editorial a Medida (`/`):** Cabecera minimalista limpia, formas geométricas vectoriales azules flotantes, barra lateral vertical de progreso por puntos y tarjeta central elevada con palabra resaltada animada (`Telemetry` → `UUID v4` → `AWS Cloud` → `WCAG AAA`) y datos en directo de Supabase PostgreSQL.
