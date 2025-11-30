import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { GeneralModule } from '../../../modules/general.module';
import { Maintenance } from '../../../shared/models/maintenance.model';
import { TypeMaintenanceStateService } from '../../../services/type-maintenance-state.service';
import { TypeMaintenanceState } from '../../../shared/models/type-maintenance-state.model';

@Component({
  selector: 'app-change-maintenance-state',
  standalone: true,
  imports: [GeneralModule],
  templateUrl: './change-maintenance-state.component.html',
  styleUrl: './change-maintenance-state.component.scss'
})
export class ChangeMaintenanceStateComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  stateForm: FormGroup;
  availableStates: TypeMaintenanceState[] = [];
  currentStateId?: string;
  isLoading = true;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ChangeMaintenanceStateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { maintenance: Maintenance },
    private typeMaintenanceStateService: TypeMaintenanceStateService
  ) {
    this.stateForm = this.fb.group({
      stateId: ['', Validators.required],
      observations: ['']
    });
    
    this.currentStateId = data.maintenance.currentStateId;
  }

  ngOnInit() {
    // Obtener los estados disponibles para este tipo de mantenimiento
    if (this.data.maintenance.typeId) {
      this.loadAvailableStates(this.data.maintenance.typeId);
    } else {
      this.isLoading = false;
    }
    
    // Establecer el estado actual si existe
    if (this.currentStateId) {
      this.stateForm.patchValue({ stateId: this.currentStateId });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAvailableStates(typeId: string) {
    this.isLoading = true;
    this.typeMaintenanceStateService.getStatesByTypeMaintenance(typeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (states) => {
          // Filtrar solo estados activos y ordenar por order
          this.availableStates = states
            .filter(s => s.isActive)
            .sort((a, b) => a.order - b.order);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading states:', err);
          this.isLoading = false;
        }
      });
  }

  submit() {
    if (this.stateForm.valid) {
      const formValue = this.stateForm.value;
      this.dialogRef.close({
        stateId: formValue.stateId,
        observations: formValue.observations || ''
      });
    } else {
      this.stateForm.markAllAsTouched();
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  isCurrentState(stateId: string): boolean {
    return stateId === this.currentStateId;
  }

  canMoveToState(state: TypeMaintenanceState): boolean {
    if (!this.currentStateId) return true; // Si no hay estado actual, puede moverse a cualquier estado
    
    const currentState = this.availableStates.find(s => s.stateId === this.currentStateId);
    if (!currentState) return true;
    
    // Puede moverse al estado actual o a estados posteriores en el orden
    return state.order >= currentState.order;
  }

  getCurrentStateName(): string {
    if (!this.currentStateId) return 'Sin estado';
    const state = this.availableStates.find(s => s.stateId === this.currentStateId);
    return state?.state?.name || 'Desconocido';
  }

  getStateOrder(stateId: string): number {
    const state = this.availableStates.find(s => s.stateId === stateId);
    return state?.order || 0;
  }
}

