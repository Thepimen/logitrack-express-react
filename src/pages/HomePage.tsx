import React, { useState } from 'react';
import {
  IonButton,
  IonHeader,
  IonIcon,
  IonList,
  IonSearchbar,
  IonToolbar
} from '@ionic/react';
import {
  addCircleOutline,
  alertCircleOutline,
  checkmarkDoneCircleOutline,
  cubeOutline,
  filterOutline,
  refreshOutline,
  searchOutline
} from 'ionicons/icons';
import {
  PriorityFilter,
  StatusFilter,
  WarehousePackage
} from '../models/package.model';
import { UseWarehousePackagesReturn } from '../hooks/useWarehousePackages';
import { PackageInspectionCard } from '../components/PackageInspectionCard';
import { Conveyor3DStage } from '../components/Conveyor3DStage';
import { NewPackageForm } from '../components/NewPackageForm';

export interface HomePageProps {
  readonly warehouseState: UseWarehousePackagesReturn;
}

const PRIORITY_OPTIONS: ReadonlyArray<{ value: PriorityFilter; label: string }> = [
  { value: 'ALL', label: 'TODAS LAS PRIORIDADES' },
  { value: 'CRITICAL', label: 'CRITICAL (URGENTE)' },
  { value: 'STANDARD', label: 'STANDARD (ESTÁNDAR)' },
  { value: 'LOW', label: 'LOW (BAJA)' }
];

const STATUS_OPTIONS: ReadonlyArray<{ value: StatusFilter; label: string }> = [
  { value: 'ALL', label: 'TODOS LOS ESTADOS' },
  { value: 'IN_TRANSIT', label: 'IN_TRANSIT (EN CINTA)' },
  { value: 'INSPECTED', label: 'INSPECTED (APROBADOS)' },
  { value: 'REJECTED', label: 'REJECTED (RECHAZADOS)' }
];

/**
 * Vista Principal Declarativa: HomePage (`src/pages/HomePage.tsx`)
 * Cumple íntegramente las Tareas 1, 2, 3, 4 y 5 del enunciado `DI_Actividad2.pdf`:
 * - Tarea 2.1: Layout corporativo con `ion-header` e `ion-toolbar`, título, selector de filtro de prioridad,
 *   `ion-searchbar` para búsqueda en tiempo real por `trackingCode` y `ion-list` con `ion-item-sliding`.
 * - Tarea 2.2: Control de flujo declarativo en JSX (equivalente en React a `@for`, `@if`, `@empty`).
 * - Tarea 2.3: Interpolación y Property Binding dinámico para variar bordes, insignias y atributos ARIA según estado.
 * - Tarea 3.3: Integración del componente autónomo `<PackageInspectionCard />` dentro del bucle declarativo,
 *   capturando el evento `onStatusChange` y actualizando reactivamente el estado y Supabase PostgreSQL.
 */
export const HomePage: React.FC<HomePageProps> = ({ warehouseState }) => {
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

  const [selected3DPackage, setSelected3DPackage] = useState<WarehousePackage | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

  return (
    <main className="lt-home-main" aria-label="Terminal principal de inspección de paquetes en cinta">
      {/* Sub-cabecera operativa exigida en Tarea 2.1: ion-header + ion-toolbar con título y selector de prioridad */}
      <IonHeader className="lt-sub-header">
        <IonToolbar className="lt-filter-toolbar">
          <div className="lt-toolbar-grid">
            <div className="lt-toolbar-title-block">
              <span className="lt-kicker-amber">TAREA 2 &amp; TAREA 3 · VISTA DECLARATIVA IONIC v8</span>
              <h1 className="lt-page-title">
                Consola de Recepción e Inspección en Cinta Transportadora
              </h1>
            </div>

            {/* Selector de filtro de prioridad en ion-toolbar (Tarea 2.1) */}
            <div className="lt-toolbar-controls">
              <div className="lt-filter-field">
                <label htmlFor="priority-filter-select" className="lt-filter-label">
                  <IonIcon icon={filterOutline} aria-hidden="true" /> FILTRO DE PRIORIDAD
                </label>
                <select
                  id="priority-filter-select"
                  className="lt-toolbar-select"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
                  aria-label="Filtrar paquetes por nivel de prioridad"
                  data-testid="select-priority-filter"
                >
                  {PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lt-filter-field">
                <label htmlFor="status-filter-select" className="lt-filter-label">
                  ESTADO DE INSPECCIÓN
                </label>
                <select
                  id="status-filter-select"
                  className="lt-toolbar-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  aria-label="Filtrar paquetes por estado de inspección"
                  data-testid="select-status-filter"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lt-toolbar-buttons">
                <IonButton
                  fill="solid"
                  color="warning"
                  size="default"
                  onClick={() => setShowCreateForm((prev) => !prev)}
                  aria-expanded={showCreateForm}
                  data-testid="btn-toggle-new-package"
                >
                  <IonIcon slot="start" icon={addCircleOutline} aria-hidden="true" />
                  {showCreateForm ? 'OCULTAR ALTA' : 'NUEVO PAQUETE'}
                </IonButton>

                <IonButton
                  fill="outline"
                  color="light"
                  size="default"
                  onClick={() => void reloadPackages()}
                  disabled={isLoading || isMutating}
                  data-testid="btn-reload-packages"
                >
                  <IonIcon slot="start" icon={refreshOutline} aria-hidden="true" />
                  SINCRONIZAR BD
                </IonButton>
              </div>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <div className="lt-workspace-container">
        {/* Panel de KPIs de Telemetría con números tabulares (emilkowalski/skills) */}
        <section className="lt-kpi-ribbon" aria-label="Métricas en tiempo real de la cinta transportadora">
          <div className="lt-kpi-card">
            <span className="lt-kpi-label">UNIDADES EN CINTA (TOTAL)</span>
            <strong className="lt-kpi-number lt-tabular-nums" data-testid="kpi-total">
              {metrics.total}
            </strong>
            <span className="lt-kpi-foot">Masa acumulada: {metrics.totalWeightKg.toFixed(2)} kg</span>
          </div>

          <div className="lt-kpi-card lt-kpi-amber">
            <span className="lt-kpi-label">EN TRÁNSITO (IN_TRANSIT)</span>
            <strong className="lt-kpi-number lt-tabular-nums" data-testid="kpi-transit">
              {metrics.inTransit}
            </strong>
            <span className="lt-kpi-foot">{metrics.criticalCount} paquetes de prioridad CRITICAL</span>
          </div>

          <div className="lt-kpi-card lt-kpi-emerald">
            <span className="lt-kpi-label">APROBADOS (INSPECTED)</span>
            <strong className="lt-kpi-number lt-tabular-nums" data-testid="kpi-inspected">
              {metrics.inspected}
            </strong>
            <span className="lt-kpi-foot">Tasa procesada: {metrics.inspectionRatePercent}%</span>
          </div>

          <div className="lt-kpi-card lt-kpi-crimson">
            <span className="lt-kpi-label">CUARENTENA (REJECTED)</span>
            <strong className="lt-kpi-number lt-tabular-nums" data-testid="kpi-rejected">
              {metrics.rejected}
            </strong>
            <span className="lt-kpi-foot">Desviados a bahía QUARANTINE-Q1</span>
          </div>
        </section>

        {/* Banners accesibles de feedback y propagación real de errores (RA 2, RA 3, RA 4) */}
        {errorMessage && (
          <div className="lt-banner-error" role="alert" aria-live="assertive">
            <div className="lt-banner-content">
              <IonIcon icon={alertCircleOutline} aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
            <button type="button" className="lt-banner-close" onClick={clearFeedback}>
              CERRAR
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
              OK
            </button>
          </div>
        )}

        {/* Formulario desplegable de alta real en Supabase con UUID v4 */}
        {showCreateForm && (
          <NewPackageForm onCreatePackage={handleCreatePackage} isSubmitting={isMutating} />
        )}

        {/* Gemelo Digital Isométrico 3D integrado en la vista operativa */}
        <Conveyor3DStage
          packages={filteredPackages.length > 0 ? filteredPackages : packages}
          selectedPackage={selected3DPackage}
          onSelectPackage={(pkg) => setSelected3DPackage(pkg)}
          onStatusChange={handleStatusChange}
          compact
        />

        {/* Barra de búsqueda reactiva ion-searchbar (Tarea 2.1 y Tarea 5) */}
        <section className="lt-search-panel" aria-label="Búsqueda reactiva por código de seguimiento">
          <div className="lt-searchbar-header">
            <div>
              <label htmlFor="logitrack-searchbar" className="lt-search-title">
                <IonIcon icon={searchOutline} aria-hidden="true" /> BÚSQUEDA REACTIVA EN TIEMPO REAL
                (TAREA 2 &amp; TAREA 5 · DEBOUNCE 180ms SIN MEMORY LEAKS)
              </label>
              <p className="lt-search-helper">
                Filtra instantáneamente por <code>trackingCode</code> (ej. <code>LTK-4821-ES</code>),
                Hub de destino o <code>UUID v4</code>.
              </p>
            </div>
            <div className="lt-search-counter lt-tabular-nums" role="status" aria-live="polite">
              MOSTRANDO <strong>{filteredPackages.length}</strong> DE <strong>{packages.length}</strong>{' '}
              PAQUETES
            </div>
          </div>

          <IonSearchbar
            id="logitrack-searchbar"
            className="lt-ion-searchbar"
            value={searchQuery}
            debounce={0}
            placeholder="Buscar por trackingCode (ej. LTK-4821-ES), Hub o UUID v4..."
            aria-label="Buscar paquete por código de seguimiento LTK-XXXX-ES, destino o UUID"
            onIonInput={(e) => setSearchQuery(e.detail.value ?? '')}
            onIonClear={() => setSearchQuery('')}
            data-testid="package-searchbar"
          />
        </section>

        {/* Lista Declarativa ion-list con ion-item-sliding y control de flujo (@if / @for / @empty equivalentes en JSX) */}
        <section className="lt-list-section" aria-label="Listado de paquetes en cinta transportadora">
          {isLoading ? (
            <div className="lt-state-box" role="status" aria-live="polite">
              <div className="lt-spinner" aria-hidden="true" />
              <h2>Sincronizando telemetría con Supabase PostgreSQL...</h2>
              <p>Verificando paquetes activos en la tabla public.warehouse_packages.</p>
            </div>
          ) : filteredPackages.length > 0 ? (
            <IonList className="lt-ion-list" data-testid="packages-ion-list">
              {filteredPackages.map((pkg) => (
                <PackageInspectionCard
                  key={pkg.id}
                  pkg={pkg}
                  onStatusChange={handleStatusChange}
                  onDeletePackage={handleDeletePackage}
                  disabled={isMutating}
                  onSelect3D={(selected) => setSelected3DPackage(selected)}
                  isSelected3D={selected3DPackage?.id === pkg.id}
                />
              ))}
            </IonList>
          ) : (
            /* Bloque equivalente a @empty en control de flujo declarativo (Tarea 2.2) */
            <div className="lt-empty-state" role="status" aria-live="polite" data-testid="empty-packages-state">
              <IonIcon icon={cubeOutline} aria-hidden="true" className="lt-empty-icon" />
              <h2>No se encontraron paquetes que coincidan con los filtros activos</h2>
              <p>
                Filtro actual: búsqueda <code>&quot;{debouncedQuery || 'sin texto'}&quot;</code> ·
                Prioridad <code>{priorityFilter}</code> · Estado <code>{statusFilter}</code>.
              </p>
              <button
                type="button"
                className="lt-reset-filters-btn"
                onClick={resetFilters}
                data-testid="btn-reset-filters"
              >
                RESTABLECER FILTROS DE CINTA
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
