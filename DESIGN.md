# DESIGN.md — LogiTrack Express v4.0 (Sistema Dual Claro/Oscuro en Gama Azul & Bento Paginado)

> **Arquitectura de Diseño de Interfaz (Actividad 2 · Desarrollo de Interfaces · 2º DAM · Instituto Nebrija)**
> **Autor:** Luis Lázaro Pimentel (`@Thepimen`)

---

## 1. Coherencia Total de Tema (Claro / Oscuro Controlado por el Usuario)

A partir de la revisión UX **v4.0**, el usuario controla de forma global y persistente (`localStorage` + `data-theme="light" | "dark"`) el modo cromático en **todas las páginas sin saltos involuntarios**:
- **Modo Claro (`light`):** Lienzo *Glacier Ice* (`#F4F8FF → #E4EEFC`), superficies translúcidas (`rgba(255,255,255,0.84)` + `backdrop-filter: blur(20px)`), tipografía *Deep Royal Navy* (`#0A1E3D`, contraste **15.2:1 AAA**) y barra lateral azul cobalto (`#2563EB → #1D4ED8`).
- **Modo Oscuro (`dark`):** Lienzo *Abyssal Sapphire* (`#060D1E → #0A152E`), paneles de cristal oscuro (`rgba(18,34,68,0.78)` + `blur(20px)`), tipografía `#F0F7FF` (**16.5:1 AAA**) y acentos azul cielo (`#7DD3FC`).

## 2. Arquitectura de Navegación por Páginas y Layout Bento Compacto

1. **Armonía en Vistas Públicas (`/`, `/login`, `/register`):** La Landing Page, el Inicio de Sesión y el Registro comparten exactamente la misma cabecera limpia, formas geométricas azules flotantes y tarjeta central elevada.
2. **Panel Operativo "De un Vistazo" (`/terminal`):** Barra lateral vertical azul cobalto, banner de bienvenida, 3 tarjetas KPI con curvas de tendencia SVG, gráfico donut + barras de la cinta de tareas por sector, columna derecha fija con Perfil Operativo y Calendario de Turno, y **listado paginado (3 envíos por página)** para evitar desplazamientos largos.
3. **Corrección de Scroll Nativo en Touchpad:** Se anulan las restricciones heredadas de Ionic (`body { position: fixed; max-height: 100%; overflow: hidden; transform: translateZ(0); }`) devolviendo el scroll nativo al documento raíz (`html`) para gestos fluidos con dos dedos en touchpad y rueda de ratón.
4. **Orientación 100 % al Cliente Final:** Toda la interfaz visible utiliza terminología logística real libre de jerga técnica interna (el detalle del stack se reserva a la documentación técnica).
