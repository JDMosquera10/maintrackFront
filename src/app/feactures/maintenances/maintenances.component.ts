import { ChangeDetectionStrategy, AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { GeneralModule } from '../../modules/general.module';
import { MatDialog } from '@angular/material/dialog';
import { MachineComponent } from '../modals/machine/machine.component';

export interface MaintenanceElement {
  id: string;
  date: string;
  type: string;
  tools: string;
}

export interface MachineMElement {
  id: string;
  model: string;
  serie: number;
  timeUse: number;
  client: string;
  location: number;
}


const ELEMENT_DATA: MachineMElement[] = [
  { id: '32424efwef', model: '100', serie: 123, timeUse: 1.0079, client: 'jhonatan', location: 1 },
  { id: '32424efwef', model: '200', serie: 123, timeUse: 4.0026, client: 'jhonatan', location: 1 },
  { id: '32424efwef', model: '300', serie: 123, timeUse: 6.941, client: 'jhonatan', location: 1 },
  { id: '32424efwef', model: '400', serie: 123, timeUse: 9.0122, client: 'jhonatan', location: 1 },
  { id: '32424efwef', model: '500', serie: 123, timeUse: 10.811, client: 'jhonatan', location: 1 },
  { id: '32424efwef', model: '600', serie: 123, timeUse: 12.0107, client: 'jhonatan', location: 1 },
  { id: '32424efwef', model: '700', serie: 123, timeUse: 14.0067, client: 'jhonatan', location: 1 },
  { id: '32424efwef', model: '800', serie: 123, timeUse: 15.9994, client: 'jhonatan', location: 1 },
  { id: '32424efwef', model: '900', serie: 123, timeUse: 18.9984, client: 'jhonatan', location: 1 },
  { id: '32424efwef', model: '1000', serie: 123, timeUse: 20.1797, client: 'jhonatan', location: 1 },
  { id: '32424efwef', model: '1100', serie: 123, timeUse: 22.9897, client: 'jhonatan', location: 1 },
  { id: '32424efwef', model: '1200', serie: 123, timeUse: 24.305, client: 'jhonatan', location: 1 },
  { id: '32424efwef', model: '1300', serie: 123, timeUse: 26.9815, client: 'jhonatan', location: 1 },
  { id: '32424efwef', model: '1400', serie: 123, timeUse: 28.0855, client: 'jhonatan', location: 1 },
  { id: '32424efwef', model: '1500', serie: 123, timeUse: 30.9738, client: 'jhonatan', location: 1 },
  { id: '32424efwef', model: '1600', serie: 123, timeUse: 32.065, client: 'jhonatan', location: 1 },
  { id: '32424efwef', model: '1700', serie: 123, timeUse: 35.453, client: 'jhonatan', location: 1 },
  { id: '32424efwef', model: '1800', serie: 123, timeUse: 39.948, client: 'jhonatan', location: 1 },
  { id: '32424efwef', model: '1900', serie: 123, timeUse: 39.0983, client: 'jhonatan', location: 1 },
  { id: '32424efwef', model: '2000', serie: 123, timeUse: 40.078, client: 'jhonatan', location: 1 }
];

const ELEMENT_DATAM: MaintenanceElement[] = [
  { id: '32424efwef', date: '100', type: '123', tools: '1.0079, 45324, 32423' },
  { id: '32424efwef', date: '200', type: '123', tools: '4.0026, 45324, 32423' },
  { id: '32424efwef', date: '300', type: '123', tools: '6.941, 45324, 32423' },
  { id: '32424efwef', date: '400', type: '123', tools: '9.0122, 45324, 32423' },
  { id: '32424efwef', date: '500', type: '123', tools: '10.811, 45324, 32423' },
  { id: '32424efwef', date: '600', type: '123', tools: '12.0107, 45324, 32423' },
  { id: '32424efwef', date: '700', type: '123', tools: '14.0067, 45324, 32423' },
  { id: '32424efwef', date: '800', type: '123', tools: '15.9994, 45324, 32423' },
  { id: '32424efwef', date: '900', type: '123', tools: '18.9984, 45324, 32423' },
  { id: '32424efwef', date: '1000',type: '123', tools: '20.1797, 45324, 32423' },
  { id: '32424efwef', date: '1100',type: '123', tools: '22.9897, 45324, 32423' },
  { id: '32424efwef', date: '1200',type: '123', tools: '24.305, 45324, 32423' },
  { id: '32424efwef', date: '1300',type: '123', tools: '26.9815, 45324, 32423' },
  { id: '32424efwef', date: '1400',type: '123', tools: '28.0855, 45324, 32423' },
  { id: '32424efwef', date: '1500',type: '123', tools: '30.9738, 45324, 32423' },
  { id: '32424efwef', date: '1600',type: '123', tools: '32.065, 45324, 32423' },
  { id: '32424efwef', date: '1700',type: '123', tools: '35.453, 45324, 32423' },
  { id: '32424efwef', date: '1800',type: '123', tools: '39.948, 45324, 32423' },
  { id: '32424efwef', date: '1900',type: '123', tools: '39.0983, 45324, 32423' },
  { id: '32424efwef', date: '2000',type: '123', tools: '40.078, 45324, 32423' }
];

@Component({
  selector: 'app-maintenances',
  imports: [GeneralModule],
  templateUrl: './maintenances.component.html',
  styleUrl: './maintenances.component.scss'
})
export class MaintenancesComponent implements AfterViewInit {

  readonly dialog = inject(MatDialog);
  displayColunmMachines: string[] = ['model', 'serie', 'timeUse'];
  displayColunmMaintenance: string[] = ['date', 'type', 'tools'];
  dataSourceMachine = new MatTableDataSource<MachineMElement>(ELEMENT_DATA);
  dataSourceMaintenance = new MatTableDataSource<MaintenanceElement>(ELEMENT_DATAM);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSourceMachine.paginator = this.paginator;
      this.dataSourceMaintenance.paginator = this.paginator;
    }
  }

  actionMaintenance(type: string, element?: MaintenanceElement) {
    const dialogRef = this.dialog.open(MachineComponent, {
      data: { type, element },
      width: '600px',
      height: 'auto',
      disableClose: true,
      autoFocus: true,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (type === 'add') {
          this.dataSourceMaintenance.data.push(result);
        } else if (type === 'edit' && element) {
          const index = this.dataSourceMaintenance.data.indexOf(element);
          if (index >= 0) {
            this.dataSourceMaintenance.data[index] = result;
          }
        }
        this.dataSourceMaintenance._updateChangeSubscription();
      }
    });
  }

  deleteMaintenance(element: MaintenanceElement): void {
    const index = this.dataSourceMaintenance.data.indexOf(element);
    if (index >= 0) {
      this.dataSourceMaintenance.data.splice(index, 1);
      this.dataSourceMaintenance._updateChangeSubscription(); // Update the data source
    }
  }
}
