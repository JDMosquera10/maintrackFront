import { ChangeDetectionStrategy, AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { GeneralModule } from '../../modules/general.module';
import { MatDialog } from '@angular/material/dialog';
import { Maintenance } from '../../shared/models/maintenance.model';
import { MaintenanceService } from '../../services/maintenance.service';
import { MantinanceComponent } from '../modals/mantinace/mantinance.component';
import { CompleteMaintenanceComponent, CompleteMaintenanceRequest } from '../modals/complete-maintenance/complete-maintenance.component';
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
  displayColunmMaintenance: string[] = ['date', 'type', 'spareParts', 'status', 'acciones'];
  dataSource = new MatTableDataSource<Maintenance>();
  istechenical = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private maintenanceService: MaintenanceService, private authService: AuthService) {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user) {
        if (['coordinator', 'admin'].includes(user?.role || '')) {
          this.maintenanceService.getMaintenancesPending().subscribe((maintenances: Maintenance[]) => {
            this.istechenical = false;
            this.displayColunmMaintenance = ['date', 'type', 'spareParts', 'technicianId', 'status', 'acciones'];
            maintenances.forEach((item: Maintenance) => item.technician = `${item.technicianId?.firstName} ${item.technicianId?.lastName}`)
            this.dataSource.data = maintenances;
            this.dataSource.paginator = this.paginator;
          });
        } else {
          this.maintenanceService.getMaintenancesByTechnicianPending(user?._id || '').subscribe((maintenances: Maintenance[]) => {
            this.dataSource.data = maintenances;
            this.dataSource.paginator = this.paginator;
          });
        }
      }
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

  completeMaintenance(element: Maintenance): void {
    const dialogRef = this.dialog.open(CompleteMaintenanceComponent, {
      data: { maintenance: element },
      width: '600px',
      disableClose: true,
      autoFocus: true,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe((result: CompleteMaintenanceRequest | undefined) => {
      if (result) {
        this.maintenanceService.completeMaintenance(element.id, result.workHours, result.observations).subscribe({
          next: () => {
            // Actualizar el estado del mantenimiento en lugar de eliminarlo
            const index = this.dataSource.data.findIndex(m => m.id === element.id);
            if (index >= 0) {
              this.dataSource.data = this.dataSource.data.filter(machine => machine.id !== element.id);
              this.dataSource._updateChangeSubscription();
            }
          },
          error: (err) => {
            console.error('Error completando mantenimiento:', err);
            // Aquí podrías mostrar un mensaje de error al usuario
          }
        });
      }
    });
  }

  onSearchChange(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = searchValue.trim().toLowerCase();
  }
}
