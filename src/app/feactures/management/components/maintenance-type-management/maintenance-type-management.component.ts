import { Component, ViewChild, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { GeneralModule } from '../../../../modules/general.module';
import { MaintenanceTypeService } from '../../../../services/maintenance-type.service';
import { LoadingService } from '../../../../services/loading.service';
import { ToastService } from '../../../../services/toast.service';
import { MaintenanceType } from '../../../../shared/models/maintenance-type.model';
import { MaintenanceTypeModalComponent } from '../maintenance-type-modal/maintenance-type-modal.component';

@Component({
  selector: 'app-maintenance-type-management',
  standalone: true,
  imports: [GeneralModule],
  templateUrl: './maintenance-type-management.component.html',
  styleUrl: './maintenance-type-management.component.scss'
})
export class MaintenanceTypeManagementComponent {
  readonly dialog = inject(MatDialog);
  displayedColumns: string[] = ['name', 'description', 'isActive', 'acciones'];
  dataSource = new MatTableDataSource<MaintenanceType>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private maintenanceTypeService: MaintenanceTypeService,
    private loadingService: LoadingService,
    private toastService: ToastService
  ) {
    this.loadMaintenanceTypes();
  }

  loadMaintenanceTypes() {
    this.loadingService.show('Cargando tipos de mantenimiento...');
    this.maintenanceTypeService.getMaintenanceTypes().subscribe({
      next: (types) => {
        this.dataSource.data = types;
        this.dataSource.paginator = this.paginator;
        this.loadingService.hide();
      },
      error: (err) => {
        console.error('Error loading maintenance types:', err);
        this.loadingService.hide();
        this.toastService.showError('Error al cargar los tipos de mantenimiento');
      }
    });
  }

  actionMaintenanceType(type: 'add' | 'edit' | 'errorAdd', element?: MaintenanceType): void {
    const dialogRef = this.dialog.open(MaintenanceTypeModalComponent, {
      data: { type, element },
      width: '600px',
      height: 'auto',
      disableClose: true,
      autoFocus: true,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (type === 'add' || type === 'errorAdd') {
          this.loadingService.show('Creando tipo de mantenimiento...');
          this.maintenanceTypeService.createMaintenanceType(result).subscribe({
            next: (maintenanceType) => {
              this.dataSource.data.push(maintenanceType);
              this.dataSource._updateChangeSubscription();
              this.loadingService.hide();
              this.toastService.showSuccess('Tipo de mantenimiento creado exitosamente');
            },
            error: (err) => {
              this.loadingService.hide();
              if (err.status === 400) {
                this.toastService.showError('Error de validación. Por favor, revise los datos ingresados');
                this.actionMaintenanceType('errorAdd', result);
              } else {
                this.toastService.showError('Error al crear el tipo de mantenimiento');
              }
            }
          });
        } else if (type === 'edit' && element) {
          this.loadingService.show('Actualizando tipo de mantenimiento...');
          this.maintenanceTypeService.updateMaintenanceType({ ...result, id: element.id }).subscribe({
            next: (maintenanceType) => {
              const index = this.dataSource.data.findIndex(mt => mt.id === element.id);
              if (index >= 0) {
                this.dataSource.data[index] = maintenanceType;
                this.dataSource._updateChangeSubscription();
              }
              this.loadingService.hide();
              this.toastService.showSuccess('Tipo de mantenimiento actualizado exitosamente');
            },
            error: (err) => {
              this.loadingService.hide();
              if (err.status === 400) {
                this.toastService.showError('Error de validación. Por favor, revise los datos ingresados');
                this.actionMaintenanceType('edit', result);
              } else {
                this.toastService.showError('Error al actualizar el tipo de mantenimiento');
              }
            }
          });
        }
      }
    });
  }

  deleteMaintenanceType(element: MaintenanceType): void {
    if (confirm(`¿Está seguro de eliminar el tipo de mantenimiento "${element.name}"?`)) {
      this.loadingService.show('Eliminando tipo de mantenimiento...');
      this.maintenanceTypeService.deleteMaintenanceType(element.id).subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter(mt => mt.id !== element.id);
          this.dataSource._updateChangeSubscription();
          this.loadingService.hide();
          this.toastService.showSuccess('Tipo de mantenimiento eliminado exitosamente');
        },
        error: (err) => {
          console.error('Error deleting maintenance type:', err);
          this.loadingService.hide();
          this.toastService.showError('Error al eliminar el tipo de mantenimiento');
        }
      });
    }
  }

  onSearchChange(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = searchValue.trim().toLowerCase();
  }
}

