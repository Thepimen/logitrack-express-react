import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { PriorityFilter, StatusFilter, WarehousePackage } from '../models/package.model';
import { packageService } from './package.service';

/**
 * ============================================================================
 * TAREA 5 — INTERACCIÓN CON IA: AUDITORÍA CRÍTICA Y REFACTORIZACIÓN REACTIVA
 * ============================================================================
 * Este módulo contiene:
 * 1. El código textual defectuoso generado inicialmente por la IA (comentado y documentado
 *    para inspección en la vista de Auditoría Técnica y en la Memoria PDF).
 * 2. El motor RxJS refactorizado con cancelación determinista (`takeUntil(streamDestroy$)`) y
 *    tipado estricto (`ReadonlyArray<WarehousePackage>`), libre de fugas de memoria.
 */

export const AI_PROMPT_USED_IN_TASK_5 = `Actúa como desarrollador frontend en un sistema logístico de almacén llamado LogiTrack Express.
Necesito implementar un método de filtrado reactivo en tiempo real para la barra de búsqueda (ion-searchbar) que filtre paquetes por su código trackingCode (formato LTK-XXXX-ES) utilizando operadores de RxJS (debounceTime, distinctUntilChanged y switchMap) en nuestra aplicación React con Ionic Framework v8 y TypeScript.`;

export const AI_DEFECTIVE_CODE_SNIPPET = `// [CÓDIGO DEFECTUOSO GENERADO POR LA IA — NO USAR EN PRODUCCIÓN]
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

export class PackageSearchHelper {
  searchSubject = new Subject<any>();
  results: any[] = [];

  initSearch(service: any, callback: any) {
    // FALLO CRÍTICO 1 (Fuga de Memoria / Memory Leak):
    // Se crea una suscripción perpetua sin takeUntil(), takeUntilDestroyed() ni retorno de Subscription.unsubscribe().
    // Cada vez que el componente se monta o re-ejecuta initSearch, se acumulan observadores zombies en el Heap.
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      // FALLO CRÍTICO 2 (Violación de Tipado Estricto):
      // Uso masivo de 'any' que anula las garantías de 'strict: true' en tsconfig.json
      switchMap((term: any) => service.searchByTracking(term))
    ).subscribe((data: any) => {
      // FALLO CRÍTICO 3 (Mutación imperativa y ausencia de manejo de errores):
      this.results = data;
      callback(data);
    });
  }
}`;

export const STUDENT_REFACTORED_CODE_SNIPPET = `// [CÓDIGO REFACTORIZADO POR LUIS LÁZARO PIMENTEL — 100% SEGURO EN MEMORIA Y TIPADO ESTRICTO]
// Alternativa A: Pipeline RxJS con cancelación determinista takeUntil(streamDestroy$) y tipado WarehousePackage
export class SafeReactivePackageFilter {
  private readonly searchTerms$ = new Subject<string>();

  public connectStream(
    sourceGetter: () => ReadonlyArray<WarehousePackage>,
    priorityGetter: () => PriorityFilter,
    onResult: (filtered: ReadonlyArray<WarehousePackage>) => void
  ): () => void {
    const streamDestroy$ = new Subject<void>();
    const subscription = this.searchTerms$
      .pipe(
        debounceTime(180),
        distinctUntilChanged(),
        switchMap((term: string): Observable<ReadonlyArray<WarehousePackage>> => {
          const filtered = packageService.filterPackages(sourceGetter(), term, priorityGetter());
          return of(filtered);
        }),
        takeUntil(streamDestroy$)
      )
      .subscribe({
        next: (packages: ReadonlyArray<WarehousePackage>) => onResult(packages),
        error: (err: unknown) => console.error('[LogiTrack::RxJSFilter] Error en stream:', err)
      });

    return () => {
      streamDestroy$.next();
      streamDestroy$.complete();
      subscription.unsubscribe();
    };
  }
}

// Alternativa B (Nativa en React 19 / Equivalente a Signals + computed() en Angular):
// Hook declarativo useDebouncedPackageSearch con limpieza automática de temporizador y useMemo()`;

/**
 * Implementación real y ejecutable del filtro reactivo RxJS libre de fugas de memoria
 */
export class SafeReactivePackageFilter {
  private readonly searchTerms$ = new Subject<string>();
  private activeSubscriptionCount = 0;

  public connectStream(
    sourceGetter: () => ReadonlyArray<WarehousePackage>,
    priorityGetter: () => PriorityFilter,
    statusGetter: () => StatusFilter,
    onResult: (filtered: ReadonlyArray<WarehousePackage>) => void,
    debounceMs = 0
  ): () => void {
    this.activeSubscriptionCount += 1;
    const streamDestroy$ = new Subject<void>();

    const pipeline$ =
      debounceMs > 0
        ? this.searchTerms$.pipe(debounceTime(debounceMs), distinctUntilChanged())
        : this.searchTerms$.pipe(distinctUntilChanged());

    const subscription = pipeline$
      .pipe(
        switchMap((term: string): Observable<ReadonlyArray<WarehousePackage>> => {
          const filtered = packageService.filterPackages(
            sourceGetter(),
            term,
            priorityGetter(),
            statusGetter()
          );
          return of(filtered);
        }),
        takeUntil(streamDestroy$)
      )
      .subscribe({
        next: (packages: ReadonlyArray<WarehousePackage>) => {
          onResult(packages);
        }
      });

    return () => {
      streamDestroy$.next();
      streamDestroy$.complete();
      subscription.unsubscribe();
      this.activeSubscriptionCount = Math.max(0, this.activeSubscriptionCount - 1);
    };
  }

  public pushSearchTerm(term: string): void {
    this.searchTerms$.next(term);
  }

  public getActiveSubscriptionCount(): number {
    return this.activeSubscriptionCount;
  }
}
