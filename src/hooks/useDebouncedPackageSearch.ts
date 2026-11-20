import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { PriorityFilter, StatusFilter, WarehousePackage } from '../models/package.model';
import { packageService } from '../services/package.service';

export interface DebouncedPackageSearchResult {
  readonly searchQuery: string;
  readonly debouncedQuery: string;
  readonly priorityFilter: PriorityFilter;
  readonly statusFilter: StatusFilter;
  readonly filteredPackages: ReadonlyArray<WarehousePackage>;
  readonly isFiltering: boolean;
  readonly setSearchQuery: (value: string) => void;
  readonly setPriorityFilter: (value: PriorityFilter) => void;
  readonly setStatusFilter: (value: StatusFilter) => void;
  readonly resetFilters: () => void;
}

/**
 * Custom React Hook (Tarea 2 y Tarea 5)
 * Reemplaza las suscripciones imperativas propensas a fugas de memoria (Memory Leaks)
 * por un ciclo de vida declarativo con limpieza determinista en `useEffect`,
 * programación concurrente con `useDeferredValue` (React 19) y estado derivado
 * memoizado con `useMemo` (equivalente funcional de `computed()` en Angular Signals).
 */
export function useDebouncedPackageSearch(
  packages: ReadonlyArray<WarehousePackage>,
  delayMs = 180
): DebouncedPackageSearchResult {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  // Limpieza determinista en el desmontaje o ante cada nueva pulsación (Cero Memory Leaks)
  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, delayMs);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [searchQuery, delayMs]);

  // Priorización concurrente de React 19 para evitar bloqueos de frame a 60fps
  const deferredQuery = useDeferredValue(debouncedQuery);

  // Estado derivado reactivo puro (homólogo a computed() en Signals)
  const filteredPackages = useMemo<ReadonlyArray<WarehousePackage>>(() => {
    return packageService.filterPackages(packages, deferredQuery, priorityFilter, statusFilter);
  }, [packages, deferredQuery, priorityFilter, statusFilter]);

  const resetFilters = (): void => {
    setSearchQuery('');
    setDebouncedQuery('');
    setPriorityFilter('ALL');
    setStatusFilter('ALL');
  };

  return {
    searchQuery,
    debouncedQuery: deferredQuery,
    priorityFilter,
    statusFilter,
    filteredPackages,
    isFiltering: searchQuery.trim() !== deferredQuery,
    setSearchQuery,
    setPriorityFilter,
    setStatusFilter,
    resetFilters
  };
}
