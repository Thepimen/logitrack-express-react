import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  IonHeader,
  IonIcon,
  IonList,
  IonSearchbar,
  IonToolbar
} from '@ionic/react';
import {
  addOutline,
  alertCircleOutline,
  calendarOutline,
  checkmarkCircleOutline,
  checkmarkDoneCircleOutline,
  chevronBackOutline,
  chevronForwardOutline,
  cubeOutline,
  filterOutline,
  layersOutline,
  refreshOutline,
  sparklesOutline
} from 'ionicons/icons';
import {
  PriorityFilter,
  StatusFilter,
  WarehousePackage
} from '../models/package.model';
import { WarehouseOperator } from '../models/operator.model';
import { UseWarehousePackagesReturn } from '../hooks/useWarehousePackages';
import { ThemeToggleButton } from '../context/ThemeContext';
import { PackageInspectionCard } from '../components/PackageInspectionCard';
import { NewPackageForm } from '../components/NewPackageForm';
import { GlassyReveal, GlassyStagger } from '../components/GlassyReveal';

export interface HomePageProps {
  readonly warehouseState: UseWarehousePackagesReturn;
  readonly operator: WarehouseOperator | null;
}

const ITEMS_PER_PAGE = 3;

const PRIORITY_OPTIONS: ReadonlyArray<{ value: PriorityFilter; label: string }> = [
  { value: 'ALL', label: 'Todas las prioridades' },
  { value: 'CRITICAL', label: 'Prioridad Crítica' },
  { value: 'STANDARD', label: 'Prioridad Estándar' },
  { value: 'LOW', label: 'Prioridad Baja' }
];

const STATUS_TABS: ReadonlyArray<{ value: StatusFilter; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'IN_TRANSIT', label: 'En cinta' },
  { value: 'INSPECTED', label: 'Aprobados' },
  { value: 'REJECTED', label: 'Cuarentena' }
];

const WEEK_DAYS: ReadonlyArray<{ readonly day: string; readonly num: number; readonly active?: boolean }> = [
  { day: 'Lun', num: 23 },
  { day: 'Mar', num: 24 },
  { day: 'Mié', num: 25 },
  { day: 'Jue', num: 26 },
  { day: 'Vie', num: 27 },
  { day: 'Sáb', num: 28, active: true },
  { day: 'Dom', num: 29 }
];

/**
 * Panel Principal Operativo (`/terminal`)
 * - Layout Bento compacto "de un vistazo" inspirado en el referente visual del cliente:
 *   barra superior con buscador + filtros + botón Claro/Oscuro, columna principal con
 *   banner de turno, 3 tarjetas KPI con curvas de tendencia, gráfico donut + barras de
 *   progreso de la cinta de tareas, listado paginado (3 envíos por página) y columna
 *   derecha fija con Mi Perfil Operativo y Agenda/Cinta Activa.
 */
export const HomePage: React.FC<HomePageProps> = ({ warehouseState, operator }) => {
  const {
    packages,
    filteredPackages,
    metrics,
    isLoading,
    isMutating,
    errorMessage,
    feedbackBanner,
    searchQuery,
    debouncedQuery,
    priorityFilter,
    statusFilter,
    setSearchQuery,
    setPriorityFilter,
    setStatusFilter,
    resetFilters,
    clearFeedback,
    reloadPackages,
    handleStatusChange,
    handleCreatePackage,
    handleDeletePackage
  } = warehouseState;

  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [revealKey, setRevealKey] = useState<number>(0);

  const totalPages = Math.max(1, Math.ceil(filteredPackages.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, priorityFilter, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedPackages = useMemo<ReadonlyArray<WarehousePackage>>(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPackages.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredPackages, currentPage]);

  const pendingBeltTasks = useMemo<ReadonlyArray<WarehousePackage>>(() => {
    return packages.filter((p) => p.status === 'IN_TRANSIT').slice(0, 4);
  }, [packages]);

  const sectorStats = useMemo(() => {
    const total = Math.max(1, packages.length);
    const c1 = packages.filter((p) => p.aisleBay.includes('C1')).length;
    const a2 = packages.filter((p) => p.aisleBay.includes('A2')).length;
    const b3 = packages.filter((p) => p.aisleBay.includes('B3')).length;
    const q1 = packages.filter((p) => p.status === 'REJECTED').length;
    return [
      { label: 'Cinta C1 · Prioridad Alta', count: c1, pct: Math.min(100, Math.round((c1 / total) * 100)), tone: 'cobalt' },
      { label: 'Cinta A2 · Verificados', count: a2, pct: Math.min(100, Math.round((a2 / total) * 100)), tone: 'emerald' },
      { label: 'Bahía B3 · Consolidación', count: b3, pct: Math.min(100, Math.round((b3 / total) * 100)), tone: 'sky' },
      { label: 'Cuarentena Q1 · Incidencias', count: q1, pct: Math.min(100, Math.round((q1 / total) * 100)), tone: 'coral' }
    ];
  }, [packages]);

  const initials = (operator?.fullName ?? 'Luis Lázaro')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const donutRadius = 42;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutOffset =
    donutCircumference - (metrics.inspectionRatePercent / 100) * donutCircumference;

  return (
    <div className="lt-dash-wrapper">
      {/* Barra superior compacta (IonHeader + IonToolbar + IonSearchbar + Selector Prioridad + Tema Claro/Oscuro) */}
      <IonHeader className="lt-dash-top-header">
        <IonToolbar className="lt-dash-top-toolbar">
          <div className="lt-dash-topbar-inner">
            <div className="lt-dash-search-wrap">
              <IonSearchbar
                id="logitrack-searchbar"
                className="lt-dash-searchbar"
                value={searchQuery}
                debounce={0}
                placeholder="Buscar envío (ej. LTK-4821-ES), centro destino o bahía..."
                aria-label="Buscar envío por código, destino o bahía"
                onIonInput={(e) => setSearchQuery(e.detail.value ?? '')}
                onIonClear={() => setSearchQuery('')}
                data-testid="package-searchbar"
              />
            </div>

            <div className="lt-dash-top-controls">
              <div className="lt-inline-select-wrap">
                <IonIcon icon={filterOutline} aria-hidden="true" />
                <select
                  id="priority-filter-select"
                  className="lt-compact-select"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
                  aria-label="Filtrar envíos por prioridad"
                  data-testid="select-priority-filter"
                >
                  {PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="lt-btn-primary-solid lt-btn-sm"
                onClick={() => setShowCreateForm((prev) => !prev)}
                aria-expanded={showCreateForm}
                data-testid="btn-toggle-new-package"
              >
                <IonIcon icon={addOutline} aria-hidden="true" />
                <span>{showCreateForm ? 'Cerrar alta' : 'Nuevo envío'}</span>
              </button>

              <button
                type="button"
                className="lt-icon-pill-btn"
                onClick={() => {
                  setRevealKey((prev) => prev + 1);
                  void reloadPackages();
                }}
                disabled={isLoading || isMutating}
                aria-label="Actualizar datos"
                title="Actualizar envíos"
                data-testid="btn-reload-packages"
              >
                <IonIcon icon={refreshOutline} aria-hidden="true" />
              </button>

              <button
                type="button"
                className="lt-icon-pill-btn"
                onClick={() => setRevealKey((prev) => prev + 1)}
                aria-label="Reproducir animación de panel"
                title="Reproducir despliegue visual"
                data-testid="btn-replay-cascade"
              >
                <IonIcon icon={sparklesOutline} aria-hidden="true" />
              </button>

              <ThemeToggleButton compact />
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <main className="lt-bento-main" aria-label="Panel operativo principal de LogiTrack Express">
        {/* Alertas accesibles de estado */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              key="err-banner"
              className="lt-banner-error"
              role="alert"
              aria-live="assertive"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="lt-banner-content">
                <IonIcon icon={alertCircleOutline} aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
              <button type="button" className="lt-banner-close" onClick={clearFeedback}>
                Cerrar
              </button>
            </motion.div>
          )}

          {feedbackBanner && (
            <motion.div
              key="ok-banner"
              className="lt-banner-success"
              role="status"
              aria-live="polite"
              data-testid="status-feedback-banner"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="lt-banner-content">
                <IonIcon icon={checkmarkDoneCircleOutline} aria-hidden="true" />
                <span>{feedbackBanner}</span>
              </div>
              <button type="button" className="lt-banner-close" onClick={clearFeedback}>
                Aceptar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cajón desplegable de alta de nuevo envío */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              key="create-drawer"
              initial={{ opacity: 0, y: -12, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            >
              <NewPackageForm onCreatePackage={handleCreatePackage} isSubmitting={isMutating} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid Bento Principal en 2 columnas (inspirado directamente en el referente visual) */}
        <div className="lt-bento-two-col">
          {/* COLUMNA IZQUIERDA: Banner + 3 KPIs Sparkline + Donut/Sectores + Envíos Paginados */}
          <div className="lt-bento-left-col">
            {/* 1. Banner de bienvenida operativa en Azul Cobalto */}
            <GlassyReveal indexDelay={0.02}>
              <section className="lt-welcome-banner" aria-labelledby="dash-greeting-title">
                <div className="lt-welcome-content">
                  <span className="lt-welcome-date-pill">
                    <IonIcon icon={calendarOutline} aria-hidden="true" />
                    <span>28 nov 2026 · Turno Operativo Activo</span>
                  </span>
                  <h1 id="dash-greeting-title" className="lt-welcome-title">
                    ¡Buen turno, {operator?.fullName.split(' ')[0] ?? 'Luis'}!
                  </h1>
                  <p className="lt-welcome-sub">
                    {operator?.assignedHub ?? 'MAD-HUB-01 · Cinta C1'} —{' '}
                    <strong>{metrics.inTransit} envíos</strong> pendientes de inspección en cinta ({metrics.totalWeightKg.toFixed(1)} kg acumulados).
                  </p>
                </div>
                <div className="lt-welcome-actions">
                  <Link to="/telemetry" className="lt-welcome-ghost-btn">
                    <IonIcon icon={layersOutline} aria-hidden="true" />
                    <span>Abrir Cinta 3D</span>
                  </Link>
                </div>
              </section>
            </GlassyReveal>

            {/* 2. Fila de 3 KPIs Compactos con Sparklines SVG (estilo Medcare) */}
            <GlassyStagger className="lt-spark-kpi-row" replayKey={revealKey}>
              <GlassyReveal className="lt-surface-card lt-spark-card" hoverLift>
                <span className="lt-spark-label">EN CINTA · TRÁNSITO</span>
                <div className="lt-spark-body">
                  <svg className="lt-spark-svg lt-spark-sky" viewBox="0 0 88 38" aria-hidden="true">
                    <path d="M4 30 C18 28, 24 8, 42 16 C56 22, 68 10, 84 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <div className="lt-spark-metrics">
                    <strong className="lt-tabular-nums" data-testid="kpi-transit">{metrics.inTransit}</strong>
                    <span className="lt-spark-caption">envíos activos</span>
                    <span className="lt-spark-pill lt-pill-info">{metrics.criticalCount} críticos</span>
                  </div>
                </div>
              </GlassyReveal>

              <GlassyReveal className="lt-surface-card lt-spark-card" hoverLift>
                <span className="lt-spark-label">INSPECCIONADOS</span>
                <div className="lt-spark-body">
                  <svg className="lt-spark-svg lt-spark-emerald" viewBox="0 0 88 38" aria-hidden="true">
                    <path d="M4 32 C20 30, 32 24, 48 18 C64 12, 74 10, 84 4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <div className="lt-spark-metrics">
                    <strong className="lt-tabular-nums" data-testid="kpi-inspected">{metrics.inspected}</strong>
                    <span className="lt-spark-caption">verificados OK</span>
                    <span className="lt-spark-pill lt-pill-ok">{metrics.inspectionRatePercent}% completado</span>
                  </div>
                </div>
              </GlassyReveal>

              <GlassyReveal className="lt-surface-card lt-spark-card" hoverLift>
                <span className="lt-spark-label">EN CUARENTENA</span>
                <div className="lt-spark-body">
                  <svg className="lt-spark-svg lt-spark-coral" viewBox="0 0 88 38" aria-hidden="true">
                    <path d="M4 12 C22 14, 34 26, 52 24 C66 22, 74 30, 84 28" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <div className="lt-spark-metrics">
                    <strong className="lt-tabular-nums" data-testid="kpi-rejected">{metrics.rejected}</strong>
                    <span className="lt-spark-caption">incidencias</span>
                    <span className="lt-spark-pill lt-pill-warn" data-testid="kpi-total">de {metrics.total} totales</span>
                  </div>
                </div>
              </GlassyReveal>
            </GlassyStagger>

            {/* 3. Fila Analítica Compacta: Donut de Eficiencia + Progreso por Sectores de Cinta */}
            <GlassyStagger className="lt-analytics-row" replayKey={revealKey}>
              <GlassyReveal className="lt-surface-card lt-donut-card" hoverLift>
                <div className="lt-card-mini-head">
                  <h2>ESTADO DE CLASIFICACIÓN</h2>
                  <span className="lt-mini-chip">Hoy</span>
                </div>
                <div className="lt-donut-body">
                  <div className="lt-donut-ring-box">
                    <svg viewBox="0 0 100 100" className="lt-donut-svg" aria-hidden="true">
                      <circle cx="50" cy="50" r={donutRadius} className="lt-donut-track" />
                      <circle
                        cx="50"
                        cy="50"
                        r={donutRadius}
                        className="lt-donut-fill"
                        strokeDasharray={donutCircumference}
                        strokeDashoffset={donutOffset}
                      />
                    </svg>
                    <div className="lt-donut-center lt-tabular-nums">
                      <strong>{metrics.inspectionRatePercent}%</strong>
                      <span>GESTIONADO</span>
                    </div>
                  </div>
                  <div className="lt-donut-legend lt-tabular-nums">
                    <div>
                      <strong>{metrics.criticalCount}</strong>
                      <span>Prioridad Crítica</span>
                    </div>
                    <div>
                      <strong>{packages.filter((p) => p.priority === 'STANDARD').length}</strong>
                      <span>Prioridad Estándar</span>
                    </div>
                    <div>
                      <strong>{packages.filter((p) => p.priority === 'LOW').length}</strong>
                      <span>Prioridad Baja</span>
                    </div>
                  </div>
                </div>
              </GlassyReveal>

              <GlassyReveal className="lt-surface-card lt-sectors-card" hoverLift>
                <div className="lt-card-mini-head">
                  <h2>CINTA DE TAREAS POR SECTOR</h2>
                  <button
                    type="button"
                    className="lt-text-action-btn"
                    onClick={() => setShowCreateForm(true)}
                  >
                    + Añadir envío
                  </button>
                </div>
                <div className="lt-sector-bars">
                  {sectorStats.map((sec) => (
                    <div key={sec.label} className="lt-sector-row">
                      <div className="lt-sector-meta">
                        <span>{sec.label}</span>
                        <strong className="lt-tabular-nums">{sec.count} u. ({sec.pct}%)</strong>
                      </div>
                      <div className="lt-bar-track" aria-hidden="true">
                        <div
                          className={`lt-bar-fill lt-bar-${sec.tone}`}
                          style={{ width: `${Math.max(8, sec.pct)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassyReveal>
            </GlassyStagger>

            {/* 4. Listado Paginado de Envíos en Cinta (3 por página · cero scroll infinito) */}
            <section className="lt-surface-card lt-paginated-section" aria-label="Listado paginado de envíos en cinta">
              <div className="lt-paginated-header">
                <div>
                  <h2 className="lt-paginated-title">Cinta de Envíos e Inspección</h2>
                  <p className="lt-paginated-sub lt-tabular-nums" role="status" aria-live="polite">
                    Mostrando {paginatedPackages.length} de {filteredPackages.length} envíos · Página {currentPage} de {totalPages}
                  </p>
                </div>

                <div className="lt-status-tabs" role="tablist" aria-label="Filtrar envíos por estado">
                  {STATUS_TABS.map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      role="tab"
                      aria-selected={statusFilter === tab.value}
                      className={`lt-status-tab ${statusFilter === tab.value ? 'is-active' : ''}`}
                      onClick={() => setStatusFilter(tab.value)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {isLoading ? (
                <div className="lt-empty-compact" role="status" aria-live="polite">
                  <p>Cargando envíos de la línea activa...</p>
                </div>
              ) : paginatedPackages.length > 0 ? (
                <>
                  <IonList className="lt-ion-list" data-testid="packages-ion-list">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`page-${currentPage}-${statusFilter}-${priorityFilter}-${revealKey}`}
                        className="lt-ion-list-page-group"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                      >
                        {paginatedPackages.map((pkg, idx) => (
                          <motion.div
                            key={pkg.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              type: 'spring',
                              stiffness: 280,
                              damping: 26,
                              delay: idx * 0.04
                            }}
                          >
                            <PackageInspectionCard
                              pkg={pkg}
                              onStatusChange={handleStatusChange}
                              onDeletePackage={handleDeletePackage}
                              disabled={isMutating}
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </IonList>

                  {/* Barra de paginación clara por páginas */}
                  <nav className="lt-pagination-bar" aria-label="Paginación de envíos">
                    <button
                      type="button"
                      className="lt-page-btn"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      data-testid="btn-page-prev"
                    >
                      <IonIcon icon={chevronBackOutline} aria-hidden="true" />
                      <span>Anterior</span>
                    </button>

                    <div className="lt-page-numbers">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          className={`lt-page-num-btn ${pageNum === currentPage ? 'is-current' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                          aria-current={pageNum === currentPage ? 'page' : undefined}
                          aria-label={`Ir a página ${pageNum}`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="lt-page-btn"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      data-testid="btn-page-next"
                    >
                      <span>Siguiente</span>
                      <IonIcon icon={chevronForwardOutline} aria-hidden="true" />
                    </button>
                  </nav>
                </>
              ) : (
                <div className="lt-empty-compact" role="status" aria-live="polite" data-testid="empty-packages-state">
                  <IonIcon icon={cubeOutline} aria-hidden="true" className="lt-empty-icon" />
                  <h3>No se encontraron envíos con estos filtros</h3>
                  <p>
                    Búsqueda: <strong>{debouncedQuery || 'ninguna'}</strong> · Prioridad:{' '}
                    <strong>{priorityFilter}</strong>
                  </p>
                  <button
                    type="button"
                    className="lt-btn-primary-solid lt-btn-sm"
                    onClick={resetFilters}
                    data-testid="btn-reset-filters"
                  >
                    Restablecer filtros
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* COLUMNA DERECHA: Perfil del Operario + Calendario y Cinta de Tareas Rápidas */}
          <aside className="lt-bento-right-col" aria-label="Perfil operativo y tareas inmediatas">
            {/* Tarjeta MI PERFIL */}
            <GlassyReveal indexDelay={0.08}>
              <section className="lt-surface-card lt-profile-card">
                <div className="lt-profile-cobalt-bar">
                  <span>MI PERFIL OPERATIVO</span>
                  <span className="lt-profile-status-dot">En turno</span>
                </div>
                <div className="lt-profile-body">
                  <div className="lt-profile-identity">
                    <div className="lt-avatar-circle" aria-hidden="true">{initials}</div>
                    <div>
                      <h2>{operator?.fullName ?? 'Luis Lázaro Pimentel'}</h2>
                      <p className="lt-profile-role">{operator?.role ?? 'Inspector Jefe de Operaciones'}</p>
                      <p className="lt-profile-hub">{operator?.assignedHub ?? 'MAD-HUB-01 · Cinta C1'}</p>
                    </div>
                  </div>
                  <div className="lt-profile-stats lt-tabular-nums">
                    <div>
                      <span>Placa</span>
                      <strong>{operator?.badgeId ?? 'OP-MAD-0488'}</strong>
                    </div>
                    <div>
                      <span>Envíos</span>
                      <strong>{metrics.total}</strong>
                    </div>
                    <div>
                      <span>Masa</span>
                      <strong>{metrics.totalWeightKg.toFixed(1)} kg</strong>
                    </div>
                  </div>
                </div>
              </section>
            </GlassyReveal>

            {/* Tarjeta AGENDA DE TURNO Y CINTA DE TAREAS */}
            <GlassyReveal indexDelay={0.14}>
              <section className="lt-surface-card lt-calendar-card">
                <div className="lt-profile-cobalt-bar">
                  <span>TURNO Y CINTA DE TAREAS</span>
                  <span>Noviembre</span>
                </div>
                <div className="lt-calendar-body">
                  <div className="lt-week-strip" aria-label="Calendario semanal de turnos">
                    {WEEK_DAYS.map((d) => (
                      <div key={d.num} className={`lt-week-cell ${d.active ? 'is-today' : ''}`}>
                        <span>{d.day}</span>
                        <strong className="lt-tabular-nums">{d.num}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="lt-tasks-feed-head">
                    <h3>PENDIENTES EN CINTA</h3>
                    <span className="lt-tabular-nums">{pendingBeltTasks.length} en cola</span>
                  </div>

                  <ul className="lt-quick-tasks-list">
                    {pendingBeltTasks.length > 0 ? (
                      pendingBeltTasks.map((task) => (
                        <li key={task.id} className="lt-quick-task-item">
                          <span className={`lt-task-dot lt-dot-${task.priority.toLowerCase()}`} aria-hidden="true" />
                          <div className="lt-quick-task-info">
                            <strong className="lt-tabular-nums">{task.trackingCode}</strong>
                            <span>{task.destinationHub}</span>
                          </div>
                          <button
                            type="button"
                            className="lt-quick-approve-btn"
                            disabled={isMutating}
                            onClick={() => void handleStatusChange({ id: task.id, newStatus: 'INSPECTED' })}
                            aria-label={`Aprobar rápido ${task.trackingCode}`}
                            title={`Aprobar ${task.trackingCode}`}
                          >
                            <IonIcon icon={checkmarkCircleOutline} aria-hidden="true" />
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="lt-quick-task-done">
                        Todos los envíos de la cinta están verificados.
                      </li>
                    )}
                  </ul>

                  <Link to="/telemetry" className="lt-btn-secondary-surface lt-btn-full">
                    <IonIcon icon={layersOutline} aria-hidden="true" />
                    <span>Ver simulación 3D completa</span>
                  </Link>
                </div>
              </section>
            </GlassyReveal>
          </aside>
        </div>
      </main>
    </div>
  );
};
