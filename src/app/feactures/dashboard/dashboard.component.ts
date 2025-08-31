import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, NgZone, PLATFORM_ID, ViewChild, OnDestroy } from '@angular/core';
import { GeneralModule } from '../../modules/general.module';

import { GridStack } from 'gridstack';
import { isPlatformBrowser } from '@angular/common';
import { take, Subject, takeUntil } from 'rxjs';
import { eachMonthOfInterval, format, startOfYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ThemeService } from '../../services/theme.service';
import { DashboardService } from '../../services/dashboard.service';
import { WebSocketService } from '../../services/websocket.service';
import { DashboardData, MaintenanceAlert, RecentMachine } from '../../shared/models/dashboard.model';

export interface PeriodicElement {
  model: string;
  serialNumber: number;
  weight: number;
  client: string;
  expirationDate: string;
}

const ELEMENT_DATA: PeriodicElement[] = [];

@Component({
  selector: 'app-dashboard',
  imports: [GeneralModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gridRef', { static: true }) gridRef!: ElementRef<HTMLElement>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  // Referencias a los gráficos para forzar actualización
  @ViewChild('barChart') barChart: any;
  @ViewChild('lineChart') lineChart: any;
  @ViewChild('doughnutChart') doughnutChart: any;
  
  private destroy$ = new Subject<void>();

  private grid?: GridStack;
  public today: Date = new Date();
  protected monthCurrent: string[] = [];
  barChartData: ChartConfiguration<'bar'>['data'] | any;
  barChartOptions: ChartOptions<'bar'> = {};
  
  private getBarChartOptions(): ChartOptions<'bar'> {
    const colors = this.getThemeColors();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: colors.textPrimary,
            font: { size: 12 },
            padding: 20
          },
          position: 'bottom'
        },
        tooltip: {
          backgroundColor: colors.bgSecondary,
          titleColor: colors.primary,
          bodyColor: colors.textPrimary,
          borderColor: colors.primary,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          ticks: { color: colors.textPrimary, font: { size: 11 } },
          grid: { color: colors.borderColor }
        },
        y: {
          ticks: { color: colors.textPrimary, font: { size: 11 } },
          grid: { color: colors.borderColor }
        }
      }
    };
  }

  lineChartData: ChartConfiguration<'line'>['data'] | any;
  lineChartOptions: ChartOptions<'line'> = {};
  
  private getLineChartOptions(): ChartOptions<'line'> {
    const colors = this.getThemeColors();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: colors.textPrimary,
            font: { size: 12 }
          }
        },
        tooltip: {
          backgroundColor: colors.bgSecondary,
          titleColor: colors.warning,
          bodyColor: colors.textPrimary,
          borderColor: colors.warning,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          ticks: { color: colors.textPrimary, font: { size: 11 } },
          grid: { color: colors.borderColor }
        },
        y: {
          ticks: { color: colors.textPrimary, font: { size: 11 } },
          grid: { color: colors.borderColor }
        }
      }
    };
  }


  displayedColumns: string[] = ['model', 'serialNumber', 'client', 'expirationDate'];
  dataSource = new MatTableDataSource<PeriodicElement>();


  // --- Máquinas Activas vs Inactivas ---
  doughnutChartData: ChartConfiguration<'doughnut'>['data'] | any;

  doughnutChartOptions: ChartOptions<'doughnut'> = {};
  
  private getDoughnutChartOptions(): ChartOptions<'doughnut'> {
    const colors = this.getThemeColors();
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      radius: '70%',
      plugins: {
        legend: {
          labels: {
            color: colors.textPrimary,
            font: { size: 12 },
            padding: 15
          },
          position: 'bottom'
        },
        tooltip: {
          backgroundColor: colors.bgSecondary,
          titleColor: colors.primary,
          bodyColor: colors.textPrimary,
          borderColor: colors.primary,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8
        }
      }
    };
  }


  // Nuevas propiedades para datos reales
  dashboardData: DashboardData | null = null;
  isLoading = false;
  lastUpdate: Date | null = null;
  
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, 
    private ngZone: NgZone,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private dashboardService: DashboardService,
    public webSocketService: WebSocketService
  ) {
    this.getMonthToday();
    this.prepareChartOptions1();
    this.prepareChartOptions2();
    this.prepareChartOptions3();
    this.dataSource.data = ELEMENT_DATA;
    
    // Inicializar servicios de datos
    this.initializeDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.grid?.destroy(false); // evita fugas al navegar
    this.grid = undefined;
    
    // Desconectar WebSocket al destruir el componente
    this.webSocketService.disconnect();
  }

  /**
   * Obtiene los colores actuales del tema desde las variables CSS
   */
  private getThemeColors() {
    // Verificar si estamos en el navegador
    if (!isPlatformBrowser(this.platformId)) {
      return this.getDefaultColors();
    }
    
    try {
      // Obtener el tema actual directamente del servicio
      const isDark = this.themeService?.isDarkTheme() ?? true;
      console.log('getThemeColors - Tema detectado:', isDark ? 'Oscuro' : 'Claro');
      
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      
      // Obtener colores base
      const primary = computedStyle.getPropertyValue('--color-primary').trim() || '#02BEC1';
      const primaryAlt = computedStyle.getPropertyValue('--color-primary-alt').trim() || '#04c0c3';
      const accent = computedStyle.getPropertyValue('--color-accent').trim() || '#a44a5d';
      const warning = computedStyle.getPropertyValue('--color-warning').trim() || '#f0961b';
      
      // Verificar qué colores de texto tenemos en CSS
      const cssTextPrimary = computedStyle.getPropertyValue('--text-primary').trim();
      console.log('CSS --text-primary:', cssTextPrimary);
      
      // Usar colores específicos según el tema actual
      if (isDark) {
        return {
          primary,
          primaryAlt,
          accent,
          warning,
          textPrimary: '#ffffff',
          textSecondary: 'rgba(255, 255, 255, 0.7)',
          bgSecondary: '#202837',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        };
      } else {
        return {
          primary,
          primaryAlt,
          accent,
          warning,
          textPrimary: '#1a202c',
          textSecondary: 'rgba(26, 32, 44, 0.7)',
          bgSecondary: '#ffffff',
          borderColor: 'rgba(203, 213, 224, 0.6)'
        };
      }
    } catch (error) {
      console.warn('Error al obtener colores del tema, usando colores por defecto:', error);
      return this.getDefaultColors();
    }
  }

  /**
   * Colores por defecto cuando no se pueden obtener del CSS
   */
  private getDefaultColors() {
    return {
      primary: '#02BEC1',
      primaryAlt: '#04c0c3',
      accent: '#a44a5d',
      warning: '#f0961b',
      textPrimary: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
      bgSecondary: '#202837',
      borderColor: 'rgba(255, 255, 255, 0.1)'
    };
  }

  /**
   * Actualiza todos los gráficos cuando cambia el tema
   */
  private updateChartsForTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      console.log('Tema cambiado, iniciando actualización de gráficos...');
      
      // Estrategia múltiple para asegurar actualización
      this.ngZone.run(() => {
        // Primer intento después de un pequeño delay para que CSS se actualice
        setTimeout(() => {
          console.log('Primera actualización - Tema actual:', this.themeService?.isDarkTheme() ? 'Oscuro' : 'Claro');
          this.updateChartsWithCurrentData();
          this.cdr.detectChanges();
          this.forceChartsUpdate();
        }, 100);
        
        // Segundo intento con delay mayor para asegurar que todo esté actualizado
        setTimeout(() => {
          console.log('Segunda actualización (confirmación)');
          this.updateChartsWithCurrentData();
          this.cdr.detectChanges();
          this.forceChartsUpdate();
          console.log('Gráficos completamente actualizados');
        }, 300);
      });
    }
  }

  /**
   * Actualiza los gráficos con los datos actuales del dashboard
   */
  private updateChartsWithCurrentData(): void {
    if (this.dashboardData) {
      this.updateChartsWithRealData(this.dashboardData);
    } else {
      // Si no hay datos reales, usar datos mock pero solo para la estructura
      this.prepareChartOptions1();
      this.prepareChartOptions2();
      this.prepareChartOptions3();
    }
  }

  /**
   * Fuerza la actualización de las instancias de Chart.js
   */
  private forceChartsUpdate(): void {
    try {
      // Estrategia 1: Usar las referencias del ViewChild
      this.updateChartInstance(this.barChart, this.barChartData, this.barChartOptions);
      this.updateChartInstance(this.lineChart, this.lineChartData, this.lineChartOptions);
      this.updateChartInstance(this.doughnutChart, this.doughnutChartData, this.doughnutChartOptions);
      
      // Estrategia 2: Forzar nueva asignación para trigger change detection
      setTimeout(() => {
        this.barChartData = { ...this.barChartData };
        this.lineChartData = { ...this.lineChartData };
        this.doughnutChartData = { ...this.doughnutChartData };
        this.cdr.detectChanges();
      }, 50);
      
    } catch (error) {
      console.warn('Error al actualizar gráficos:', error);
      // Como fallback, forzar re-renderización completa
      this.cdr.markForCheck();
    }
  }

  /**
   * Actualiza una instancia específica de gráfico
   */
  private updateChartInstance(chartRef: any, data: any, options: any): void {
    if (chartRef && chartRef.chart) {
      chartRef.chart.data = data;
      chartRef.chart.options = options;
      chartRef.chart.update('none'); // 'none' es más rápido que 'active'
    }
  }

  prepareChartOptions1() {
    const colors = this.getThemeColors();
    
    this.barChartData = {
      labels: this.monthCurrent,
      datasets: [
        {
          label: 'Preventivos',
          data: [5, 6, 5, 7, 4, 9],
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          borderWidth: 2,
          borderRadius: 8,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
          hoverBackgroundColor: colors.primaryAlt
        },
        {
          label: 'Correctivos',
          data: [3, 2, 4, 3, 5, 2],
          backgroundColor: colors.warning,
          borderColor: colors.warning,
          borderWidth: 2,
          borderRadius: 8,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
          hoverBackgroundColor: colors.accent
        }
      ]
    };
    
    this.barChartOptions = this.getBarChartOptions();
  }

  prepareChartOptions2() {
    const colors = this.getThemeColors();
    
    this.doughnutChartData = {
      labels: ['Mantenimiento', 'Operación'],
      datasets: [
        {
          data: [18, 6],
          backgroundColor: [colors.primary, colors.warning],
          borderWidth: 3,
          borderColor: colors.bgSecondary,
          hoverBackgroundColor: [
            colors.primaryAlt,
            colors.accent
          ],
          hoverBorderWidth: 4
        }
      ]
    };
    
    this.doughnutChartOptions = this.getDoughnutChartOptions();
  }

  prepareChartOptions3() {
    const colors = this.getThemeColors();
    
    this.lineChartData = {
      labels: this.monthCurrent,
      datasets: [
        {
          label: 'Filtros',
          data: [12, 19, 15, 22, 18, 25],
          borderColor: colors.primary,
          backgroundColor: colors.primary + '20', // 20 para transparencia
          borderWidth: 3,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: colors.primary,
          pointBorderColor: colors.textPrimary,
          pointBorderWidth: 2,
          pointHoverRadius: 7
        },
      ]
    };
    
    this.lineChartOptions = this.getLineChartOptions();
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Espera a que Angular termine de estabilizar el DOM en el navegador
    this.ngZone.onStable.pipe(take(1)).subscribe(() => {
      // this.grid = GridStack.init(
      //   { float: true, cellHeight: 100, column: 12 },
      //   this.gridRef.nativeElement
      // );
      this.grid = GridStack.init(
        { 
          float: true, // Desactivar float para evitar superposiciones
          cellHeight: 100, // Altura de celda optimizada
          column: 12,
          // margin: 0, // Sin margen en GridStack, se maneja con CSS
          resizable: {
            handles: 'e, se, s, sw, w'
          },
          draggable: {
            handle: 'h3' // Solo arrastrar desde el título
          },
          animate: true,
          alwaysShowResizeHandle: false
        },
        this.gridRef.nativeElement
      );
      // Si prefieres, también puedes hacer: this.grid.load(this.widgets);
    });
    this.dataSource.paginator = this.paginator;

    // Suscribirse a cambios de tema después de que el componente esté inicializado
    if (this.themeService && this.themeService.theme$) {
      this.themeService.theme$.pipe(
        takeUntil(this.destroy$)
      ).subscribe((theme) => {
        console.log('=== CAMBIO DE TEMA DETECTADO ===');
        console.log('Nuevo tema desde observable:', theme);
        console.log('isDarkTheme():', this.themeService.isDarkTheme());
        console.log('Clase HTML actual:', document.documentElement.className);
        
        this.updateChartsForTheme();
      });
    } else {
      console.warn('ThemeService no está disponible en DashboardComponent');
    }

  }

  getMonthToday() {
    const month = eachMonthOfInterval({
      start: startOfYear(this.today),
      end: this.today
    });
    this.monthCurrent = month.map(m => format(m, 'MMMM', { locale: es }));
  }

  /**
   * Inicializa los datos del dashboard
   */
  private initializeDashboardData(): void {
    // Suscribirse a los datos del dashboard
    this.dashboardService.dashboardData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data) {
          this.dashboardData = data;
          this.updateChartsWithRealData(data);
          this.updateTableWithRealData(data.recentMachines);
          this.cdr.detectChanges();
        } else {
          console.log('Data is undefined');
        }
      });

    // Suscribirse al estado de carga
    this.dashboardService.isLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLoading = loading;
        this.cdr.detectChanges();
      });

    // Suscribirse a la última actualización
    this.dashboardService.lastUpdate$
      .pipe(takeUntil(this.destroy$))
      .subscribe(lastUpdate => {
        this.lastUpdate = lastUpdate;
        this.cdr.detectChanges();
      });

    // Suscribirse a eventos WebSocket para actualizaciones en tiempo real
    this.webSocketService.dashboardEvents$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        this.handleWebSocketUpdate(event);
      });

    // Inicializar los datos
    this.dashboardService.initializeDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        data => {
          console.log('Dashboard inicializado con datos:', data);
        },
        error => {
          console.error('Error inicializando dashboard:', error);
        }
      );
  }

  /**
   * Actualiza los gráficos con datos reales
   */
  private updateChartsWithRealData(data: DashboardData): void {
    console.log('Updating charts with data:', data);
    
    // Verificar si data.charts existe
    if (!data.charts) {
      console.warn('data.charts is undefined');
      return;
    }

    // Actualizar gráfico de barras (mantenimientos por mes)
    if (data.charts.maintenancesByMonth && data.charts.maintenancesByMonth.length > 0) {
      console.log('Updating maintenance chart with:', data.charts.maintenancesByMonth);
      this.updateMaintenanceChart(data.charts.maintenancesByMonth);
    } else {
      console.warn('maintenancesByMonth is empty or undefined');
    }

    // Actualizar gráfico de dona (estado de máquinas)
    if (data.charts.machineStatus) {
      console.log('Updating machine status chart with:', data.charts.machineStatus);
      this.updateMachineStatusChart(data.charts.machineStatus);
    } else {
      console.warn('machineStatus is undefined');
    }

    // Actualizar gráfico de línea (consumo de repuestos)
    if (data.charts.sparePartsConsumption && data.charts.sparePartsConsumption.length > 0) {
      console.log('Updating spare parts chart with:', data.charts.sparePartsConsumption);
      this.updateSparePartsChart(data.charts.sparePartsConsumption);
    } else {
      console.warn('sparePartsConsumption is empty or undefined');
    }
  }

  /**
   * Actualiza la tabla con datos reales
   */
  private updateTableWithRealData(machines: RecentMachine[]): void {
    // Convertir máquinas a formato de tabla
    const tableData = machines.map(machine => ({
      model: machine.model,
      serialNumber: machine.serialNumber,
      weight: 0, // Placeholder
      client: machine.client,
      expirationDate: this.formatDate(machine.nextMaintenanceDate)
    }));

    this.dataSource.data = tableData as any[];
  }

  /**
   * Formatea una fecha de manera segura
   */
  private formatDate(date: Date | string): string {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('es-ES');
    } catch (error) {
      console.warn('Error formatting date:', date, error);
      return 'Fecha no disponible';
    }
  }

  /**
   * Actualiza el gráfico de mantenimientos por mes
   */
  private updateMaintenanceChart(data: any[]): void {
    const colors = this.getThemeColors();
    
    this.barChartData = {
      labels: data.map(item => item.month),
      datasets: [
        {
          label: 'Preventivos',
          data: data.map(item => item.preventive),
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          borderWidth: 2,
          borderRadius: 8,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
          hoverBackgroundColor: colors.primaryAlt
        },
        {
          label: 'Correctivos',
          data: data.map(item => item.corrective),
          backgroundColor: colors.warning,
          borderColor: colors.warning,
          borderWidth: 2,
          borderRadius: 8,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
          hoverBackgroundColor: colors.accent
        }
      ]
    };
    
    // Actualizar también las opciones del gráfico
    this.barChartOptions = this.getBarChartOptions();
  }

  /**
   * Actualiza el gráfico de estado de máquinas
   */
  private updateMachineStatusChart(data: any): void {
    const colors = this.getThemeColors();
    
    this.doughnutChartData = {
      labels: ['Operación', 'Mantenimiento'],
      datasets: [
        {
          data: [data.operational || 0, data.maintenance || 0, data.offline || 0],
          backgroundColor: [colors.primary, colors.warning, colors.accent],
          borderWidth: 3,
          borderColor: colors.bgSecondary,
          hoverBackgroundColor: [
            colors.primaryAlt,
            colors.accent,
            '#ff6b6b'
          ],
          hoverBorderWidth: 4
        }
      ]
    };
    
    // Actualizar también las opciones del gráfico
    this.doughnutChartOptions = this.getDoughnutChartOptions();
  }

  /**
   * Actualiza el gráfico de consumo de repuestos
   */
  private updateSparePartsChart(data: any[]): void {
    const colors = this.getThemeColors();
    
    this.lineChartData = {
      labels: data.map(item => item.month),
      datasets: [
        {
          label: 'Filtros',
          data: data.map(item => item.filtersUsed),
          borderColor: colors.primary,
          backgroundColor: colors.primary + '20',
          borderWidth: 3,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: colors.primary,
          pointBorderColor: colors.textPrimary,
          pointBorderWidth: 2,
          pointHoverRadius: 7
        },
      ]
    };
    
    // Actualizar también las opciones del gráfico
    this.lineChartOptions = this.getLineChartOptions();
  }

  /**
   * Maneja actualizaciones vía WebSocket
   */
  private handleWebSocketUpdate(event: any): void {
    console.log('Actualización WebSocket recibida:', event);
    
    switch (event.type) {
      case 'dashboard_update':
        // Actualización completa del dashboard
        if (event.data) {
          this.dashboardData = { ...this.dashboardData, ...event.data };
          this.updateChartsWithRealData(this.dashboardData!);
          this.cdr.detectChanges();
        }
        break;
        
      case 'machine_status_update':
        // Actualización de estado de máquina específica
        this.refreshMachineData();
        break;
        
      case 'maintenance_update':
        // Actualización de mantenimiento
        this.refreshMaintenanceData();
        break;
    }
  }

  /**
   * Refresca datos de máquinas
   */
  private refreshMachineData(): void {
    this.dashboardService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        if (this.dashboardData) {
          this.dashboardData.stats = stats;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Refresca datos de mantenimientos
   */
  private refreshMaintenanceData(): void {
    this.dashboardService.getMaintenanceAlerts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(alerts => {
        if (this.dashboardData) {
          this.dashboardData.alerts = alerts;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Refresca manualmente todos los datos
   */
  refreshDashboard(): void {
    this.dashboardService.refreshDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        data => {
          console.log('Dashboard refrescado:', data);
        },
        error => {
          console.error('Error refrescando dashboard:', error);
        }
      );
  }

  // ===== MÉTODOS PARA MANEJAR ALERTAS DE MANTENIMIENTO =====

  /**
   * Obtiene las alertas ordenadas por prioridad (más días vencidos primero)
   */
  getSortedAlerts(): MaintenanceAlert[] {
    if (!this.dashboardData?.alerts) return [];
    
    return [...this.dashboardData.alerts].sort((a, b) => {
      // Primero las que están vencidas (días negativos)
      if (a.daysRemaining < 0 && b.daysRemaining >= 0) return -1;
      if (a.daysRemaining >= 0 && b.daysRemaining < 0) return 1;
      
      // Si ambas están vencidas, ordenar por más días vencidos primero
      if (a.daysRemaining < 0 && b.daysRemaining < 0) {
        return a.daysRemaining - b.daysRemaining; // Más negativo primero
      }
      
      // Si ambas están próximas a vencer, ordenar por menos días restantes primero
      return a.daysRemaining - b.daysRemaining;
    });
  }

  /**
   * Obtiene la clase CSS para el elemento de alerta
   */
  getAlertClass(alert: MaintenanceAlert): string {
    if (alert.daysRemaining < 0) {
      return 'alert-overdue';
    } else if (alert.daysRemaining <= 3) {
      return 'alert-critical';
    } else if (alert.daysRemaining <= 7) {
      return 'alert-warning';
    } else {
      return 'alert-info';
    }
  }

  /**
   * Obtiene el color del icono según la prioridad de la alerta
   */
  getAlertIconColor(alert: MaintenanceAlert): string {
    if (alert.daysRemaining < 0) {
      return '#f44336'; // Rojo para vencidas
    } else if (alert.daysRemaining <= 3) {
      return '#a44a5d'; // Rojo oscuro para críticas
    } else if (alert.daysRemaining <= 7) {
      return '#f0961b'; // Naranja para advertencias
    } else {
      return '#02BEC1'; // Azul para información
    }
  }

  /**
   * Obtiene el icono según el estado de la alerta
   */
  getAlertIcon(alert: MaintenanceAlert): string {
    if (alert.daysRemaining < 0) {
      return 'error'; // Icono de error para vencidas
    } else if (alert.daysRemaining <= 3) {
      return 'warning'; // Icono de advertencia para críticas
    } else if (alert.daysRemaining <= 7) {
      return 'schedule'; // Icono de reloj para próximas
    } else {
      return 'info'; // Icono de información para lejanas
    }
  }

  /**
   * Obtiene el texto descriptivo de la alerta
   */
  getAlertText(alert: MaintenanceAlert): string {
    if (alert.daysRemaining < 0) {
      return 'Vencido hace';
    } else if (alert.daysRemaining === 0) {
      return 'Vence hoy';
    } else if (alert.daysRemaining === 1) {
      return 'Vence mañana';
    } else {
      return 'Vence en';
    }
  }

  /**
   * Obtiene la clase CSS para el span de días
   */
  getAlertSpanClass(alert: MaintenanceAlert): string {
    if (alert.daysRemaining < 0) {
      return 'danger';
    } else if (alert.daysRemaining <= 3) {
      return 'danger';
    } else if (alert.daysRemaining <= 7) {
      return 'warning';
    } else {
      return 'info';
    }
  }

  /**
   * Obtiene el texto de días con el formato correcto
   */
  getAlertDaysText(alert: MaintenanceAlert): string {
    const days = Math.abs(alert.daysRemaining);
    
    if (alert.daysRemaining < 0) {
      return `${days} día${days !== 1 ? 's' : ''}`;
    } else if (alert.daysRemaining === 0) {
      return 'HOY';
    } else if (alert.daysRemaining === 1) {
      return 'MAÑANA';
    } else {
      return `${days} día${days !== 1 ? 's' : ''}`;
    }
  }
}
