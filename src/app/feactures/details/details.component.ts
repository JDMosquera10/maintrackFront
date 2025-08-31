import { Component, ViewChild, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { GeneralModule } from '../../modules/general.module';
import { MatDialog } from '@angular/material/dialog';
import { Maintenance } from '../../shared/models/maintenance.model';
import { MaintenanceService } from '../../services/maintenance.service';
import { InfoMaintenanceComponent, InfoMaintenanceRequest } from '../modals/info-maintenance/info-maintenance.component';
import { AuthService } from '../../services/auth.service';
import { MAINTENANCE_TYPE_TRANSLATIONS } from '../../shared/constants/translation.constants';

@Component({
  selector: 'app-details',
  imports: [GeneralModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent {

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
          this.maintenanceService.getMaintenances().subscribe((maintenances: Maintenance[]) => {
            this.istechenical = false;
            this.displayColunmMaintenance = ['date', 'type', 'spareParts', 'technicianId', 'status', 'acciones'];
            maintenances.forEach((item: Maintenance) => item.technician = `${item.technicianId?.firstName} ${item.technicianId?.lastName}`)
            this.dataSource.data = maintenances;
            this.dataSource.paginator = this.paginator;
          });
        } else {
          this.maintenanceService.getMaintenancesByTechnician(user?._id || '').subscribe((maintenances: Maintenance[]) => {
            this.dataSource.data = maintenances;
            this.dataSource.paginator = this.paginator;
          });
        }
      }
    });
  }

  completeMaintenance(element: Maintenance): void {
    const dialogRef = this.dialog.open(InfoMaintenanceComponent, {
      data: { maintenance: element },
      width: '600px',
      disableClose: true,
      autoFocus: true,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe((result: InfoMaintenanceRequest | undefined) => {
      if (result) {
      }
    });
  }

onSearchChange(event: Event): void {
  const searchValue = (event.target as HTMLInputElement).value;
  this.dataSource.filter = searchValue.trim().toLowerCase();
}
}
