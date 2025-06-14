import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';


export interface PeriodicElement {
  model: string;
  serie: number;
  timeUse: number;
  client: string;
  position: number;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { model: '100', serie: 123, timeUse: 1.0079, client: 'jhonatan', position: 1 },
  { model: '200', serie: 123, timeUse: 4.0026, client: 'jhonatan', position: 1 },
  { model: '300', serie: 123, timeUse: 6.941, client: 'jhonatan', position: 1 },
  { model: '400', serie: 123, timeUse: 9.0122, client: 'jhonatan', position: 1 },
  { model: '500', serie: 123, timeUse: 10.811, client: 'jhonatan', position: 1 },
  { model: '600', serie: 123, timeUse: 12.0107, client: 'jhonatan', position: 1 },
  { model: '700', serie: 123, timeUse: 14.0067, client: 'jhonatan', position: 1 },
  { model: '800', serie: 123, timeUse: 15.9994, client: 'jhonatan', position: 1 },
  { model: '900', serie: 123, timeUse: 18.9984, client: 'jhonatan', position: 1 },
  { model: '1000', serie: 123, timeUse: 20.1797, client: 'jhonatan', position: 1 },
  { model: '1100', serie: 123, timeUse: 22.9897, client: 'jhonatan', position: 1 },
  { model: '1200', serie: 123, timeUse: 24.305, client: 'jhonatan', position: 1 },
  { model: '1300', serie: 123, timeUse: 26.9815, client: 'jhonatan', position: 1 },
  { model: '1400', serie: 123, timeUse: 28.0855, client: 'jhonatan', position: 1 },
  { model: '1500', serie: 123, timeUse: 30.9738, client: 'jhonatan', position: 1 },
  { model: '1600', serie: 123, timeUse: 32.065, client: 'jhonatan', position: 1 },
  { model: '1700', serie: 123, timeUse: 35.453, client: 'jhonatan', position: 1 },
  { model: '1800', serie: 123, timeUse: 39.948, client: 'jhonatan', position: 1 },
  { model: '1900', serie: 123, timeUse: 39.0983, client: 'jhonatan', position: 1 },
  { model: '2000', serie: 123, timeUse: 40.078, client: 'jhonatan', position: 1 }
];

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatSidenavModule,
    MatButtonModule,
    NgxChartsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {
  displayedColumns: string[] = ['model', 'serie', 'timeUse', 'client', 'position'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  colorScheme: string = 'vivid';

  showFilterImage = false;

  pieChartData = [
    {
      name: 'Máquinas registradas',
      value: 14
    },
    {
      name: 'Mantenimientos pendientes',
      value: 5
    },
    {
      name: 'Alertas próximas',
      value: 3
    },
    {
      name: 'Mantenimientos realizados',
      value: 10
    },
  ];

  view: [number, number] = [500, 400];

  showLegend = true;
  showLabels = true;

  clicltst(evento: any) {
    console.log(evento);
    this.showFilterImage = evento;
  }
}