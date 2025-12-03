import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Subject, takeUntil } from 'rxjs';
import { GeneralModule } from '../../../modules/general.module';
import { CustomerService } from '../../../services/customer.service';
import { LoadingService } from '../../../services/loading.service';
import { ToastService } from '../../../services/toast.service';
import { Customer } from '../../../shared/models/customer.model';

/**
 * Validador personalizado para formato de email
 */
function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || control.value === '') {
      return null; // Si está vacío, no validar (es opcional)
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailPattern.test(control.value);
    return isValid ? null : { invalidEmail: true };
  };
}

/**
 * Validador personalizado para número de celular colombiano
 * Debe empezar con 3, tener mínimo 7 dígitos y máximo 10
 */
function cellphoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || control.value === '') {
      return null; // Si está vacío, no validar (es opcional)
    }
    const value = control.value.toString().trim();
    // Debe empezar con 3 y tener entre 7 y 10 dígitos
    const cellphonePattern = /^3\d{6,9}$/;
    const isValid = cellphonePattern.test(value);
    return isValid ? null : { invalidCellphone: true };
  };
}

/**
 *  @description Componente para gestionar el formulario de máquinas.
 *  Permite crear o editar una máquina a través de un diálogo modal con stepper.
 */
@Component({
  selector: 'app-machine',
  imports: [GeneralModule, FormsModule, CommonModule],
  templateUrl: './machine.component.html',
  styleUrl: './machine.component.scss'
})
export class MachineComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;
  protected stepForm: FormGroup;
  protected currentStep = 0;
  private destroy$ = new Subject<void>();
  protected createdCustomer: Customer | null = null;
  protected isLoadingCustomer = false;
  protected customerSearchMode: 'search' | 'create' = 'search';
  protected searchIdentificationNumber = '';
  protected isSearching = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MachineComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private customerService: CustomerService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.stepForm = this.fb.group({
      cliente: this.fb.group({
        customerId: [null, Validators.required],
        // Campos para crear nuevo cliente
        identificationNumber: ['', [Validators.required, Validators.pattern(/^\d+$/), Validators.maxLength(20)]],
        name: ['', [Validators.required, Validators.maxLength(100)]],
        lastName: ['', [Validators.required, Validators.maxLength(100)]],
        cellphoneNumber: ['', cellphoneValidator()],
        email: ['', emailValidator()],
        address: ['', Validators.maxLength(200)]
      }),
      datos: this.fb.group({
        id: [null],
        model: ['', Validators.required],
        serialNumber: ['', Validators.required],
        usageHours: [null, [Validators.required, Validators.min(0)]],
        location: ['', Validators.required]
      })
    });

    if (this.data.type === 'edit' || this.data.type === 'errorAdd') {
      // Si está editando, ir directamente al paso 2
      this.currentStep = 1;
      const element = this.data.element;
      this.stepForm.patchValue({
        datos: {
          id: element.id || element._id || null,
          model: element.model || '',
          serialNumber: element.serialNumber || '',
          usageHours: element.usageHours || null,
          location: element.location || ''
        }
      });
      // Si hay cliente existente, establecerlo
      // El JSON puede venir con customerId como objeto completo o como ID
      let customerId: string | null = null;
      let customer: Customer | null = null;

      if (element.customerId) {
        // Si customerId es un objeto completo con la información del cliente
        if (typeof element.customerId === 'object' && element.customerId !== null && element.customerId._id) {
          customer = element.customerId as Customer;
          customerId = customer._id;
        } else if (typeof element.customerId === 'string') {
          // Si customerId es solo un string (ID)
          customerId = element.customerId;
        }
      } else if (element.clientId || element.client?._id) {
        // Compatibilidad con nombres antiguos
        customerId = element.clientId || element.client?._id;
        customer = element.client || null;
      }

      if (customerId) {
        this.clienteForm.patchValue({
          customerId: customerId
        });
        
        // Si ya tenemos el objeto completo del cliente, usarlo directamente
        if (customer) {
          this.createdCustomer = customer;
          this.searchIdentificationNumber = customer.identificationNumber;
        }
      }
    }
  }

  ngOnInit(): void {
    // Si está editando y ya tiene cliente, buscar información del cliente solo si no la tenemos
    if (this.data.type === 'edit' || this.data.type === 'errorAdd') {
      const customerId = this.clienteForm.get('customerId')?.value;
      // Solo cargar el cliente si tenemos el ID pero no tenemos el objeto completo
      if (customerId && !this.createdCustomer) {
        this.loadCustomerById(customerId);
      }
      // Si ya tenemos el cliente, asegurarnos de que el modo de búsqueda muestre la información
      if (this.createdCustomer) {
        this.customerSearchMode = 'search';
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get clienteForm(): FormGroup {
    return this.stepForm.get('cliente') as FormGroup;
  }

  get datosForm(): FormGroup {
    return this.stepForm.get('datos') as FormGroup;
  }

  /**
   * Busca un cliente por número de identificación
   */
  searchCustomer(): void {
    if (!this.searchIdentificationNumber.trim()) {
      this.toastService.showWarning('Por favor ingrese un número de identificación');
      return;
    }

    this.isSearching = true;
    this.customerService.getCustomerByIdentificationNumber(this.searchIdentificationNumber.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (customer) => {
          // Ejecutar dentro de la zona de Angular para asegurar detección de cambios
          this.ngZone.run(() => {
            this.createdCustomer = customer;
            
          // Establecer el customerId
          const customerIdControl = this.clienteForm.get('customerId');
          if (customerIdControl) {
            customerIdControl.setValue(customer._id, { emitEvent: true });
            customerIdControl.markAsTouched();
          }
          
          // Cuando se busca un cliente existente, limpiar validaciones requeridas de los campos de creación
          // para que no interfieran con la validación del formulario
          const idControl = this.clienteForm.get('identificationNumber');
          const nameControl = this.clienteForm.get('name');
          const lastNameControl = this.clienteForm.get('lastName');
          
          if (idControl) {
            idControl.clearValidators();
            idControl.updateValueAndValidity({ emitEvent: false });
          }
          if (nameControl) {
            nameControl.clearValidators();
            nameControl.updateValueAndValidity({ emitEvent: false });
          }
          if (lastNameControl) {
            lastNameControl.clearValidators();
            lastNameControl.updateValueAndValidity({ emitEvent: false });
          }
          
          this.isSearching = false;
          
          // Forzar detección de cambios
          this.cdr.detectChanges();
          });
          
          this.toastService.showSuccess('Cliente encontrado');
        },
        error: (error) => {
          this.isSearching = false;
          if (error.status === 404) {
            this.toastService.showInfo('Cliente no encontrado. Puede crearlo en el siguiente formulario.');
            this.customerSearchMode = 'create';
          } else {
            this.toastService.showError('Error al buscar cliente');
          }
        }
      });
  }

  /**
   * Carga un cliente por su ID
   */
  loadCustomerById(customerId: string): void {
    this.isLoadingCustomer = true;
    this.customerService.getCustomerById(customerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (customer) => {
          this.createdCustomer = customer;
          this.isLoadingCustomer = false;
        },
        error: () => {
          this.isLoadingCustomer = false;
          this.toastService.showError('Error al cargar información del cliente');
        }
      });
  }

  /**
   * Crea un nuevo cliente
   */
  createCustomer(): void {
    // Marcar todos los campos como touched para mostrar errores
    this.clienteForm.markAllAsTouched();
    
    // Validar campos requeridos
    const identificationNumberControl = this.clienteForm.get('identificationNumber');
    const nameControl = this.clienteForm.get('name');
    const lastNameControl = this.clienteForm.get('lastName');
    const emailControl = this.clienteForm.get('email');
    const cellphoneControl = this.clienteForm.get('cellphoneNumber');

    if (!identificationNumberControl?.value || !nameControl?.value || !lastNameControl?.value) {
      this.toastService.showWarning('Por favor complete los campos requeridos');
      return;
    }

    // Validar campos opcionales si tienen valor
    if (emailControl?.value && emailControl?.invalid) {
      this.toastService.showWarning('Por favor corrija el formato del correo electrónico');
      return;
    }

    if (cellphoneControl?.value && cellphoneControl?.invalid) {
      this.toastService.showWarning('Por favor corrija el formato del número de celular');
      return;
    }

    const clienteData = this.clienteForm.value;
    this.isLoadingCustomer = true;
    this.loadingService.show('Creando cliente...');

    const customerData = {
      identificationNumber: clienteData.identificationNumber,
      name: clienteData.name,
      lastName: clienteData.lastName,
      cellphoneNumber: clienteData.cellphoneNumber || undefined,
      address: clienteData.address || undefined,
      email: clienteData.email || undefined,
      isActive: true
    };

    this.customerService.createCustomer(customerData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (customer) => {
          this.createdCustomer = customer;
          // Establecer el customerId y forzar validación
          const customerIdControl = this.clienteForm.get('customerId');
          if (customerIdControl) {
            customerIdControl.setValue(customer._id, { emitEvent: true });
            customerIdControl.markAsTouched();
            customerIdControl.updateValueAndValidity({ emitEvent: true });
          }
          // Forzar validación del formulario completo
          this.clienteForm.updateValueAndValidity({ emitEvent: true });
          
          this.isLoadingCustomer = false;
          this.loadingService.hide();
          this.toastService.showSuccess('Cliente creado exitosamente');
        },
        error: (error) => {
          this.isLoadingCustomer = false;
          this.loadingService.hide();
          const errorMessage = error.error?.error || 'Error al crear cliente';
          this.toastService.showError(errorMessage);
        }
      });
  }

  /**
   * Valida si el formulario de cliente es válido
   */
  isClienteFormValid(): boolean {
    // Verificar que haya un cliente creado o encontrado
    if (!this.createdCustomer) {
      return false;
    }
    
    const customerId = this.clienteForm.get('customerId')?.value;
    // Verificar que el customerId tenga un valor válido
    return customerId !== null && customerId !== undefined && customerId !== '';
  }

  /**
   * Getter para verificar si puede avanzar al siguiente paso
   */
  get canGoToNextStep(): boolean {
    return this.createdCustomer !== null && this.createdCustomer !== undefined;
  }

  /**
   * Valida si el formulario de datos es válido
   */
  isDatosFormValid(): boolean {
    return this.datosForm.valid;
  }

  /**
   * Cambia el modo de búsqueda/creación
   */
  switchMode(mode: 'search' | 'create'): void {
    this.customerSearchMode = mode;
    if (mode === 'create') {
      // Limpiar el formulario de cliente para crear uno nuevo
      this.clienteForm.reset();
      this.createdCustomer = null;
      
      // Restaurar validaciones requeridas para los campos de creación
      const idControl = this.clienteForm.get('identificationNumber');
      const nameControl = this.clienteForm.get('name');
      const lastNameControl = this.clienteForm.get('lastName');
      
      if (idControl) {
        idControl.setValidators([Validators.required, Validators.pattern(/^\d+$/), Validators.maxLength(20)]);
        idControl.updateValueAndValidity({ emitEvent: false });
      }
      if (nameControl) {
        nameControl.setValidators([Validators.required, Validators.maxLength(100)]);
        nameControl.updateValueAndValidity({ emitEvent: false });
      }
      if (lastNameControl) {
        lastNameControl.setValidators([Validators.required, Validators.maxLength(100)]);
        lastNameControl.updateValueAndValidity({ emitEvent: false });
      }
    } else {
      this.searchIdentificationNumber = '';
    }
  }

  /**
   * Maneja el cambio de paso en el stepper
   */
  changeStepper(event: number): void {
    this.currentStep = event;
  }

  /**
   * Navega al siguiente paso
   */
  nextStep(): void {
    if (this.currentStep === 0) {
      // Validar paso de cliente - solo verificar que haya un cliente
      if (!this.createdCustomer) {
        this.toastService.showWarning('Debe seleccionar o crear un cliente');
        return;
      }
      
      // Asegurar que el customerId esté establecido
      if (this.createdCustomer._id) {
        const customerIdControl = this.clienteForm.get('customerId');
        if (customerIdControl && !customerIdControl.value) {
          customerIdControl.setValue(this.createdCustomer._id);
        }
      }
      
      // Navegar al siguiente paso usando el stepper
      if (this.stepper) {
        this.stepper.next();
      } else {
        this.currentStep += 1;
      }
    } else if (this.currentStep === 1) {
      // Validar paso de datos
      if (!this.isDatosFormValid()) {
        this.datosForm.markAllAsTouched();
        this.toastService.showWarning('Por favor complete todos los campos requeridos');
        return;
      }
      // Navegar al siguiente paso usando el stepper
      if (this.stepper) {
        this.stepper.next();
      } else {
        this.currentStep += 1;
      }
    }
  }

  /**
   * Navega al paso anterior
   */
  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep -= 1;
    }
  }

  /**
   * Confirma y guarda la máquina
   */
  submit(): void {
    // Validar que haya un cliente seleccionado
    if (!this.createdCustomer || !this.createdCustomer._id) {
      this.toastService.showWarning('Debe seleccionar o crear un cliente');
      return;
    }

    // Validar que el formulario de datos esté completo
    if (!this.datosForm.valid) {
      this.datosForm.markAllAsTouched();
      this.toastService.showWarning('Por favor complete todos los campos requeridos');
      return;
    }

    // Obtener los datos del formulario
    const datosData = this.datosForm.value;
    const customerId = this.clienteForm.get('customerId')?.value || this.createdCustomer._id;

    // Preparar los datos de la máquina
    const machineData = {
      id: datosData.id,
      model: datosData.model,
      serialNumber: datosData.serialNumber,
      usageHours: datosData.usageHours,
      location: datosData.location,
      customerId: customerId, // Usar el ID del cliente
      status: true
    };

    this.dialogRef.close(machineData);
  }

  /**
   * Cancela y cierra el diálogo
   */
  cancel(): void {
    this.dialogRef.close();
  }

  /**
   * Obtiene el nombre completo del cliente
   */
  getCustomerFullName(): string {
    if (this.createdCustomer) {
      return `${this.createdCustomer.name} ${this.createdCustomer.lastName}`;
    }
    return '-';
  }

  /**
   * Obtiene el mensaje de error para un campo del formulario
   */
  getErrorMessage(fieldName: string): string {
    const field = this.clienteForm.get(fieldName);
    if (!field?.errors || !field.touched) {
      return '';
    }

    if (field.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (field.hasError('invalidEmail')) {
      return 'El correo electrónico no es válido';
    }

    if (field.hasError('invalidCellphone')) {
      return 'El número de celular no es válido';
    }

    if (field.hasError('pattern')) {
      if (fieldName === 'identificationNumber') {
        return 'Solo se permiten números';
      }
      return 'Formato inválido';
    }

    if (field.hasError('maxLength')) {
      return `Máximo ${field.errors['maxlength']?.requiredLength} caracteres`;
    }

    return '';
  }
}
