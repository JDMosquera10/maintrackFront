import { ChangeDetectionStrategy, AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { GeneralModule } from '../../modules/general.module';
import { MatDialog } from '@angular/material/dialog';
import { MachineComponent } from '../modals/machine/machine.component';
import { MachineService } from '../../services/machine.service';
import { Machine } from '../../shared/models/machine.model';




@Component({
  selector: 'app-machines',
  standalone: true,
  imports: [GeneralModule],
  templateUrl: './machines.component.html',
  styleUrl: './machines.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MachinesComponent implements AfterViewInit {

  TRADUCERSTATES: { [key: string]: string } = {
    operational: 'Operativo',
    maintenance: 'En mantenimiento',
    out_of_service: 'Fuera de servicio'
  };
  readonly dialog = inject(MatDialog);
  displayedColumns: string[] = ['model', 'serialNumber', 'status', 'usageHours', 'client', 'location', 'acciones'];
  dataSource = new MatTableDataSource<Machine>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;


  constructor(private machineService: MachineService) {
    this.machineService.getMachines().subscribe((machines: Machine[]) => {
      this.dataSource.data = machines;
    });
  }


  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  /**
 *  @description Abre un diálogo para agregar una nueva máquina.
 *  Este método utiliza el componente MachineComponent para mostrar un formulario de entrada.
  *  @param type - Indica si se está agregando o editando una máquina.
  *  @returns void
 */
  actionMachine(type: 'add' | 'edit', element?: Machine): void {
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
          this.dataSource.data.push(result);
        } else if (type === 'edit' && element) {
          const index = this.dataSource.data.indexOf(element);
          if (index >= 0) {
            this.dataSource.data[index] = result;
          }
        }
        this.dataSource._updateChangeSubscription();
      }
    });
  }

  /**
   * @description Elimina un elemento de la tabla.
   * @param element - El elemento a eliminar.
   */
  deleteMachine(element: Machine): void {
    const index = this.dataSource.data.indexOf(element);
    if (index >= 0) {
      this.dataSource.data.splice(index, 1);
      this.dataSource._updateChangeSubscription(); // Update the data source
    }
  }
}
