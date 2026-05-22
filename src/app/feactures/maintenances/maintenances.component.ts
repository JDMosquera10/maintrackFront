import { AfterViewInit, Component, OnDestroy, ViewChild, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { GeneralModule } from '../../modules/general.module';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';
import { MaintenanceService } from '../../services/maintenance.service';
import { ToastService } from '../../services/toast.service';
import { MAINTENANCE_TYPE_TRANSLATIONS } from '../../shared/constants/translation.constants';
import { Maintenance } from '../../shared/models/maintenance.model';
import { ChangeMaintenanceStateComponent } from '../modals/change-maintenance-state/change-maintenance-state.component';
import { CompleteMaintenanceComponent, CompleteMaintenanceRequest } from '../modals/complete-maintenance/complete-maintenance.component';
import { MantinanceComponent } from '../modals/mantinace/mantinance.component';

const LIST_PAGE_SIZE = 500;

@Component({
  selector: 'app-maintenances',
  imports: [GeneralModule],
  standalone: true,
  templateUrl: './maintenances.component.html',
  styleUrl: './maintenances.component.scss'
})
export class MaintenancesComponent implements AfterViewInit, OnDestroy {

  TRADUCERTYPES = MAINTENANCE_TYPE_TRANSLATIONS;

  readonly dialog = inject(MatDialog);
  displayColunmMaintenance: string[] = ['date', 'type', 'currentState', 'spareParts', 'acciones'];
  dataSource = new MatTableDataSource<Maintenance>();
  istechenical = true;
  searchTerm = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();
  private pendingOnly = true;
  private currentTechnicianId?: string;
  private listReady = false;

  constructor(
    private readonly maintenanceService: MaintenanceService,
    private readonly authService: AuthService,
    private readonly loadingService: LoadingService,
    private readonly toastService: ToastService
  ) {
    this.setupSearch();
    this.loadMaintenances();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.search$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((term) => {
          if (!this.listReady) {
            return new Observable<Maintenance[]>((subscriber) => subscriber.complete());
          }
          return this.fetchMaintenances(term.trim());
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (maintenances) => this.applyMaintenances(maintenances, false),
        error: (err) => {
          console.error('Error searching maintenances:', err);
          this.toastService.showError('Error al buscar mantenimientos');
        },
      });
  }

  private loadMaintenances(): void {
    this.loadingService.show('Cargando mantenimientos...');
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (!user) {
          this.loadingService.hide();
          return;
        }

        const isCoordinator = ['coordinator', 'admin'].includes(user?.role || '');
        this.istechenical = !isCoordinator;
        this.pendingOnly = true;
        this.currentTechnicianId = isCoordinator ? undefined : user._id;
        this.displayColunmMaintenance = isCoordinator
          ? ['date', 'type', 'currentState', 'spareParts', 'technicianId', 'acciones']
          : ['date', 'type', 'currentState', 'spareParts', 'acciones'];

        this.listReady = true;
        this.fetchMaintenances('').subscribe({
          next: (maintenances) => this.applyMaintenances(maintenances),
          error: (err) => {
            console.error('Error loading maintenances:', err);
            this.dataSource.data = [];
            this.loadingService.hide();
            this.toastService.showError('Error al cargar los mantenimientos');
          },
        });
      },
      error: () => {
        this.loadingService.hide();
      },
    });
  }

  private fetchMaintenances(searchTerm: string): Observable<Maintenance[]> {
    if (searchTerm) {
      return this.maintenanceService.searchMaintenances(searchTerm, {
        pendingOnly: this.pendingOnly,
        technicianId: this.currentTechnicianId,
      }, 0, LIST_PAGE_SIZE);
    }

    if (this.currentTechnicianId) {
      return this.maintenanceService.getMaintenancesByTechnicianPending(
        this.currentTechnicianId,
        0,
        LIST_PAGE_SIZE
      );
    }

    return this.maintenanceService.getMaintenancesPending(0, LIST_PAGE_SIZE);
  }

  private applyMaintenances(maintenances: Maintenance[], dismissLoading = true): void {
    const items = maintenances ?? [];
    items.forEach((item) => {
      if (item.technicianId && typeof item.technicianId === 'object') {
        item.technician = `${(item.technicianId as any)?.firstName || ''} ${(item.technicianId as any)?.lastName || ''}`.trim();
      }
    });
    this.dataSource.data = items;
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      this.paginator.firstPage();
    }
    if (dismissLoading) {
      this.loadingService.hide();
    }
  }

  /**
 *  @description Abre un diálogo para agregar una nueva máquina.
 *  Este método utiliza el componente MachineComponent para mostrar un formulario de entrada.
  *  @param type - Indica si se está agregando o editando una máquina.
  *  @returns void
 */
  actionMaintenance(type: 'add' | 'edit' | 'errorAdd', element?: Maintenance): void {
    const dialogRef = this.dialog.open(MantinanceComponent, {
      data: { type, element, istechenical: this.istechenical },
      width: '90vw',
      maxWidth: '900px',
      maxHeight: '95vh',
      height: 'auto',
      disableClose: true,
      autoFocus: true,
      panelClass: ['custom-dialog-container', 'maintenance-dialog']
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (type === 'add' || type === 'errorAdd') {
          this.loadingService.show('Creando mantenimiento...');
          this.maintenanceService.createMaintenance(result).subscribe({
            next: maintenance => {
              maintenance.technician = `${maintenance.technicianId?.firstName} ${maintenance.technicianId?.lastName}`
              this.dataSource.data.push(maintenance);
              this.dataSource._updateChangeSubscription();
              this.loadingService.hide();
              this.toastService.showSuccess('Mantenimiento creado exitosamente');
            },
            error: err => {
              this.loadingService.hide();
              if (err.status === 400) {
                this.toastService.showError('Error de validación. Por favor, revise los datos ingresados');
                this.actionMaintenance('errorAdd', result);
              } else {
                this.toastService.showError('Error al crear el mantenimiento');
              }
            }
          });
        } else if (type === 'edit' && element) {
          this.loadingService.show('Actualizando mantenimiento...');
          this.maintenanceService.updateMaintenance(result).subscribe({
            next: maintenance => {
              const index = this.dataSource.data.indexOf(element);
              if (index >= 0) {
                maintenance.technician = `${maintenance.technicianId?.firstName} ${maintenance.technicianId?.lastName}`
                this.dataSource.data[index] = maintenance;
                this.dataSource._updateChangeSubscription();
              }
              this.loadingService.hide();
              this.toastService.showSuccess('Mantenimiento actualizado exitosamente');
            },
            error: err => {
              this.loadingService.hide();
              if (err.status === 400) {
                this.toastService.showError('Error de validación. Por favor, revise los datos ingresados');
                this.actionMaintenance('edit', result);
              } else {
                this.toastService.showError('Error al actualizar el mantenimiento');
              }
            }
          });
        }
      }
    });
  }

  deleteMaintenance(element: Maintenance): void {
    if (!confirm('¿Está seguro de que desea eliminar este mantenimiento?')) {
      return;
    }

    this.loadingService.show('Eliminando mantenimiento...');
    this.maintenanceService.deleteMaintenance(element.id).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter(machine => machine.id !== element.id);
        this.dataSource._updateChangeSubscription();
        this.loadingService.hide();
        this.toastService.showSuccess('Mantenimiento eliminado exitosamente');
      },
      error: err => {
        console.error('Error deleting maintenance:', err);
        this.loadingService.hide();
        this.toastService.showError('Error al eliminar el mantenimiento');
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
        this.loadingService.show('Completando mantenimiento...');
        this.maintenanceService.completeMaintenance(element.id, result.workHours, result.observations).subscribe({
          next: () => {
            const index = this.dataSource.data.findIndex(m => m.id === element.id);
            if (index >= 0) {
              this.dataSource.data = this.dataSource.data.filter(machine => machine.id !== element.id);
              this.dataSource._updateChangeSubscription();
            }
            this.loadingService.hide();
            this.toastService.showSuccess('Mantenimiento completado exitosamente');
          },
          error: (err) => {
            console.error('Error completando mantenimiento:', err);
            this.loadingService.hide();
            this.toastService.showError('Error al completar el mantenimiento');
          }
        });
      }
    });
  }

  changeMaintenanceState(element: Maintenance): void {
    const dialogRef = this.dialog.open(ChangeMaintenanceStateComponent, {
      data: { maintenance: element },
      width: '700px',
      disableClose: true,
      autoFocus: true,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe((result: { stateId: string; observations?: string } | undefined) => {
      if (result) {
        this.loadingService.show('Actualizando estado del mantenimiento...');
        this.maintenanceService.updateMaintenanceState(element.id, result.stateId, result.observations).subscribe({
          next: (updatedMaintenance) => {
            const index = this.dataSource.data.findIndex(m => m.id === element.id);
            if (index >= 0) {
              this.dataSource.data[index] = updatedMaintenance;
              this.dataSource._updateChangeSubscription();
            }
            this.loadingService.hide();
            this.toastService.showSuccess('Estado del mantenimiento actualizado exitosamente');
          },
          error: (err) => {
            console.error('Error updating maintenance state:', err);
            this.loadingService.hide();
            this.toastService.showError('Error al actualizar el estado del mantenimiento');
          }
        });
      }
    });
  }

  onSearchChange(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    this.searchTerm = searchValue;
    this.search$.next(searchValue);
  }
}
