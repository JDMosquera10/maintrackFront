import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { GeneralModule } from '../../../../modules/general.module';
import { MaintenanceTypeService } from '../../../../services/maintenance-type.service';
import { StateService } from '../../../../services/state.service';
import { TypeMaintenanceStateService } from '../../../../services/type-maintenance-state.service';
import { MaintenanceType } from '../../../../shared/models/maintenance-type.model';
import { State } from '../../../../shared/models/state.model';
import { TypeMaintenanceState } from '../../../../shared/models/type-maintenance-state.model';
import { AddStateToTypeModalComponent } from '../add-state-to-type-modal/add-state-to-type-modal.component';

@Component({
  selector: 'app-type-maintenance-states-management',
  standalone: true,
  imports: [GeneralModule],
  templateUrl: './type-maintenance-states-management.component.html',
  styleUrl: './type-maintenance-states-management.component.scss'
})
export class TypeMaintenanceStatesManagementComponent implements OnInit, OnDestroy {
  @Input() typeMaintenanceId?: string;
  
  private readonly destroy$ = new Subject<void>();
  
  maintenanceTypes: MaintenanceType[] = [];
  selectedType: MaintenanceType | null = null;
  states: State[] = [];
  typeStates: TypeMaintenanceState[] = [];
  isLoading = false;
  isLoadingStates = false;

  constructor(
    private readonly typeMaintenanceStateService: TypeMaintenanceStateService,
    private readonly stateService: StateService,
    private readonly maintenanceTypeService: MaintenanceTypeService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadMaintenanceTypes();
    this.loadAvailableStates();
    
    if (this.typeMaintenanceId) {
      this.selectType(this.typeMaintenanceId);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMaintenanceTypes() {
    this.maintenanceTypeService.getMaintenanceTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (types) => {
          this.maintenanceTypes = types;
          if (this.typeMaintenanceId && !this.selectedType) {
            this.selectType(this.typeMaintenanceId);
          }
        },
        error: (err) => console.error('Error loading types:', err)
      });
  }

  loadAvailableStates() {
    this.isLoadingStates = true;
    this.stateService.getActiveStates()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (states) => {
          this.states = states;
          this.isLoadingStates = false;
        },
        error: (err) => {
          console.error('Error loading states:', err);
          this.isLoadingStates = false;
        }
      });
  }

  selectType(typeId: string) {
    const type = this.maintenanceTypes.find(t => t.id === typeId);
    if (type) {
      this.selectedType = type;
      this.loadTypeStates(typeId);
    }
  }

  loadTypeStates(typeId: string) {
    if (!typeId) {
      return;
    }
    
    this.isLoading = true;
    this.typeStates = [];
    
    this.typeMaintenanceStateService.getStatesByTypeMaintenance(typeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (typeStates) => {
          if (!typeStates || !Array.isArray(typeStates)) {
            this.typeStates = [];
          } else {
            const sorted = [...typeStates].sort((a, b) => (a.order || 0) - (b.order || 0));
            this.typeStates = sorted;
          }
          
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading type states:', err);
          this.typeStates = [];
          this.isLoading = false;
        }
      });
  }

  addStateToType() {
    if (!this.selectedType) {
      alert('Por favor seleccione un tipo de mantenimiento primero');
      return;
    }

    const dialogRef = this.dialog.open(AddStateToTypeModalComponent, {
      data: {
        typeMaintenanceId: this.selectedType.id,
        availableStates: this.states.filter(s => 
          !this.typeStates.some(ts => ts.stateId === s.id)
        ),
        nextOrder: this.typeStates.length + 1
      },
      width: '600px',
      disableClose: true,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.typeMaintenanceStateService.createTypeMaintenanceState({
          typeMaintenanceId: this.selectedType!.id,
          stateId: result.stateId,
          order: result.order,
          isActive: true
        }).subscribe({
          next: () => {
            this.loadTypeStates(this.selectedType!.id);
          },
          error: (err) => {
            console.error('Error adding state:', err);
            alert('Error al agregar el estado');
          }
        });
      }
    });
  }

  removeStateFromType(typeState: TypeMaintenanceState) {
    if (!confirm(`¿Está seguro de eliminar el estado "${typeState.state?.name}" de este tipo?`)) {
      return;
    }

    this.typeMaintenanceStateService.deleteTypeMaintenanceState(typeState.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadTypeStates(this.selectedType!.id);
        },
        error: (err) => {
          console.error('Error removing state:', err);
          alert('Error al eliminar el estado');
        }
      });
  }

  moveStateUp(index: number) {
    if (index === 0) return;
    
    const current = this.typeStates[index];
    const previous = this.typeStates[index - 1];
    
    // Intercambiar órdenes
    this.typeMaintenanceStateService.updateOrder(
      this.selectedType!.id,
      current.stateId,
      previous.order
    ).subscribe({
      next: () => {
        this.typeMaintenanceStateService.updateOrder(
          this.selectedType!.id,
          previous.stateId,
          current.order
        ).subscribe({
          next: () => {
            this.loadTypeStates(this.selectedType!.id);
          }
        });
      }
    });
  }

  moveStateDown(index: number) {
    if (index === this.typeStates.length - 1) return;
    
    const current = this.typeStates[index];
    const next = this.typeStates[index + 1];
    
    // Intercambiar órdenes
    this.typeMaintenanceStateService.updateOrder(
      this.selectedType!.id,
      current.stateId,
      next.order
    ).subscribe({
      next: () => {
        this.typeMaintenanceStateService.updateOrder(
          this.selectedType!.id,
          next.stateId,
          current.order
        ).subscribe({
          next: () => {
            this.loadTypeStates(this.selectedType!.id);
          }
        });
      }
    });
  }

  getStateName(stateId: string): string {
    const state = this.states.find(s => s.id === stateId);
    return state ? state.name : 'Desconocido';
  }
}

