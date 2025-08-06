import { ChangeDetectionStrategy, AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { GeneralModule } from '../../modules/general.module';
import { MatDialog } from '@angular/material/dialog';
import { MachineComponent } from '../modals/machine/machine.component';
import { MachineService } from '../../services/machine.service';
import { Machine } from '../../shared/models/machine.model';
import { MACHINE_STATUS_TRANSLATIONS } from '../../shared/constants/translation.constants';




@Component({
  selector: 'app-machines',
  standalone: true,
  imports: [GeneralModule],
  templateUrl: './machines.component.html',
  styleUrl: './machines.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MachinesComponent {

  TRADUCERSTATES = MACHINE_STATUS_TRANSLATIONS;
  readonly dialog = inject(MatDialog);
  displayedColumns: string[] = ['model', 'serialNumber', 'status', 'usageHours', 'client', 'location', 'acciones'];
  dataSource = new MatTableDataSource<Machine>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;


  constructor(private machineService: MachineService) {
    this.machineService.getMachines().subscribe((machines: Machine[]) => {
      this.dataSource.data = machines;
      this.dataSource.paginator = this.paginator;
    });
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
      width: '600px',
      height: 'auto',
      disableClose: true,
      autoFocus: true,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (type === 'add' || type === 'errorAdd') {
          this.machineService.createMachine(result).subscribe({
            next: machine => {
              this.dataSource.data.push(machine);
              this.dataSource._updateChangeSubscription();
            },
            error: err => {
              if (err.status === 400) {
                this.actionMachine('errorAdd', result);
              }
            }
          });
        } else if (type === 'edit' && element) {
          this.machineService.updateMachine(result).subscribe({
            next: machine => {
              const index = this.dataSource.data.indexOf(element);
              if (index >= 0) {
                this.dataSource.data[index] = machine;
                this.dataSource._updateChangeSubscription();
              }
            },
            error: err => {
              if (err.status === 400) {
                this.actionMachine('edit', result);
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
    this.machineService.deleteMachine(element.id).subscribe({
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
