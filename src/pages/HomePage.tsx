import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
  checkmarkCircleOutline,
  checkmarkDoneCircleOutline,
  cubeOutline,
  filterOutline,
  layersOutline,
  refreshOutline
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

export interface HomePageProps {
  readonly warehouseState: UseWarehousePackagesReturn;
  readonly operator: WarehouseOperator | null;
}

const ITEMS_PER_PAGE = 3;

const PRIORITY_OPTIONS: ReadonlyArray<{ value: PriorityFilter; label: string }> = [
  { value: 'ALL', label: 'Prioridades' },
  { value: 'CRITICAL', label: 'Prioridad crítica' },
  { value: 'STANDARD', label: 'Prioridad estándar' },
  { value: 'LOW', label: 'Prioridad baja' }
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

function cleanSeparator(value: string): string {
  return value.replace(/\s*[·•]\s*/g, ' - ');
}

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
      { label: 'Cinta C1 de prioridad alta', count: c1, pct: Math.min(100, Math.round((c1 / total) * 100)), tone: 'cobalt' },
      { label: 'Cinta A2 de envíos aprobados', count: a2, pct: Math.min(100, Math.round((a2 / total) * 100)), tone: 'emerald' },
      { label: 'Bahía B3 de consolidación', count: b3, pct: Math.min(100, Math.round((b3 / total) * 100)), tone: 'sky' },
      { label: 'Cuarentena Q1 de incidencias', count: q1, pct: Math.min(100, Math.round((q1 / total) * 100)), tone: 'coral' }
    ];
  }, [packages]);

  const initials = (operator?.fullName ?? 'Luis Lázaro')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const cleanAssignedHub = cleanSeparator(operator?.assignedHub ?? 'MAD-HUB-01, Cinta C1');

  const donutRadius = 42;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutOffset =
    donutCircumference - (metrics.inspectionRatePercent / 100) * donutCircumference;

  return (
    <div className="lt-dash-wrapper">
      {/* Barra superior equilibrada con la barra de búsqueda centrada en el medio */}
      <IonHeader className="lt-dash-top-header">
        <IonToolbar className="lt-dash-top-toolbar">
          <div className="lt-dash-topbar-grid">
            <div className="lt-dash-topbar-brand">
              <span className="lt-topbar-area-name">Panel de clasificación</span>
            </div>

            <div className="lt-dash-search-center">
              <IonSearchbar
                id="logitrack-searchbar"
                className="lt-dash-searchbar"
                value={searchQuery}
                debounce={0}
                placeholder="Buscar envío, destino o bahía..."
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
                <span>{showCreateForm ? 'Cerrar formulario' : 'Nuevo envío'}</span>
              </button>

              <button
                type="button"
                className="lt-icon-pill-btn"
                onClick={() => void reloadPackages()}
                disabled={isLoading || isMutating}
                aria-label="Actualizar listado de envíos"
                title="Actualizar envíos"
                data-testid="btn-reload-packages"
              >
                <IonIcon icon={refreshOutline} aria-hidden="true" />
              </button>

              <ThemeToggleButton compact />
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <main className="lt-bento-main" aria-label="Panel operativo principal de LogiTrack Express">
        {errorMessage && (
          <div className="lt-banner-error" role="alert" aria-live="assertive">
            <div className="lt-banner-content">
              <IonIcon icon={alertCircleOutline} aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
            <button type="button" className="lt-banner-close" onClick={clearFeedback}>
              Cerrar
            </button>
          </div>
        )}

        {feedbackBanner && (
          <div
            className="lt-banner-success"
            role="status"
            aria-live="polite"
            data-testid="status-feedback-banner"
          >
            <div className="lt-banner-content">
              <IonIcon icon={checkmarkDoneCircleOutline} aria-hidden="true" />
              <span>{feedbackBanner}</span>
            </div>
            <button type="button" className="lt-banner-close" onClick={clearFeedback}>
              Aceptar
            </button>
          </div>
        )}

        {showCreateForm && (
          <NewPackageForm onCreatePackage={handleCreatePackage} isSubmitting={isMutating} />
        )}

        <div className="lt-bento-two-col">
          {/* Columna izquierda principal */}
          <div className="lt-bento-left-col">
            {/* Banner de bienvenida sin píldora sobre el titular */}
            <section className="lt-welcome-banner" aria-labelledby="dash-greeting-title">
              <div className="lt-welcome-content">
                <h1 id="dash-greeting-title" className="lt-welcome-title">
                  Panel de turno activo para {operator?.fullName.split(' ')[0] ?? 'Luis'}
                </h1>
                <p className="lt-welcome-sub">
                  28 de noviembre de 2026 en {cleanAssignedHub}: tienes{' '}
                  <strong>{metrics.inTransit} envíos</strong> pendientes en cinta con un peso
                  acumulado de {metrics.totalWeightKg.toFixed(1)} kg.
                </p>
              </div>
              <div className="lt-welcome-actions">
                <Link to="/telemetry" className="lt-welcome-ghost-btn">
                  <IonIcon icon={layersOutline} aria-hidden="true" />
                  <span>Abrir cinta en 3D</span>
                </Link>
              </div>
            </section>

            {/* Tira unificada abierta de indicadores (evita caja por cada número, sin curvas inventadas) */}
            <section className="lt-unified-kpi-strip" aria-label="Resumen numérico de envíos">
              <div className="lt-kpi-strip-cell">
                <span className="lt-spark-label">Envíos pendientes en cinta</span>
                <div className="lt-kpi-strip-row">
                  <strong className="lt-tabular-nums" data-testid="kpi-transit">
                    {metrics.inTransit}
                  </strong>
                  <span className="lt-spark-pill lt-pill-info">
                    {metrics.criticalCount} de prioridad crítica
                  </span>
                </div>
              </div>

              <div className="lt-kpi-strip-cell">
                <span className="lt-spark-label">Envíos aprobados en turno</span>
                <div className="lt-kpi-strip-row">
                  <strong className="lt-tabular-nums" data-testid="kpi-inspected">
                    {metrics.inspected}
                  </strong>
                  <span className="lt-spark-pill lt-pill-ok">
                    {metrics.inspectionRatePercent}% clasificado
                  </span>
                </div>
              </div>

              <div className="lt-kpi-strip-cell">
                <span className="lt-spark-label">Envíos en cuarentena</span>
                <div className="lt-kpi-strip-row">
                  <strong className="lt-tabular-nums" data-testid="kpi-rejected">
                    {metrics.rejected}
                  </strong>
                  <span className="lt-spark-pill lt-pill-warn" data-testid="kpi-total">
                    Sobre {metrics.total} totales
                  </span>
                </div>
              </div>
            </section>

            {/* Fila analítica compacta: Donut + Cinta de Tareas por Sector */}
            <div className="lt-analytics-row">
              <section className="lt-surface-card lt-donut-card">
                <div className="lt-card-mini-head">
                  <h2>Estado general de clasificación</h2>
                  <span className="lt-mini-chip">Turno actual</span>
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
                      <span>Gestionado</span>
                    </div>
                  </div>
                  <div className="lt-donut-legend lt-tabular-nums">
                    <div>
                      <strong>{metrics.criticalCount}</strong>
                      <span>Envíos de prioridad crítica</span>
                    </div>
                    <div>
                      <strong>{packages.filter((p) => p.priority === 'STANDARD').length}</strong>
                      <span>Envíos de prioridad estándar</span>
                    </div>
                    <div>
                      <strong>{packages.filter((p) => p.priority === 'LOW').length}</strong>
                      <span>Envíos de prioridad baja</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="lt-surface-card lt-sectors-card">
                <div className="lt-card-mini-head">
                  <h2>Distribución de tareas por sector de cinta</h2>
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
                        <strong className="lt-tabular-nums">
                          {sec.count} u. ({sec.pct}%)
                        </strong>
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
              </section>
            </div>

            {/* Listado paginado de envíos en cinta (3 por página, filas planas con divisores finos) */}
            <section className="lt-surface-card lt-paginated-section" aria-label="Listado paginado de envíos en cinta">
              <div className="lt-paginated-header">
                <div>
                  <h2 className="lt-paginated-title">Listado de envíos en cinta e inspección</h2>
                  <p className="lt-paginated-sub lt-tabular-nums" role="status" aria-live="polite">
                    Mostrando {paginatedPackages.length} de {filteredPackages.length} envíos en página{' '}
                    {currentPage} de {totalPages}
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
                    <div className="lt-ion-list-page-group">
                      {paginatedPackages.map((pkg) => (
                        <PackageInspectionCard
                          key={pkg.id}
                          pkg={pkg}
                          onStatusChange={handleStatusChange}
                          onDeletePackage={handleDeletePackage}
                          disabled={isMutating}
                        />
                      ))}
                    </div>
                  </IonList>

                  <nav className="lt-pagination-bar" aria-label="Paginación de envíos">
                    <button
                      type="button"
                      className="lt-page-btn"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      data-testid="btn-page-prev"
                    >
                      Anterior
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
                      Siguiente
                    </button>
                  </nav>
                </>
              ) : (
                <div className="lt-empty-compact" role="status" aria-live="polite" data-testid="empty-packages-state">
                  <IonIcon icon={cubeOutline} aria-hidden="true" className="lt-empty-icon" />
                  <h3>No se encontraron envíos con estos filtros</h3>
                  <p>
                    Búsqueda actual: <strong>{debouncedQuery || 'sin texto'}</strong> con filtro de
                    prioridad <strong>{priorityFilter}</strong>
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

          {/* Columna derecha: Perfil operativo + Calendario y pendientes en cinta */}
          <aside className="lt-bento-right-col" aria-label="Perfil operativo y tareas pendientes en cinta">
            <section className="lt-surface-card lt-profile-card">
              <div className="lt-profile-cobalt-bar">
                <span>Perfil del operario conectado</span>
                <span>Activo</span>
              </div>
              <div className="lt-profile-body">
                <div className="lt-profile-identity">
                  <div className="lt-avatar-circle" aria-hidden="true">{initials}</div>
                  <div>
                    <h2>{operator?.fullName ?? 'Luis Lázaro Pimentel'}</h2>
                    <p className="lt-profile-role">
                      {operator?.role ?? 'Inspector jefe de operaciones'}
                    </p>
                    <p className="lt-profile-hub">{cleanAssignedHub}</p>
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
                    <span>Masa total</span>
                    <strong>{metrics.totalWeightKg.toFixed(1)} kg</strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="lt-surface-card lt-calendar-card">
              <div className="lt-profile-cobalt-bar">
                <span>Calendario y cinta de tareas</span>
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
                  <h3>Envíos pendientes en cinta</h3>
                  <span className="lt-tabular-nums">{pendingBeltTasks.length} en cola</span>
                </div>

                <ul className="lt-quick-tasks-list">
                  {pendingBeltTasks.length > 0 ? (
                    pendingBeltTasks.map((task) => (
                      <li key={task.id} className="lt-quick-task-item">
                        <div className="lt-quick-task-info">
                          <strong>{task.trackingCode}</strong>
                          <span>{task.destinationHub}</span>
                        </div>
                        <button
                          type="button"
                          className="lt-quick-approve-btn"
                          disabled={isMutating}
                          onClick={() => void handleStatusChange({ id: task.id, newStatus: 'INSPECTED' })}
                          aria-label={`Aprobar rápidamente envío ${task.trackingCode}`}
                          title={`Aprobar ${task.trackingCode}`}
                        >
                          <IonIcon icon={checkmarkCircleOutline} aria-hidden="true" />
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="lt-quick-task-done">
                      Todos los envíos del turno han sido clasificados.
                    </li>
                  )}
                </ul>

                <Link to="/telemetry" className="lt-btn-secondary-surface lt-btn-sm lt-btn-full">
                  <IonIcon icon={layersOutline} aria-hidden="true" />
                  <span>Abrir simulación 3D completa</span>
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};
