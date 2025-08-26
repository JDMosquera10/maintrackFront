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

export interface PeriodicElement {
  model: string;
  serialNumber: number;
  weight: number;
  client: string;
  expirationDate: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { model: 'Hydrogen', serialNumber: 1, weight: 1.0079, client: 'Client A', expirationDate: '2023-12-31' },
  { model: 'Helium', serialNumber: 2, weight: 4.0026, client: 'Client B', expirationDate: '2024-01-15' },
  { model: 'Lithium', serialNumber: 3, weight: 6.941, client: 'Client C', expirationDate: '2024-02-28' },
  { model: 'Beryllium', serialNumber: 4, weight: 9.0122, client: 'Client D', expirationDate: '2024-03-15' },
  { model: 'Boron', serialNumber: 5, weight: 10.811, client: 'Client E', expirationDate: '2024-04-30' },
  { model: 'Carbon', serialNumber: 6, weight: 12.0107, client: 'Client F', expirationDate: '2024-05-15' },
  { model: 'Nitrogen', serialNumber: 7, weight: 14.0067, client: 'Client G', expirationDate: '2024-06-30' },
  { model: 'Oxygen', serialNumber: 8, weight: 15.9994, client: 'Client H', expirationDate: '2024-07-15' },
  { model: 'Fluorine', serialNumber: 9, weight: 18.9984, client: 'Client I', expirationDate: '2024-08-28' },
  { model: 'Neon', serialNumber: 10, weight: 20.1797, client: 'Client J', expirationDate: '2024-09-15' },
];

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
  // private today: Date = new Date();
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


  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, 
    private ngZone: NgZone,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {
    this.getMonthToday();
    this.prepareChartOptions1();
    this.prepareChartOptions2();
    this.prepareChartOptions3();
    this.dataSource.data = ELEMENT_DATA;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.grid?.destroy(false); // evita fugas al navegar
    this.grid = undefined;
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
          this.prepareChartOptions1();
          this.prepareChartOptions2();
          this.prepareChartOptions3();
          this.cdr.detectChanges();
          this.forceChartsUpdate();
        }, 100);
        
        // Segundo intento con delay mayor para asegurar que todo esté actualizado
        setTimeout(() => {
          console.log('Segunda actualización (confirmación)');
          this.prepareChartOptions1();
          this.prepareChartOptions2();
          this.prepareChartOptions3();
          this.cdr.detectChanges();
          this.forceChartsUpdate();
          console.log('Gráficos completamente actualizados');
        }, 300);
      });
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
}
