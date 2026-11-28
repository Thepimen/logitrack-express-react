import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CreatePackageInput,
  PackageStatusChangeEvent,
  PriorityFilter,
  StatusFilter,
  WarehousePackage
} from '../models/package.model';
import { packageService } from '../services/package.service';
import { useDebouncedPackageSearch } from './useDebouncedPackageSearch';

export interface WarehouseMetrics {
  readonly total: number;
  readonly inTransit: number;
  readonly inspected: number;
  readonly rejected: number;
  readonly criticalCount: number;
  readonly totalWeightKg: number;
  readonly inspectionRatePercent: number;
}

export interface UseWarehousePackagesReturn {
  readonly packages: ReadonlyArray<WarehousePackage>;
  readonly filteredPackages: ReadonlyArray<WarehousePackage>;
  readonly metrics: WarehouseMetrics;
  readonly isLoading: boolean;
  readonly isMutating: boolean;
  readonly errorMessage: string | null;
  readonly feedbackBanner: string | null;
  readonly searchQuery: string;
  readonly debouncedQuery: string;
  readonly priorityFilter: PriorityFilter;
  readonly statusFilter: StatusFilter;
  readonly setSearchQuery: (q: string) => void;
  readonly setPriorityFilter: (p: PriorityFilter) => void;
  readonly setStatusFilter: (s: StatusFilter) => void;
  readonly resetFilters: () => void;
  readonly clearFeedback: () => void;
  readonly reloadPackages: () => Promise<void>;
  readonly handleStatusChange: (event: PackageStatusChangeEvent) => Promise<void>;
  readonly handleCreatePackage: (input: CreatePackageInput) => Promise<boolean>;
  readonly handleDeletePackage: (id: string) => Promise<void>;
}

/**
 * Hook de Orquestación de Estado Reactivo y Persistencia Real (RA 1, RA 2, RA 3, RA 5)
 * - useState: estado reactivo local de paquetes, carga, mutación y feedback accesible.
 * - useEffect: sincronización inicial con Supabase PostgreSQL y suscripción con cleanup determinista.
 * - useCallback: referencias estables para handlers pasados a componentes hijos (evita re-renders superfluos).
 * - useMemo: cálculo inmutable de métricas operativas de cinta transportadora.
 * - useRef: control de montaje seguro para evitar setState sobre componentes desmontados.
 */
export function useWarehousePackages(): UseWarehousePackagesReturn {
  const [packages, setPackages] = useState<ReadonlyArray<WarehousePackage>>(() =>
    packageService.getSnapshot()
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const searchState = useDebouncedPackageSearch(packages, 180);

  const reloadPackages = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const freshList = await packageService.fetchAllPackages();
      if (isMountedRef.current) {
        setPackages(freshList);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'No se pudieron actualizar los envíos en este momento.';
      if (isMountedRef.current) {
        setErrorMessage(msg);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    const unsubscribe = packageService.subscribe((nextSnapshot) => {
      if (isMountedRef.current) {
        setPackages(nextSnapshot);
      }
    });

    void reloadPackages();

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [reloadPackages]);

  const handleStatusChange = useCallback(
    async (event: PackageStatusChangeEvent): Promise<void> => {
      setIsMutating(true);
      setErrorMessage(null);
      try {
        const updated = await packageService.updatePackageStatus(event.id, event.newStatus);
        if (isMountedRef.current) {
          const readableStatus =
            updated.status === 'INSPECTED'
              ? 'Inspeccionado'
              : updated.status === 'REJECTED'
                ? 'En cuarentena'
                : 'En tránsito';
          setFeedbackBanner(
            `Envío ${updated.trackingCode} actualizado correctamente a ${readableStatus}.`
          );
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : 'No se pudo actualizar el estado del paquete en base de datos.';
        if (isMountedRef.current) {
          setErrorMessage(msg);
        }
      } finally {
        if (isMountedRef.current) {
          setIsMutating(false);
        }
      }
    },
    []
  );

  const handleCreatePackage = useCallback(
    async (input: CreatePackageInput): Promise<boolean> => {
      setIsMutating(true);
      setErrorMessage(null);
      try {
        const created = await packageService.createPackage(input);
        if (isMountedRef.current) {
          setFeedbackBanner(
            `Envío ${created.trackingCode} registrado correctamente en la línea activa.`
          );
        }
        return true;
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'No se pudo registrar el nuevo paquete.';
        if (isMountedRef.current) {
          setErrorMessage(msg);
        }
        return false;
      } finally {
        if (isMountedRef.current) {
          setIsMutating(false);
        }
      }
    },
    []
  );

  const handleDeletePackage = useCallback(async (id: string): Promise<void> => {
    setIsMutating(true);
    setErrorMessage(null);
    try {
      await packageService.deletePackage(id);
      if (isMountedRef.current) {
        setFeedbackBanner(`Envío retirado correctamente del registro de la línea.`);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Error al retirar el paquete de la base de datos.';
      if (isMountedRef.current) {
        setErrorMessage(msg);
      }
    } finally {
      if (isMountedRef.current) {
        setIsMutating(false);
      }
    }
  }, []);

  const clearFeedback = useCallback((): void => {
    setFeedbackBanner(null);
    setErrorMessage(null);
  }, []);

  const metrics = useMemo<WarehouseMetrics>(() => {
    const total = packages.length;
    let inTransit = 0;
    let inspected = 0;
    let rejected = 0;
    let criticalCount = 0;
    let totalWeightKg = 0;

    for (const pkg of packages) {
      totalWeightKg += pkg.weightKg;
      if (pkg.priority === 'CRITICAL') criticalCount += 1;
      if (pkg.status === 'IN_TRANSIT') inTransit += 1;
      else if (pkg.status === 'INSPECTED') inspected += 1;
      else if (pkg.status === 'REJECTED') rejected += 1;
    }

    const processed = inspected + rejected;
    const inspectionRatePercent = total > 0 ? Math.round((processed / total) * 100) : 0;

    return Object.freeze({
      total,
      inTransit,
      inspected,
      rejected,
      criticalCount,
      totalWeightKg: Number(totalWeightKg.toFixed(2)),
      inspectionRatePercent
    });
  }, [packages]);

  return {
    packages,
    filteredPackages: searchState.filteredPackages,
    metrics,
    isLoading,
    isMutating,
    errorMessage,
    feedbackBanner,
    searchQuery: searchState.searchQuery,
    debouncedQuery: searchState.debouncedQuery,
    priorityFilter: searchState.priorityFilter,
    statusFilter: searchState.statusFilter,
    setSearchQuery: searchState.setSearchQuery,
    setPriorityFilter: searchState.setPriorityFilter,
    setStatusFilter: searchState.setStatusFilter,
    resetFilters: searchState.resetFilters,
    clearFeedback,
    reloadPackages,
    handleStatusChange,
    handleCreatePackage,
    handleDeletePackage
  };
}
