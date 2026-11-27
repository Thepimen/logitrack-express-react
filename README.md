# LogiTrack Express v3.0 — Sapphire Glass UI, Dual DB, AWS Emulator & CI/CD

> **Actividad 2 Evaluable — Desarrollo de Interfaces (Código 0488)**
> **Ciclo:** 2º Curso CFGS DAM · Instituto Nebrija de Formación Profesional (2026/2027)
> **Autor:** Luis Lázaro Pimentel (`@Thepimen`)
> **Producción (Vercel Edge):** https://logitrack-express-react.vercel.app
> **Repositorio Público:** https://github.com/Thepimen/logitrack-express-react

---

## Novedades de la Arquitectura v3.0

1. **Landing Page a Medida (`/`) con Paleta Azul Psicológica:** Diseño editorial limpio con formas geométricas azules flotantes, barra de progreso vertical por puntos y tarjeta central Glassmorphism con datos en vivo de Supabase PostgreSQL.
2. **Interfaz Glassmorphism Zafiro + Despliegue en Cascada (`Framer Motion`):** Paneles translúcidos (`backdrop-filter: blur(20px)`), entrada escalonada (`staggerChildren`) y elevación táctil (`whileHover={{ y: -5 }}`) respetando `prefers-reduced-motion` y logrando **100/100 en Chrome Lighthouse Accessibility** en todas las rutas.
3. **Persistencia Dual (Supabase PostgreSQL + AWS Emulator LocalStack v3.8):**
   - Base de datos relacional real en **Supabase PostgreSQL** (`supabase/schema.sql`, tablas `warehouse_packages` y `warehouse_operators` con RLS).
   - **AWS Emulator** (`docker-compose.yml` con LocalStack v3.8 + emulador nativo `aws/emulator-server.mjs` en puerto `4566`) emulando **Amazon DynamoDB** (`LogiTrackPackages`), **Amazon S3** (`logitrack-manifests-eu-west-3`) y **Amazon SQS** (`logitrack-inspection-events`), gestionable en vivo desde `/cloud-infra`.
4. **Pipeline CI/CD Automatizado (`.github/workflows/ci-cd.yml`):** Integración Continua (TypeScript strict, Vite build, auditoría de secretos, smoke test real sobre el AWS Emulator) y Despliegue Continuo en Vercel.

## Comandos Rápidos

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar plantilla de variables de entorno y rellenar credenciales de Supabase
cp .env.example .env

# 3. Arrancar el AWS Emulator local (puerto 4566) — Opción A (Node.js) o Opción B (Docker LocalStack)
npm run aws:emulator
# o con Docker Desktop:
docker compose up -d

# 4. Verificar DynamoDB + S3 + SQS en el AWS Emulator
npm run aws:verify

# 5. Ejecutar servidor de desarrollo Ionic + React + Vite
npm run dev

# 6. Verificación de tipos estricta y compilación de producción
npm run build
```
