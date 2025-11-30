import { Component, ViewChild, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { GeneralModule } from '../../../../modules/general.module';
import { StateService } from '../../../../services/state.service';
import { State } from '../../../../shared/models/state.model';
import { StateModalComponent } from '../state-modal/state-modal.component';

@Component({
  selector: 'app-state-management',
  standalone: true,
  imports: [GeneralModule],
  templateUrl: './state-management.component.html',
  styleUrl: './state-management.component.scss'
})
export class StateManagementComponent {
  readonly dialog = inject(MatDialog);
  displayedColumns: string[] = ['name', 'description', 'isActive', 'acciones'];
  dataSource = new MatTableDataSource<State>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private stateService: StateService) {
    this.loadStates();
  }

  loadStates() {
    this.stateService.getStates().subscribe({
      next: (states) => {
        this.dataSource.data = states;
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        console.error('Error loading states:', err);
      }
    });
  }

  actionState(type: 'add' | 'edit' | 'errorAdd', element?: State): void {
    const dialogRef = this.dialog.open(StateModalComponent, {
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
          this.stateService.createState(result).subscribe({
            next: (state) => {
              this.dataSource.data.push(state);
              this.dataSource._updateChangeSubscription();
            },
            error: (err) => {
              if (err.status === 400) {
                this.actionState('errorAdd', result);
              }
            }
          });
        } else if (type === 'edit' && element) {
          this.stateService.updateState({ ...result, id: element.id }).subscribe({
            next: (state) => {
              const index = this.dataSource.data.findIndex(s => s.id === element.id);
              if (index >= 0) {
                this.dataSource.data[index] = state;
                this.dataSource._updateChangeSubscription();
              }
            },
            error: (err) => {
              if (err.status === 400) {
                this.actionState('edit', result);
              }
            }
          });
        }
      }
    });
  }

  deleteState(element: State): void {
    if (confirm(`¿Está seguro de eliminar el estado "${element.name}"?`)) {
      this.stateService.deleteState(element.id).subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter(s => s.id !== element.id);
          this.dataSource._updateChangeSubscription();
        },
        error: (err) => {
          console.error('Error deleting state:', err);
        }
      });
    }
  }

  onSearchChange(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = searchValue.trim().toLowerCase();
  }
}

