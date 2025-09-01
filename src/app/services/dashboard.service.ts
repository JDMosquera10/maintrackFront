import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, combineLatest, interval, timer } from 'rxjs';
import { map, tap, catchError, startWith, switchMap, shareReplay } from 'rxjs/operators';
import { 
  DashboardData, 
  DashboardStats, 
  DashboardCharts, 
  MaintenanceAlert, 
  RecentMachine,
  DashboardFilters,
  DashboardResponse,
  MaintenancesByMonth,
  MachineStatusData,
  SpareParts 
} from '../shared/models/dashboard.model';
import { ApiResponse } from '../shared/models/api-response.model';
import { BaseApiService } from './base-api.service';
import { MachineService } from './machine.service';
import { Machine } from '../shared/models/machine.model';
import { Maintenance } from '../shared/models/maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends BaseApiService {
  private dashboardDataSubject = new BehaviorSubject<DashboardData | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private lastUpdateSubject = new BehaviorSubject<Date | null>(null);
  private filtersSubject = new BehaviorSubject<DashboardFilters>({});

  // Intervalos de actualización (en milisegundos)
  private readonly STATS_UPDATE_INTERVAL = 300000; // 30 segundos
  private readonly CHARTS_UPDATE_INTERVAL = 600000; // 1 minuto
  private readonly ALERTS_UPDATE_INTERVAL = 150000; // 15 segundos
  private readonly FULL_REFRESH_INTERVAL = 3000000; // 5 minutos

  constructor(
    http: HttpClient,
    private machineService: MachineService
  ) {
    super(http, 'dashboard');
  }

  /**
   * Observable para obtener los datos del dashboard
   */
  get dashboardData$(): Observable<DashboardData | null> {
    return this.dashboardDataSubject.asObservable();
  }

  /**
   * Observable para saber si está cargando
   */
  get isLoading$(): Observable<boolean> {
    return this.isLoadingSubject.asObservable();
  }

  /**
   * Observable para la última actualización
   */
  get lastUpdate$(): Observable<Date | null> {
    return this.lastUpdateSubject.asObservable();
  }

  /**
   * Observable para los filtros actuales
   */
  get filters$(): Observable<DashboardFilters> {
    return this.filtersSubject.asObservable();
  }

  /**
   * Inicializa el dashboard con datos y configura actualizaciones automáticas
   */
  initializeDashboard(): Observable<DashboardData> {
    this.setLoading(true);
    
    return this.loadFullDashboardData().pipe(
      tap(data => {
        this.dashboardDataSubject.next(data);
        this.lastUpdateSubject.next(new Date());
        this.setLoading(false);
        this.startPeriodicUpdates();
      }),
      catchError(error => {
        this.setLoading(false);
        throw error;
      })
    );
  }

  /**
   * Carga todos los datos del dashboard desde el backend
   */
  private loadFullDashboardData(): Observable<DashboardData> {
    const filters = this.filtersSubject.value;
    
    return combineLatest({
      stats: this.getDashboardStats(filters),
      charts: this.getDashboardCharts(filters),
      alerts: this.getMaintenanceAlerts(filters),
      recentMachines: this.getRecentMachines(filters)
    }).pipe(
      tap(data => console.log('Combined dashboard data:', data)),
      map(({ stats, charts, alerts, recentMachines }) => {
        const dashboardData = {
          stats,
          charts,
          alerts,
          recentMachines,
          lastUpdated: new Date()
        };
        console.log('Final dashboard data structure:', dashboardData);
        return dashboardData;
      })
    );
  }

  /**
   * Obtiene las estadísticas principales del dashboard
   */
  getDashboardStats(filters?: DashboardFilters): Observable<DashboardStats> {
    const params = this.buildQueryParams(filters);
    
    return this.get<DashboardStats>(`${this.baseUrl}/stats`, params).pipe(
      tap(response => console.log('Stats response from backend:', response)),
      catchError(error => {
        console.log('Error loading stats, using mock data:', error);
        return this.generateMockStats();
      })
    );
  }

  /**
   * Obtiene los datos para los gráficos
   */
  getDashboardCharts(filters?: DashboardFilters): Observable<DashboardCharts> {
    const params = this.buildQueryParams(filters);
    
    return this.get<DashboardCharts>(`${this.baseUrl}/charts`, params).pipe(
      tap(response => console.log('Charts response from backend:', response)),
      catchError(error => {
        console.log('Error loading charts, using mock data:', error);
        return this.generateMockCharts();
      })
    );
  }

  /**
   * Obtiene las alertas de mantenimiento próximas
   */
  getMaintenanceAlerts(filters?: DashboardFilters): Observable<MaintenanceAlert[]> {
    const params = this.buildQueryParams(filters);
    
    return this.get<MaintenanceAlert[]>(`${this.baseUrl}/alerts`, params).pipe(
      tap(response => console.log('Alerts response from backend:', response)),
      catchError(error => {
        console.log('Error loading alerts, using mock data:', error);
        return this.generateMockAlerts();
      })
    );
  }

  /**
   * Obtiene las máquinas recientes con próximos mantenimientos
   */
  getRecentMachines(filters?: DashboardFilters): Observable<RecentMachine[]> {
    const params = this.buildQueryParams(filters);
    
    return this.get<RecentMachine[]>(`${this.baseUrl}/machines/recent`, params).pipe(
      tap(response => console.log('Recent machines response from backend:', response)),
      catchError(error => {
        console.log('Error loading recent machines, using mock data:', error);
        return this.generateMockRecentMachines();
      })
    );
  }

  /**
   * Actualiza los filtros del dashboard
   */
  updateFilters(filters: DashboardFilters): void {
    this.filtersSubject.next(filters);
    this.refreshDashboard();
  }

  /**
   * Refresca manualmente todos los datos del dashboard
   */
  refreshDashboard(): Observable<DashboardData> {
    return this.initializeDashboard();
  }

  /**
   * Actualización parcial de stats (más frecuente)
   */
  private updateStats(): void {
    const filters = this.filtersSubject.value;
    
    this.getDashboardStats(filters).subscribe(
      stats => {
        const currentData = this.dashboardDataSubject.value;
        if (currentData) {
          this.dashboardDataSubject.next({
            ...currentData,
            stats,
            lastUpdated: new Date()
          });
        }
      },
      error => console.warn('Error actualizando stats:', error)
    );
  }

  /**
   * Actualización parcial de alertas (más frecuente)
   */
  private updateAlerts(): void {
    const filters = this.filtersSubject.value;
    
    this.getMaintenanceAlerts(filters).subscribe(
      alerts => {
        const currentData = this.dashboardDataSubject.value;
        if (currentData) {
          this.dashboardDataSubject.next({
            ...currentData,
            alerts,
            lastUpdated: new Date()
          });
        }
      },
      error => console.warn('Error actualizando alertas:', error)
    );
  }

  /**
   * Inicia las actualizaciones periódicas automáticas
   */
  private startPeriodicUpdates(): void {
    // Actualización de stats cada 30 segundos
    interval(this.STATS_UPDATE_INTERVAL).subscribe(() => this.updateStats());
    
    // Actualización de alertas cada 15 segundos
    interval(this.ALERTS_UPDATE_INTERVAL).subscribe(() => this.updateAlerts());
    
    // Actualización completa cada 5 minutos
    interval(this.FULL_REFRESH_INTERVAL).subscribe(() => {
      this.loadFullDashboardData().subscribe(
        data => {
          this.dashboardDataSubject.next(data);
          this.lastUpdateSubject.next(new Date());
        },
        error => console.warn('Error en actualización completa:', error)
      );
    });
  }

  /**
   * Construye parámetros de consulta a partir de filtros
   */
  private buildQueryParams(filters?: DashboardFilters): any {
    if (!filters) return {};

    const params: any = {};
    
    if (filters.dateRange) {
      params.startDate = filters.dateRange.start.toISOString();
      params.endDate = filters.dateRange.end.toISOString();
    }
    if (filters.client) params.client = filters.client;
    if (filters.machineType) params.machineType = filters.machineType;
    if (filters.location) params.location = filters.location;
    if (filters.status?.length) params.status = filters.status.join(',');
    
    return params;
  }

  private setLoading(loading: boolean): void {
    this.isLoadingSubject.next(loading);
  }

  /**
   * MÉTODOS MOCK - Datos de ejemplo hasta que tengas el backend completo
   */
  private generateMockStats(): Observable<DashboardStats> {
    return new Observable(observer => {
      observer.next({
        totalMachines: 24,
        activeMachines: 18,
        inactiveMachines: 6,
        pendingMaintenances: 8,
        completedMaintenances: 156,
        upcomingAlerts: 6, // Actualizado para reflejar las 6 alertas mock
        totalWorkHours: 2840,
        averageUsageHours: 1250
      });
      observer.complete();
    });
  }

  private generateMockCharts(): Observable<DashboardCharts> {
    return new Observable(observer => {
      observer.next({
        maintenancesByMonth: [
          { month: 'Enero', preventive: 5, corrective: 3, total: 8 },
          { month: 'Febrero', preventive: 6, corrective: 2, total: 8 },
          { month: 'Marzo', preventive: 5, corrective: 4, total: 9 },
          { month: 'Abril', preventive: 7, corrective: 3, total: 10 },
          { month: 'Mayo', preventive: 4, corrective: 5, total: 9 },
          { month: 'Junio', preventive: 9, corrective: 2, total: 11 }
        ],
        machineStatus: {
          operational: 18,
          maintenance: 6,
          offline: 0
        },
        sparePartsConsumption: [
          { month: 'Enero', filtersUsed: 12, oilUsed: 450, partsReplaced: 8 },
          { month: 'Febrero', filtersUsed: 19, oilUsed: 380, partsReplaced: 12 },
          { month: 'Marzo', filtersUsed: 15, oilUsed: 520, partsReplaced: 6 },
          { month: 'Abril', filtersUsed: 22, oilUsed: 410, partsReplaced: 15 },
          { month: 'Mayo', filtersUsed: 18, oilUsed: 490, partsReplaced: 9 },
          { month: 'Junio', filtersUsed: 25, oilUsed: 530, partsReplaced: 18 }
        ]
      });
      observer.complete();
    });
  }

  private generateMockAlerts(): Observable<MaintenanceAlert[]> {
    return new Observable(observer => {
      observer.next([
        {
          id: '1',
          maintenanceId: 'maint-001',
          machineId: 'mach-001',
          machineModel: 'CAT 320D',
          machineSerial: 'CAT-12345',
          client: 'Constructora ABC',
          dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Vencido hace 3 días
          daysRemaining: -3,
          maintenanceType: 'Preventivo',
          priority: 'critical',
          location: 'Obra Norte',
          technicianId: 'tech-001',
          spareParts: ['Filtro de aceite', 'Filtro de aire'],
          observations: 'Mantenimiento preventivo vencido'
        },
        {
          id: '2',
          maintenanceId: 'maint-002',
          machineId: 'mach-002',
          machineModel: 'Komatsu PC200',
          machineSerial: 'KOM-67890',
          client: 'Minera XYZ',
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Vencido hace 1 día
          daysRemaining: -1,
          maintenanceType: 'Correctivo',
          priority: 'critical',
          location: 'Mina Sur',
          technicianId: 'tech-002',
          spareParts: ['Sistema hidráulico', 'Frenos'],
          observations: 'Mantenimiento correctivo urgente'
        },
        {
          id: '3',
          maintenanceId: 'maint-003',
          machineId: 'mach-003',
          machineModel: 'Volvo EC210',
          machineSerial: 'VOL-54321',
          client: 'Constructora DEF',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Vence mañana
          daysRemaining: 1,
          maintenanceType: 'Preventivo',
          priority: 'high',
          location: 'Proyecto Centro',
          technicianId: 'tech-003',
          spareParts: ['Filtro de combustible', 'Aceite hidráulico'],
          observations: 'Mantenimiento preventivo programado'
        },
        {
          id: '4',
          maintenanceId: 'maint-004',
          machineId: 'mach-004',
          machineModel: 'JCB 3CX',
          machineSerial: 'JCB-98765',
          client: 'Infraestructura GHI',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Vence en 3 días
          daysRemaining: 3,
          maintenanceType: 'Preventivo',
          priority: 'high',
          location: 'Carretera Este',
          technicianId: 'tech-004',
          spareParts: ['Filtro de aire', 'Aceite motor'],
          observations: 'Mantenimiento preventivo próximo'
        },
        {
          id: '5',
          maintenanceId: 'maint-005',
          machineId: 'mach-005',
          machineModel: 'Liebherr R934C',
          machineSerial: 'LIE-11111',
          client: 'Demoliciones JKL',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Vence en 5 días
          daysRemaining: 5,
          maintenanceType: 'Correctivo',
          priority: 'medium',
          location: 'Zona Industrial',
          technicianId: 'tech-005',
          spareParts: ['Repuestos hidráulicos'],
          observations: 'Mantenimiento correctivo programado'
        },
        {
          id: '6',
          maintenanceId: 'maint-006',
          machineId: 'mach-006',
          machineModel: 'Hitachi ZX200',
          machineSerial: 'HIT-22222',
          client: 'Construcciones MNO',
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // Vence en 10 días
          daysRemaining: 10,
          maintenanceType: 'Preventivo',
          priority: 'low',
          location: 'Proyecto Sur',
          technicianId: 'tech-006',
          spareParts: ['Filtros varios'],
          observations: 'Mantenimiento preventivo rutinario'
        }
      ]);
      observer.complete();
    });
  }

  private generateMockRecentMachines(): Observable<RecentMachine[]> {
    return new Observable(observer => {
      observer.next([
        {
          id: 'mach-001',
          model: 'CAT 320D',
          serialNumber: 'CAT-12345',
          client: 'Constructora ABC',
          nextMaintenanceDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          daysUntilMaintenance: 5,
          status: 'Operativa',
          location: 'Obra Norte'
        },
        {
          id: 'mach-002',
          model: 'Komatsu PC200',
          serialNumber: 'KOM-67890',
          client: 'Minera XYZ',
          nextMaintenanceDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          daysUntilMaintenance: 2,
          status: 'Mantenimiento',
          location: 'Mina Sur'
        },
        {
          id: 'mach-003',
          model: 'Volvo EC210',
          serialNumber: 'VOL-54321',
          client: 'Constructora DEF',
          nextMaintenanceDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
          daysUntilMaintenance: 6,
          status: 'Operativa',
          location: 'Proyecto Centro'
        },
        {
          id: 'mach-004',
          model: 'JCB 3CX',
          serialNumber: 'JCB-98765',
          client: 'Infraestructura GHI',
          nextMaintenanceDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
          daysUntilMaintenance: 12,
          status: 'Operativa',
          location: 'Carretera Este'
        },
        {
          id: 'mach-005',
          model: 'Liebherr R934C',
          serialNumber: 'LIE-11111',
          client: 'Demoliciones JKL',
          nextMaintenanceDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
          daysUntilMaintenance: 8,
          status: 'Operativa',
          location: 'Zona Industrial'
        }
      ]);
      observer.complete();
    });
  }
}
