import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { format } from 'date-fns';
import { Subject, takeUntil } from 'rxjs';
import { GeneralModule } from '../../../modules/general.module';
import { AuthService } from '../../../services/auth.service';
import { MachineService } from '../../../services/machine.service';
import { MaintenanceTypeService } from '../../../services/maintenance-type.service';
import { TypeMaintenanceStateService } from '../../../services/type-maintenance-state.service';
import { UserService } from '../../../services/user.service';
import { MAINTENANCE_TYPE_TRANSLATIONS } from '../../../shared/constants/translation.constants';
import { Machine } from '../../../shared/models/machine.model';
import { MaintenanceType } from '../../../shared/models/maintenance-type.model';
import { CreateMaintenanceRequest, Technician } from '../../../shared/models/maintenance.model';


@Component({
  selector: 'app-mantinance',
  imports: [GeneralModule],
  providers: [provideNativeDateAdapter()],
  templateUrl: './mantinance.component.html',
  styleUrl: './mantinance.component.scss'
})
export class MantinanceComponent implements OnInit, OnDestroy {
  TRADUCERTYPES = MAINTENANCE_TYPE_TRANSLATIONS;
  protected stepForm: FormGroup;
  protected machines: Machine[] = [];
  protected technicals: Technician[] = [];
  protected maintenanceTypes: MaintenanceType[] = [];
  private currentStep = 0;
  protected isLoadingMachines: boolean = true;
  protected isLoadingUsers: boolean = true;
  protected isLoadingTypes: boolean = true;
  protected isLoadingFirstState: boolean = false;
  protected currentStateId: string | null = null;
  protected newSparePartInput: string = '';
  private destroy$ = new Subject<void>();
  readonly serializedDate = new FormControl(new Date().toISOString());
  protected isObservations = true;

  constructor(
    private fb: FormBuilder,
    private machineService: MachineService,
    private authService: AuthService,
    private userService: UserService,
    private maintenanceTypeService: MaintenanceTypeService,
    private typeMaintenanceStateService: TypeMaintenanceStateService,
    private dialogRef: MatDialogRef<MantinanceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    const isTechnician = this.data?.istechenical === true;
    
    this.stepForm = this.fb.group({
      datos: this.fb.group({
        id: [null],
        machine: [null, Validators.required],
        date: [null, Validators.required],
        type: [null, Validators.required],
        technician: [null, isTechnician ? null : Validators.required],
        observations: [''],
        workHours: [null, [Validators.min(0)]]
      }),
      repuestos: this.fb.group({
        spareParts: this.fb.array([])
      })
    });

    if (this.data.type === 'edit' || this.data.type === 'errorAdd') {
      this.currentStep = 2;
      const typeId = this.data.element.typeId?.id || this.data.element.typeId || this.data.element.type?._id || this.data.element.type;
      const currentStateId = this.data.element.currentStateId?.id || this.data.element.currentStateId?._id || this.data.element.currentStateId;
      
      this.stepForm.patchValue({
        datos: {
          id: this.data.element._id || this.data.element.id || null,
          machine: this.data.element.machineId?._id || this.data.element.machineId?.id || this.data.element.machineId || null,
          date: this.data.element.date,
          type: typeId, // Usar ID del tipo
          technician: this.data.element.technicianId?._id || this.data.element.technicianId?.id || this.data.element.technicianId || null,
          observations: this.data.element.observations || null,
          workHours: this.data.element.workHours,
        }
      });
      
      // Establecer el estado actual si existe
      if (currentStateId) {
        this.currentStateId = currentStateId;
      }
      
      // Cargar repuestos
      if (this.data.element.spareParts && Array.isArray(this.data.element.spareParts)) {
        this.data.element.spareParts.forEach((part: string) => {
          if (part) {
            this.spareParts.push(this.fb.control(part));
          }
        });
      }
    }
    this.authService.getCurrentUser().subscribe((user: any) => {
      if (this.data.type === 'add' && isTechnician && user?._id) {
        // Si es técnico, establecer su ID automáticamente
        this.datosForm.get('technician')?.setValue(user._id);
        // Eliminar el validador requerido ya que el valor está establecido
        this.datosForm.get('technician')?.clearValidators();
        this.datosForm.get('technician')?.updateValueAndValidity();
        // Forzar validación del formulario completo
        this.datosForm.updateValueAndValidity();
      }
    });
    this.loadMachines();
    this.loadUsers();
    this.loadMaintenanceTypes();
  }

  ngOnInit(): void {
    // Suscribirse a cambios en el tipo de mantenimiento para obtener el primer estado
    this.datosForm.get('type')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((typeId: string) => {
        if (typeId) {
          this.loadFirstStateForTypeId(typeId);
        } else {
          this.currentStateId = null;
        }
      });

    // Si estamos editando, cargar el estado inicial del tipo seleccionado
    if (this.data.type === 'edit' || this.data.type === 'errorAdd') {
      const typeId = this.data.element.typeId?.id || this.data.element.typeId || this.data.element.type;
      if (typeId) {
        setTimeout(() => {
          this.loadFirstStateForTypeId(typeId);
        }, 500);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga el primer estado del tipo de mantenimiento seleccionado por ID
   */
  loadFirstStateForTypeId(typeId: string) {
    if (!typeId) {
      this.currentStateId = null;
      return;
    }

    this.isLoadingFirstState = true;
    this.typeMaintenanceStateService.getStatesByTypeMaintenance(typeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (typeStates) => {
          // Obtener el primer estado ordenado
          const sortedStates = typeStates
            .filter(ts => ts.isActive)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          
          if (sortedStates.length > 0 && sortedStates[0].stateId) {
            this.currentStateId = sortedStates[0].stateId;
          } else {
            this.currentStateId = null;
            console.warn('No se encontró un estado inicial para el tipo ID:', typeId);
          }
          this.isLoadingFirstState = false;
          // Forzar validación del formulario después de cargar el estado
          this.datosForm.updateValueAndValidity();
        },
        error: (err) => {
          console.error('Error loading first state:', err);
          this.currentStateId = null;
          this.isLoadingFirstState = false;
        }
      });
  }


  loadMachines() {
    this.machineService.getMachines().subscribe({
      next: (machines) => {
        this.machines = machines;
        this.isLoadingMachines = false;
      },
      error: () => {
        this.isLoadingMachines = false;
      }
    });
  }

  loadUsers() {
    this.userService.getUsersList().subscribe({
      next: (technicals) => {
        this.technicals = technicals;
        this.isLoadingUsers = false;
      },
      error: () => {
        this.isLoadingUsers = false;
      }
    });
  }

  loadMaintenanceTypes() {
    this.maintenanceTypeService.getActiveMaintenanceTypes().subscribe({
      next: (types) => {
        this.maintenanceTypes = types;
        this.isLoadingTypes = false;
      },
      error: () => {
        // Si falla, usar tipos por defecto
        this.isLoadingTypes = false;
      }
    });
  }

  get datosForm() {
    return this.stepForm.get('datos') as FormGroup;
  }

  /**
   * Verifica si el formulario de datos es válido, considerando el rol del usuario
   */
  isDatosFormValid(): boolean {
    const form = this.datosForm;
    if (!form) return false;
    
    // Si es técnico, verificar que technician tenga valor aunque no tenga validador
    const isTechnician = this.data?.istechenical === true;
    if (isTechnician) {
      const technicianValue = form.get('technician')?.value;
      if (!technicianValue) {
        return false;
      }
    }
    
    return form.valid;
  }

  get repuestosForm() {
    return this.stepForm.get('repuestos') as FormGroup;
  }

  get spareParts(): FormArray {
    return this.repuestosForm.get('spareParts') as FormArray;
  }

  addSparePart(part?: string) {
    const partToAdd = part || this.newSparePartInput?.trim();
    if (partToAdd && partToAdd.length > 0) {
      // Verificar que no esté duplicado
      const exists = this.spareParts.controls.some(control => 
        control.value?.toLowerCase() === partToAdd.toLowerCase()
      );
      
      if (!exists) {
        this.spareParts.push(this.fb.control(partToAdd));
        this.newSparePartInput = ''; // Limpiar el input
      }
    }
  }


  removeSparePart(index: number) {
    this.spareParts.removeAt(index);
  }

  submit() {
    if (this.stepForm.valid) {
      if (this.currentStep === 2) {
        const datos = this.datosForm.value;
        const repuestos = this.repuestosForm.value;
        
        // El tipo ya viene como ID desde el select
        const typeId = datos.type;
        const selectedType = this.maintenanceTypes.find(t => t.id === typeId);
        
        // Validar que tenemos un estado inicial para nuevos mantenimientos
        if (!this.currentStateId && this.data.type === 'add') {
          alert('Error: No se pudo obtener el estado inicial del tipo de mantenimiento. Por favor, intente nuevamente.');
          return;
        }
        
        const maintenance: CreateMaintenanceRequest = {
          id: datos.id,
          machineId: datos.machine,
          date: datos.date,
          type: selectedType?.name || '', // Mantener nombre para compatibilidad
          typeId: typeId, // ID del tipo
          currentStateId: this.currentStateId || undefined, // Estado inicial requerido
          technicianId: datos.technician,
          observations: datos.observations || '',
          workHours: datos.workHours || 0,
          spareParts: repuestos.spareParts || []
        };
        
        this.dialogRef.close(maintenance);
      } else {
        this.currentStep += 1;
      }
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  getMachineModelById(id: string): string {
    const machine = this.machines.find(m => m.id === id);
    return machine ? machine.model : '-';
  }

  changeStepper(event: any) {
    this.currentStep = event;
  }

  fromatDate(date: string) {
    return format(date, "do 'de' MMMM yyyy")
  }

  getNameTechnician(idUser: string) {
    const user = this.technicals.find(item => item._id === idUser);
    return user ? `${user.firstName} ${user.lastName}` : 'Sin técnico';
  }

  getMaintenanceTypeName(typeId: string): string {
    if (!typeId) return '-';
    const type = this.maintenanceTypes.find(t => t.id === typeId);
    return type ? type.name : typeId;
  }
}
