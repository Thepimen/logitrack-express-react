<div align="center">

<img src="./public/favicon.svg" alt="LogiTrack Express Minimalist Logo" width="72" height="72" />

# LogiTrack Express `v4.1`

**Plataforma Híbrida Reactiva de Recepción, Inspección Técnica, Seguimiento 3D y Clasificación de Envíos en Planta**

*Actividad 2 Evaluable — Desarrollo de Interfaces (Código 0488) · 2º Curso CFGS DAM · Instituto Nebrija de Formación Profesional*

[![Producción en Vercel](https://img.shields.io/badge/LIVE_DEMO-Vercel_Production-2563EB?style=for-the-badge&logo=vercel&logoColor=white)](https://logitrack-express-react.vercel.app)
[![CI/CD Pipeline](https://img.shields.io/github/actions/workflow/status/Thepimen/logitrack-express-react/ci-cd.yml?branch=main&style=for-the-badge&logo=githubactions&logoColor=white&label=CI%2FCD)](https://github.com/Thepimen/logitrack-express-react/actions)
[![Release v4.1.0](https://img.shields.io/badge/Release-v4.1.0-1D4ED8?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Thepimen/logitrack-express-react/releases)
[![WCAG 2.1 AAA](https://img.shields.io/badge/Lighthouse_Accessibility-100%2F100-059669?style=for-the-badge&logo=lighthouse&logoColor=white)](#auditoria-chrome-lighthouse-7-rutas-en-produccion)

**Enlace directo a producción:** [https://logitrack-express-react.vercel.app](https://logitrack-express-react.vercel.app)

</div>

---

## Vista General del Proyecto

<div align="center">
  <a href="https://logitrack-express-react.vercel.app">
    <img src="./docs/images/dashboard-bento-light.png" alt="LogiTrack Express v4.1 — Panel Operativo Bento en Modo Claro con buscador centrado y barras progresivas" width="100%" />
  </a>
</div>

**LogiTrack Express** es una aplicación web híbrida orientada a operarios de centros logísticos que unifica:

- **Panel Operativo Bento compacto (`/terminal`)** con barra superior en una sola fila y **buscador centrado**, **barras de carga progresiva en vivo (`0% → 100%`)**, contadores incrementales, gráfico Donut animado, **Cinta de Tareas por Sector** y paginación estricta de `3` envíos por página.
- **Tema Global Claro y Oscuro persistente** controlado por el usuario en las **7 rutas** (`/`, `/login`, `/register`, `/terminal`, `/telemetry`, `/cloud-infra`, `/audit-wcag`), con **scroll nativo para touchpad desbloqueado** sobre Ionic v8.
- **Visor 3D Interactivo de la Cinta Transportadora (`/telemetry`)** con control de inclinación/rotación, selección directa de bultos y trazabilidad mediante **UUID v4 (128 bits)**.
- **Persistencia Cloud Dual**: **Supabase PostgreSQL** (`public.warehouse_packages` y `public.warehouse_operators`) + **AWS Emulator (LocalStack v3.8)** en Docker (`DynamoDB`, `S3` y `SQS`) con verificación automática en **GitHub Actions CI/CD**.

---

## Stack Tecnológico Utilizado

<div align="center">
  <img src="./docs/images/tech-stack-banner.png" alt="Stack Tecnológico Integral de LogiTrack Express v4.1" width="100%" />
</div>

<p align="center">
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/Ionic_v8-3880FF?style=for-the-badge&logo=ionic&logoColor=white" alt="Ionic v8" />
  <img src="https://img.shields.io/badge/TypeScript_5.7_Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5.7" />
  <img src="https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/RxJS_7.8-B7178C?style=for-the-badge&logo=reactivex&logoColor=white" alt="RxJS 7.8" />
  <img src="https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E" alt="Supabase" />
  <img src="https://img.shields.io/badge/PostgreSQL_16-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL 16" />
  <img src="https://img.shields.io/badge/AWS_Emulator_(LocalStack)-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" alt="AWS Emulator LocalStack" />
  <img src="https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Compose" />
  <img src="https://img.shields.io/badge/GitHub_Actions_CI/CD-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions CI/CD" />
  <img src="https://img.shields.io/badge/Vercel_Edge-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

| Capa | Tecnologías | Rol en el Proyecto |
| :--- | :--- | :--- |
| **Frontend Core** | `React 19.0` · `React Router 7` · `TypeScript 5.7 (strict: true)` | Reconciliación concurrente Fiber, tipado estricto sin `any` y enrutamiento SPA de 7 vistas con `ProtectedRoute`. |
| **UI Híbrida & Animación** | `@ionic/react 8.5` · `Ionicons 7.4` · `Framer Motion 12` | Web Components oficiales (`IonHeader`, `IonSearchbar`, `IonList`, `IonItemSliding`), barras progresivas en vivo y transiciones suaves. |
| **Reactividad & Calidad** | `RxJS 7.8` · `Chrome Lighthouse` · `Playwright` | Filtrado con `debounceTime`, `distinctUntilChanged`, `switchMap` y limpieza determinista `takeUntil()` (0 memory leaks). |
| **Base de Datos Cloud** | `Supabase PostgreSQL` (`eu-west-3`) | Persistencia real CRUD de envíos (`warehouse_packages`) y operarios (`warehouse_operators`) con claves `UUID v4` y RLS. |
| **Cloud Emulator & DevOps** | `Docker Compose` · `LocalStack v3.8` · `GitHub Actions` · `Vercel` | Emulación local de `DynamoDB`, `S3` y `SQS` en puerto `4566`, validación continua en CI/CD y despliegue continuo en Vercel Edge. |

---

## Galería de Vistas en Producción

<table>
  <tr>
    <td width="50%" align="center">
      <strong>Portada Corporativa — Modo Claro (<code>/</code>)</strong><br/><br/>
      <img src="./docs/images/landing-light.png" alt="Landing Page Modo Claro" />
    </td>
    <td width="50%" align="center">
      <strong>Portada Corporativa — Modo Oscuro (<code>/</code>)</strong><br/><br/>
      <img src="./docs/images/landing-dark.png" alt="Landing Page Modo Oscuro" />
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <strong>Panel Operativo Bento — Modo Oscuro (<code>/terminal</code>)</strong><br/><br/>
      <img src="./docs/images/dashboard-bento-dark.png" alt="Dashboard Bento Modo Oscuro" />
    </td>
    <td width="50%" align="center">
      <strong>Cinta Transportadora 3D y UUID v4 (<code>/telemetry</code>)</strong><br/><br/>
      <img src="./docs/images/conveyor-3d-stage.png" alt="Cinta Transportadora 3D" />
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <strong>Sincronización, AWS Emulator y Respaldo (<code>/cloud-infra</code>)</strong><br/><br/>
      <img src="./docs/images/cloud-aws-emulator.png" alt="Centro de Sincronización y AWS Emulator" />
    </td>
    <td width="50%" align="center">
      <strong>Chrome Lighthouse 100/100 en Producción (<code>/terminal</code>)</strong><br/><br/>
      <img src="./docs/images/lighthouse-terminal-100.png" alt="Lighthouse 100/100 Accesibilidad" />
    </td>
  </tr>
</table>

---

## Auditoría Chrome Lighthouse (7 Rutas en Producción)

Todas las rutas desplegadas en [`https://logitrack-express-react.vercel.app`](https://logitrack-express-react.vercel.app) han sido auditadas con Chrome Lighthouse en modo Desktop sobre producción real:

| Ruta en Producción | Performance | Accessibility (WCAG 2.1) | Best Practices | SEO |
| :--- | :---: | :---: | :---: | :---: |
| `/` (Landing Page) | **99 / 100** | **100 / 100** | **100 / 100** | **100 / 100** |
| `/login` (Inicio de sesión) | **98 / 100** | **100 / 100** | **100 / 100** | **100 / 100** |
| `/register` (Registro de operario) | **98 / 100** | **100 / 100** | **100 / 100** | **100 / 100** |
| `/terminal` (Panel Bento paginado) | **97 / 100** | **100 / 100** | **100 / 100** | **100 / 100** |
| `/telemetry` (Cinta 3D interactiva) | **99 / 100** | **100 / 100** | **100 / 100** | **100 / 100** |
| `/cloud-infra` (Respaldo y AWS Emulator) | **97 / 100** | **100 / 100** | **100 / 100** | **100 / 100** |
| `/audit-wcag` (Calidad y diagnóstico 50 ciclos) | **98 / 100** | **100 / 100** | **100 / 100** | **100 / 100** |

---

## Flujo de Ramas, Tags y Releases (Recorrido del Proyecto)

El repositorio documenta la evolución incremental de la plataforma mediante ramas temáticas y etiquetas semánticas:

- `main` — Rama estable en producción desplegada automáticamente en Vercel (`v4.1.0`).
- `develop` — Rama de integración continua sincronizada con `main`.
- `feat/wcag-lighthouse-100` — Auditoría WCAG 2.1 AAA, limpieza de streams RxJS y SEO (`v2.4.0`).
- `feat/aws-emulator-cicd-landing` — Portada corporativa azul, emulador AWS LocalStack (`:4566`) y GitHub Actions CI/CD (`v3.0.0`).
- `feat/bento-dashboard-dark-mode` — Desbloqueo scroll touchpad, tema global Claro/Oscuro, Login/Registro dedicados y Panel Bento paginado (`v4.0.0`).
- `feat/v4.1-live-progress-centered-search` — Buscador centrado en una fila, barras de carga progresivas, animaciones suaves y favicon minimalista (`v4.1.0`).

---

## Arranque Local, Docker + AWS Emulator y Credenciales Demo

### 1. Instalación y servidor de desarrollo

```bash
git clone https://github.com/Thepimen/logitrack-express-react.git
cd logitrack-express-react
cp .env.example .env
npm ci
npm run dev
```

### 2. Deploy local de Docker + AWS Emulator (LocalStack v3.8 + PostgreSQL 16)

```bash
# Opción A — Docker Compose (LocalStack v3.8 en :4566 + PostgreSQL 16 en :54322)
docker compose up -d
npm run aws:verify

# Opción B — Sin Docker Desktop (emulador Node.js wire-compatible en el mismo puerto :4566)
npm run aws:emulator
npm run aws:verify
```

### 3. Perfiles de operario de demostración (`/login`)

| Placa de Operario | Clave de Acceso | Rol y Centro |
| :--- | :--- | :--- |
| `OP-MAD-0488` | `LT-2026-DAM` | Inspector Jefe — `MAD-HUB-01` (Cinta C1) |
| `OP-BCN-0219` | `LT-2026-BCN` | Operadora Sénior — `BCN-ZAL` (Sector A2) |

También puedes dar de alta un nuevo operario en tiempo real desde [`/register`](https://logitrack-express-react.vercel.app/register).

---

<div align="center">
  <strong>Desarrollado por Luis Lázaro Pimentel (@Thepimen)</strong> · 2º DAM · Desarrollo de Interfaces (0488) · Instituto Nebrija FP
</div>
