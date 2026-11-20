# LogiTrack Express — Terminal Industrial Híbrido de Recepción, Inspección Técnica y Clasificación en Cinta Transportadora

> **Actividad 2 Evaluable · Desarrollo de Interfaces (Código 0488)**
> **Ciclo:** 2º Curso — CFGS Desarrollo de Aplicaciones Multiplataforma (DAM)
> **Centro:** Instituto Nebrija de Formación Profesional
> **Curso Académico:** 2026/2027 · 1ª Evaluación
> **Alumno:** Luis Lázaro Pimentel (`@Thepimen`)

---

## 1. Resumen Arquitectónico y Stack Tecnológico

**LogiTrack Express** es una aplicación híbrida reactiva (SPA/PWA) para terminales industriales y tablets de operarios de almacén a pie de cinta transportadora, diseñada bajo un patrón **Component-Driven Architecture / MVVM** con persistencia real en **Supabase PostgreSQL** (`eu-west-3`), identificadores criptográficos **UUID v4 (RFC 9562)**, **Gemelo Digital Isométrico 3D** acelerado por hardware y conformidad **WCAG 2.1 Nivel AA / AAA (100/100 en Chrome Lighthouse)**.

| Capa / Tecnología | Versión Exacta | Rol en la Arquitectura |
| :--- | :--- | :--- |
| **React + React DOM** | `19.0.0` | Motor de reconciliación concurrente Fiber, Custom Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`, `useDeferredValue`, `useRef`) y renderizado condicional en JSX. |
| **Ionic Framework (`@ionic/react`)** | `^8.5.0` | Componentes visuales híbridos nativos (`IonApp`, `IonHeader`, `IonToolbar`, `IonSearchbar`, `IonList`, `IonItemSliding`, `IonItem`, `IonBadge`, `IonButton`, `IonIcon`). |
| **TypeScript** | `~5.7.3` | Tipado estático estricto (`"strict": true`, `"noImplicitAny": true`, `"strictNullChecks": true`). |
| **Supabase JS (`@supabase/supabase-js`)** | `^2.49.1` | Cliente REST/PostgREST contra PostgreSQL real (`public.warehouse_packages` y `public.warehouse_operators`) con políticas RLS activas. |
| **RxJS** | `^7.8.1` | Streams reactivos (`debounceTime`, `distinctUntilChanged`, `switchMap`, `takeUntil`) auditados y comparados con React Hooks en la Tarea 5. |
| **Vite** | `^6.2.0` | Bundler ESM de alta velocidad con árbol de módulos optimizado para producción en Vercel. |

---

## 2. Estructura Limpia por Capas (RA 1)

```text
logitrack-express-react/
├── DESIGN.md                                 # Especificación formal de diseño industrial (VoltAgent + taste-skill + emilkowalski)
├── vercel.json                               # Rewrites SPA hacia /index.html y cabeceras de seguridad HTTP
├── tsconfig.json                             # Configuración TypeScript estricta ("strict": true)
├── supabase/
│   └── schema.sql                            # DDL PostgreSQL (UUID v4, tablas, políticas RLS y semilla)
└── src/
    ├── config/
    │   └── supabase.ts                       # Cliente Supabase validado mediante variables de entorno VITE_*
    ├── models/
    │   ├── package.model.ts                  # Interfaz WarehousePackage, tipos y generador/validador UUID v4
    │   └── operator.model.ts                 # Interfaz WarehouseOperator para control de turno
    ├── services/
    │   ├── package.service.ts                # PackageService (Array inmutable + CRUD real SELECT/INSERT/UPDATE/DELETE)
    │   ├── auth.service.ts                   # AuthService (Autenticación real de operarios contra PostgreSQL)
    │   └── rxjs-search-audit.service.ts      # Tarea 5: Comparativa y motor RxJS con cancelación takeUntil(destroy$)
    ├── hooks/
    │   ├── useDebouncedPackageSearch.ts      # Hook declarativo de filtrado con debounce (180ms) sin memory leaks
    │   └── useWarehousePackages.ts           # Hook de orquestación reactiva y métricas computadas (useMemo)
    ├── components/
    │   ├── PackageInspectionCard.tsx         # Tarea 3: Custom Component reutilizable (@Input pkg / @Output onStatusChange)
    │   ├── Conveyor3DStage.tsx               # Gemelo Digital Isométrico 3D de cinta transportadora y pórtico láser
    │   ├── IndustrialNavbar.tsx              # Cabecera IonHeader/IonToolbar con desmontaje real de controles privados
    │   ├── NewPackageForm.tsx                # Formulario controlado con validación progresiva y UUID v4
    │   └── ProtectedRoute.tsx                # Guardián de rutas SPA
    └── pages/
        ├── LoginPage.tsx                     # Terminal de autenticación industrial con visor 3D
        ├── HomePage.tsx                      # Tarea 2 y 3: Vista principal declarativa con IonSearchbar e IonList
        ├── Telemetry3DPage.tsx               # Escáner 3D a pantalla completa + inspector UUID v4 y Hooks
        └── WcagAndAiAuditPage.tsx            # Tarea 4 y 5: Matriz WCAG 2.1 AA/AAA y benchmark de memoria IA
```

---

## 3. Ejecución Local y Compilación

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo (puerto 8100 compatible con ionic serve)
npm run dev

# 3. Verificación de tipos estricta y compilación de producción
npm run build
```
