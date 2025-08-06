import { ChangeDetectionStrategy, AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { GeneralModule } from '../../modules/general.module';
import { MatDialog } from '@angular/material/dialog';
import { Maintenance } from '../../shared/models/maintenance.model';
import { MaintenanceService } from '../../services/maintenance.service';
import { MantinanceComponent } from '../modals/mantinace/mantinance.component';
import { AuthService } from '../../services/auth.service';
import { MAINTENANCE_TYPE_TRANSLATIONS } from '../../shared/constants/translation.constants';

@Component({
  selector: 'app-maintenances',
  imports: [GeneralModule],
  standalone: true,
  templateUrl: './maintenances.component.html',
  styleUrl: './maintenances.component.scss'
})
export class MaintenancesComponent {

  TRADUCERTYPES = MAINTENANCE_TYPE_TRANSLATIONS;

  readonly dialog = inject(MatDialog);
  displayColunmMaintenance: string[] = ['date', 'type', 'spareParts', 'acciones'];
  dataSource = new MatTableDataSource<Maintenance>();
  istechenical = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private maintenanceService: MaintenanceService, private authService: AuthService) {
    this.maintenanceService.getMaintenances().subscribe((maintenances: Maintenance[]) => {
      this.authService.getCurrentRole().subscribe((role) => {
        if (['coordinator', 'admin'].includes(role || '')) {
          this.istechenical = false;
          this.displayColunmMaintenance = ['date', 'type', 'spareParts', 'technicianId', 'acciones'];
        }
      });
      maintenances.forEach((item: Maintenance) => item.technician = `${item.technicianId?.firstName} ${item.technicianId?.lastName}`)
      this.dataSource.data = maintenances;

      this.dataSource.paginator = this.paginator;
    });
  }


  /**
 *  @description Abre un diálogo para agregar una nueva máquina.
 *  Este método utiliza el componente MachineComponent para mostrar un formulario de entrada.
  *  @param type - Indica si se está agregando o editando una máquina.
  *  @returns void
 */
  actionMaintenance(type: 'add' | 'edit' | 'errorAdd', element?: Maintenance): void {
    const dialogRef = this.dialog.open(MantinanceComponent, {
      data: { type, element },
      width: '600px',
      height: '95vh',
      disableClose: true,
      autoFocus: true,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (type === 'add' || type === 'errorAdd') {
          this.maintenanceService.createMaintenance(result).subscribe({
            next: maintenance => {
              maintenance.technician = `${maintenance.technicianId?.firstName} ${maintenance.technicianId?.lastName}`
              this.dataSource.data.push(maintenance);
              this.dataSource._updateChangeSubscription();
            },
            error: err => {
              if (err.status === 400) {
                this.actionMaintenance('errorAdd', result);
              }
            }
          });
        } else if (type === 'edit' && element) {
          this.maintenanceService.updateMaintenance(result).subscribe({
            next: maintenance => {
              const index = this.dataSource.data.indexOf(element);
              if (index >= 0) {
                maintenance.technician = `${maintenance.technicianId?.firstName} ${maintenance.technicianId?.lastName}`
                this.dataSource.data[index] = maintenance;
                this.dataSource._updateChangeSubscription();
              }
            },
            error: err => {
              if (err.status === 400) {
                this.actionMaintenance('edit', result);
              }
            }
          });
        }
      }
    });
  }

  deleteMaintenance(element: Maintenance): void {
    this.maintenanceService.deleteMaintenance(element.id).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter(machine => machine.id !== element.id);
        this.dataSource._updateChangeSubscription();
      }, 
      error: err => {
        if (err.status === 400) {
        }
      }
    });
  }

  onSearchChange(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = searchValue.trim().toLowerCase();
  }
}
