import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject, NgZone, PLATFORM_ID, ViewChild } from '@angular/core';
import { GeneralModule } from '../../modules/general.module';

import { GridStack } from 'gridstack';
import { isPlatformBrowser } from '@angular/common';
import { take } from 'rxjs';
import { eachMonthOfInterval, format, startOfYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
// export interface PeriodicElement {
//   model: string;
//   serie: number;
//   timeUse: number;
//   client: string;
//   position: number;
// }

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('gridRef', { static: true }) gridRef!: ElementRef<HTMLElement>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private grid?: GridStack;
  public today: Date = new Date();
  // private today: Date = new Date();
  protected monthCurrent: string[] = [];
  barChartData: ChartConfiguration<'bar'>['data'] | any;
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#fff',
          font: { size: 12 },
          padding: 20
        },
        position: 'bottom'
      },
      tooltip: {
        backgroundColor: 'rgba(32, 40, 55, 0.9)',
        titleColor: '#02BEC1',
        bodyColor: '#fff',
        borderColor: '#02BEC1',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        ticks: { color: '#fff', font: { size: 11 } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: {
        ticks: { color: '#fff', font: { size: 11 } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    }
  };

  lineChartData: ChartConfiguration<'line'>['data'] | any;
  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#fff',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(32, 40, 55, 0.9)',
        titleColor: '#F0961B',
        bodyColor: '#fff',
        borderColor: '#F0961B',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        ticks: { color: '#fff', font: { size: 11 } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: {
        ticks: { color: '#fff', font: { size: 11 } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    }
  };


  displayedColumns: string[] = ['model', 'serialNumber', 'client', 'expirationDate'];
  dataSource = new MatTableDataSource<PeriodicElement>();


  // --- Máquinas Activas vs Inactivas ---
  doughnutChartData: ChartConfiguration<'doughnut'>['data'] | any;

  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    radius: '70%',
    plugins: {
      legend: {
        labels: {
          color: '#fff',
          font: { size: 12 },
          padding: 15
        },
        position: 'bottom'
      },
      tooltip: {
        backgroundColor: 'rgba(32, 40, 55, 0.9)',
        titleColor: '#02BEC1',
        bodyColor: '#fff',
        borderColor: '#02BEC1',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8
      }
    }
  };


  constructor(@Inject(PLATFORM_ID) private platformId: Object, private ngZone: NgZone) {
    this.getMonthToday();
    this.prepareChartOptions1();
    this.prepareChartOptions2();
    this.prepareChartOptions3();
    this.dataSource.data = ELEMENT_DATA;

  }

  prepareChartOptions1() {
    this.barChartData = {
      labels: this.monthCurrent,
      datasets: [
        {
          label: 'Preventivos',
          data: [5, 6, 5, 7, 4, 9],
          backgroundColor: '#02BEC1',
          borderColor: '#02BEC1',
          borderWidth: 2,
          borderRadius: 8,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
          hoverBackgroundColor: 'rgba(2, 190, 193, 0.8)'
        },
        {
          label: 'Correctivos',
          data: [3, 2, 4, 3, 5, 2],
          backgroundColor: '#F0961B',
          borderColor: '#F0961B',
          borderWidth: 2,
          borderRadius: 8,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
          hoverBackgroundColor: 'rgba(240, 150, 27, 0.8)'
        }
      ]
    }
  }

  prepareChartOptions2() {
    this.doughnutChartData = {
      labels: ['Mantenimiento', 'Operación'],
      datasets: [
        {
          data: [18, 6],
          backgroundColor: ['#02BEC1', '#F0961B'],
          borderWidth: 3,
          borderColor: '#202837',
          hoverBackgroundColor: [
            'rgba(2, 190, 193, 0.8)',
            'rgba(240, 150, 27, 0.8)'
          ],
          hoverBorderWidth: 4
        }
      ]
    }
  }

  prepareChartOptions3() {
    this.lineChartData = {
      labels: this.monthCurrent,
      datasets: [
        {
          label: 'Filtros',
          data: [12, 19, 15, 22, 18, 25],
          borderColor: '#02BEC1',
          backgroundColor: 'rgba(2, 190, 193, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#02BEC1',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 7
        },
      ]
    }
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

  }

  ngOnDestroy(): void {
    this.grid?.destroy(false); // evita fugas al navegar
    this.grid = undefined;
  }

  getMonthToday() {
    const month = eachMonthOfInterval({
      start: startOfYear(this.today),
      end: this.today
    });
    this.monthCurrent = month.map(m => format(m, 'MMMM', { locale: es }));
  }
}
