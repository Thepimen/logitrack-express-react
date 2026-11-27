import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
  searchOutline,
  sparklesOutline
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
import { GlassyReveal, GlassyStagger } from '../components/GlassyReveal';

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
 * v3.0 — Diseño Sapphire Glassmorphism + Animación de Despliegue Escalonado (Framer Motion)
 * Cumple íntegramente las Tareas 1, 2, 3, 4 y 5 del enunciado `DI_Actividad2.pdf`.
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
  const [revealKey, setRevealKey] = useState<number>(0);

  return (
    <main className="lt-home-main" aria-label="Terminal principal de inspección de paquetes en cinta">
      {/* Sub-cabecera operativa exigida en Tarea 2.1: ion-header + ion-toolbar con título y selector de prioridad */}
      <IonHeader className="lt-sub-header">
        <IonToolbar className="lt-filter-toolbar">
          <div className="lt-toolbar-grid">
            <div className="lt-toolbar-title-block">
              <span className="lt-kicker-amber">
                TAREA 2 &amp; TAREA 3 · SAPPHIRE GLASS UI + DESPLIEGUE FRAMER MOTION
              </span>
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
                  color="primary"
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
                  onClick={() => {
                    setRevealKey((prev) => prev + 1);
                    void reloadPackages();
                  }}
                  disabled={isLoading || isMutating}
                  data-testid="btn-reload-packages"
                >
                  <IonIcon slot="start" icon={refreshOutline} aria-hidden="true" />
                  SINCRONIZAR BD
                </IonButton>

                <button
                  type="button"
                  className="lt-replay-mini-btn"
                  onClick={() => setRevealKey((prev) => prev + 1)}
                  data-testid="btn-replay-cascade"
                  aria-label="ANIMAR · Reproducir despliegue escalonado de datos"
                >
                  <IonIcon icon={sparklesOutline} aria-hidden="true" />
                  <span>ANIMAR</span>
                </button>
              </div>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <div className="lt-workspace-container">
        {/* Panel de KPIs de Telemetría con cascada Glassy Framer Motion (Dashboard V22) */}
        <section aria-label="Métricas en tiempo real de la cinta transportadora">
          <GlassyStagger className="lt-kpi-ribbon" replayKey={revealKey}>
            <GlassyReveal className="lt-kpi-card lt-glass-panel" hoverLift>
              <span className="lt-kpi-label">UNIDADES EN CINTA (TOTAL)</span>
              <strong className="lt-kpi-number lt-tabular-nums" data-testid="kpi-total">
                {metrics.total}
              </strong>
              <span className="lt-kpi-foot">Masa acumulada: {metrics.totalWeightKg.toFixed(2)} kg</span>
            </GlassyReveal>

            <GlassyReveal className="lt-kpi-card lt-kpi-sky lt-glass-panel" hoverLift>
              <span className="lt-kpi-label">EN TRÁNSITO (IN_TRANSIT)</span>
              <strong className="lt-kpi-number lt-tabular-nums" data-testid="kpi-transit">
                {metrics.inTransit}
              </strong>
              <span className="lt-kpi-foot">{metrics.criticalCount} paquetes de prioridad CRITICAL</span>
            </GlassyReveal>

            <GlassyReveal className="lt-kpi-card lt-kpi-emerald lt-glass-panel" hoverLift>
              <span className="lt-kpi-label">APROBADOS (INSPECTED)</span>
              <strong className="lt-kpi-number lt-tabular-nums" data-testid="kpi-inspected">
                {metrics.inspected}
              </strong>
              <span className="lt-kpi-foot">Tasa procesada: {metrics.inspectionRatePercent}%</span>
            </GlassyReveal>

            <GlassyReveal className="lt-kpi-card lt-kpi-crimson lt-glass-panel" hoverLift>
              <span className="lt-kpi-label">CUARENTENA (REJECTED)</span>
              <strong className="lt-kpi-number lt-tabular-nums" data-testid="kpi-rejected">
                {metrics.rejected}
              </strong>
              <span className="lt-kpi-foot">Desviados a bahía QUARANTINE-Q1</span>
            </GlassyReveal>
          </GlassyStagger>
        </section>

        {/* Banners accesibles de feedback y propagación real de errores (RA 2, RA 3, RA 4) */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              key="err-banner"
              className="lt-banner-error lt-glass-panel"
              role="alert"
              aria-live="assertive"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="lt-banner-content">
                <IonIcon icon={alertCircleOutline} aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
              <button type="button" className="lt-banner-close" onClick={clearFeedback}>
                CERRAR
              </button>
            </motion.div>
          )}

          {feedbackBanner && (
            <motion.div
              key="ok-banner"
              className="lt-banner-success lt-glass-panel"
              role="status"
              aria-live="polite"
              data-testid="status-feedback-banner"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="lt-banner-content">
                <IonIcon icon={checkmarkDoneCircleOutline} aria-hidden="true" />
                <span>{feedbackBanner}</span>
              </div>
              <button type="button" className="lt-banner-close" onClick={clearFeedback}>
                OK
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Formulario desplegable de alta real en Supabase con UUID v4 */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              key="new-pkg-drawer"
              initial={{ opacity: 0, y: -14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            >
              <NewPackageForm onCreatePackage={handleCreatePackage} isSubmitting={isMutating} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gemelo Digital Isométrico 3D integrado con despliegue Glassy */}
        <GlassyReveal indexDelay={0.14}>
          <Conveyor3DStage
            packages={filteredPackages.length > 0 ? filteredPackages : packages}
            selectedPackage={selected3DPackage}
            onSelectPackage={(pkg) => setSelected3DPackage(pkg)}
            onStatusChange={handleStatusChange}
            compact
          />
        </GlassyReveal>

        {/* Barra de búsqueda reactiva ion-searchbar (Tarea 2.1 y Tarea 5) */}
        <GlassyReveal indexDelay={0.2}>
          <section className="lt-search-panel lt-glass-panel" aria-label="Búsqueda reactiva por código de seguimiento">
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
        </GlassyReveal>

        {/* Lista Declarativa ion-list con despliegue escalonado Framer Motion (estilo video Dashboard V22) */}
        <section className="lt-list-section" aria-label="Listado de paquetes en cinta transportadora">
          {isLoading ? (
            <div className="lt-state-box lt-glass-panel" role="status" aria-live="polite">
              <div className="lt-spinner" aria-hidden="true" />
              <h2>Sincronizando telemetría con Supabase PostgreSQL...</h2>
              <p>Verificando paquetes activos en la tabla public.warehouse_packages.</p>
            </div>
          ) : filteredPackages.length > 0 ? (
            <IonList className="lt-ion-list" data-testid="packages-ion-list">
              <AnimatePresence mode="popLayout">
                {filteredPackages.map((pkg, index) => (
                  <motion.div
                    key={`${pkg.id}-${revealKey}`}
                    layout
                    initial={{ opacity: 0, y: 24, scale: 0.975 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16, scale: 0.96 }}
                    transition={{
                      type: 'spring',
                      stiffness: 255,
                      damping: 25,
                      delay: Math.min(index * 0.055, 0.38)
                    }}
                    whileHover={{
                      y: -4,
                      transition: { type: 'spring', stiffness: 360, damping: 24 }
                    }}
                    className="lt-glass-sheen"
                  >
                    <PackageInspectionCard
                      pkg={pkg}
                      onStatusChange={handleStatusChange}
                      onDeletePackage={handleDeletePackage}
                      disabled={isMutating}
                      onSelect3D={(selected) => setSelected3DPackage(selected)}
                      isSelected3D={selected3DPackage?.id === pkg.id}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </IonList>
          ) : (
            /* Bloque equivalente a @empty en control de flujo declarativo (Tarea 2.2) */
            <motion.div
              className="lt-empty-state lt-glass-panel"
              role="status"
              aria-live="polite"
              data-testid="empty-packages-state"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
            >
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
            </motion.div>
          )}
        </section>
      </div>
    </main>
  );
};
