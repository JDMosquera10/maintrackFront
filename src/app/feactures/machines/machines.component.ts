import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, ViewChild, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { GeneralModule } from '../../modules/general.module';
import { LoadingService } from '../../services/loading.service';
import { MachineService } from '../../services/machine.service';
import { ToastService } from '../../services/toast.service';
import { MACHINE_STATUS_TRANSLATIONS } from '../../shared/constants/translation.constants';
import { Customer } from '../../shared/models/customer.model';
import { Machine } from '../../shared/models/machine.model';
import { MachineComponent } from '../modals/machine/machine.component';

const LIST_PAGE_SIZE = 500;

@Component({
  selector: 'app-machines',
  standalone: true,
  imports: [GeneralModule],
  templateUrl: './machines.component.html',
  styleUrl: './machines.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MachinesComponent implements AfterViewInit, OnDestroy {

  TRADUCERSTATES = MACHINE_STATUS_TRANSLATIONS;
  readonly dialog = inject(MatDialog);
  displayedColumns: string[] = ['model', 'serialNumber', 'usageHours', 'customerId', 'location', 'acciones'];
  dataSource = new MatTableDataSource<Machine>();
  searchTerm = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();

  constructor(
    private machineService: MachineService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.setupSearch();
    this.loadMachines();
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
          const trimmed = term.trim();
          const request = trimmed
            ? this.machineService.searchMachines(trimmed, 0, LIST_PAGE_SIZE)
            : this.machineService.getMachines(0, LIST_PAGE_SIZE);
          return request;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (machines) => this.applyMachines(machines, false),
        error: (err) => {
          console.error('Error searching machines:', err);
          this.toastService.showError('Error al buscar máquinas');
          this.cdr.markForCheck();
        },
      });
  }

  private loadMachines(): void {
    this.loadingService.show('Cargando máquinas...');
    this.machineService.getMachines(0, LIST_PAGE_SIZE).subscribe({
      next: (machines) => this.applyMachines(machines),
      error: (err) => {
        console.error('Error loading machines:', err);
        this.loadingService.hide();
        this.toastService.showError('Error al cargar las máquinas');
        this.cdr.markForCheck();
      },
    });
  }

  private applyMachines(machines: Machine[], dismissLoading = true): void {
    this.dataSource.data = machines;
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      this.paginator.firstPage();
    }
    if (dismissLoading) {
      this.loadingService.hide();
    }
    this.cdr.markForCheck();
  }

  /**
 *  @description Abre un diálogo para agregar una nueva máquina.
 *  Este método utiliza el componente MachineComponent para mostrar un formulario de entrada.
  *  @param type - Indica si se está agregando o editando una máquina.
  *  @returns void
 */
  actionMachine(type: 'add' | 'edit' | 'errorAdd', element?: Machine): void {
    const dialogRef = this.dialog.open(MachineComponent, {
      data: { type, element },
      width: '90vw',
      maxWidth: '900px',
      maxHeight: '95vh',
      height: 'auto',
      disableClose: true,
      autoFocus: true,
      panelClass: ['custom-dialog-container', 'machine-dialog']
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (type === 'add' || type === 'errorAdd') {
          this.loadingService.show('Creando máquina...');
          this.machineService.createMachine(result).subscribe({
            next: () => {
              this.loadingService.hide();
              this.refreshListSilently();
              this.toastService.showSuccess('Máquina creada exitosamente');
            },
            error: err => {
              this.loadingService.hide();
              if (err.status === 400) {
                this.toastService.showError('Error de validación. Por favor, revise los datos ingresados');
                this.actionMachine('errorAdd', result);
              } else {
                this.toastService.showError('Error al crear la máquina');
              }
            }
          });
        } else if (type === 'edit' && element) {
          this.loadingService.show('Actualizando máquina...');
          this.machineService.updateMachine(result).subscribe({
            next: () => {
              this.loadingService.hide();
              this.refreshListSilently();
              this.toastService.showSuccess('Máquina actualizada exitosamente');
            },
            error: err => {
              this.loadingService.hide();
              if (err.status === 400) {
                this.toastService.showError('Error de validación. Por favor, revise los datos ingresados');
                this.actionMachine('edit', result);
              } else {
                this.toastService.showError('Error al actualizar la máquina');
              }
            }
          });
        }
      }
    });
  }

  /**
   * @description Elimina un elemento de la tabla.
   * @param element - El elemento a eliminar.
   */
  deleteMachine(element: Machine): void {
    if (!confirm('¿Está seguro de que desea eliminar esta máquina?')) {
      return;
    }

    this.loadingService.show('Eliminando máquina...');
    this.machineService.deleteMachine(element.id).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter(machine => machine.id !== element.id);
        this.dataSource._updateChangeSubscription();
        this.loadingService.hide();
        this.toastService.showSuccess('Máquina eliminada exitosamente');
        this.cdr.markForCheck();
      },
      error: err => {
        console.error('Error deleting machine:', err);
        this.loadingService.hide();
        this.toastService.showError('Error al eliminar la máquina');
      }
    });
  }

  onSearchChange(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    this.searchTerm = searchValue;
    this.search$.next(searchValue);
  }

  private refreshListSilently(): void {
    const request = this.searchTerm.trim()
      ? this.machineService.searchMachines(this.searchTerm.trim(), 0, LIST_PAGE_SIZE)
      : this.machineService.getMachines(0, LIST_PAGE_SIZE);

    request.subscribe({
      next: (machines) => this.applyMachines(machines, false),
      error: (err) => {
        console.error('Error refreshing machines:', err);
        this.cdr.markForCheck();
      },
    });
  }

  nameCustomer(client: Customer | null | undefined): string {
    if (!client) {
      return '-';
    }
    if (typeof client === 'object' && client.name && client.lastName) {
      return `${client.name} ${client.lastName}`;
    }
    return '-';
  }
}
