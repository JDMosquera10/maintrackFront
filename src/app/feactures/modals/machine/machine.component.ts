import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GeneralModule } from '../../../modules/general.module';

/**
 *  @description Componente para gestionar el formulario de máquinas.
 *  Permite crear o editar una máquina a través de un diálogo modal.
 */
@Component({
  selector: 'app-machine',
  imports: [GeneralModule],
  templateUrl: './machine.component.html',
  styleUrl: './machine.component.scss'
})
export class MachineComponent implements OnInit {
  machineForm!: FormGroup;

  constructor(private fb: FormBuilder,
    private dialogRef: MatDialogRef<MachineComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.machineForm = this.fb.group({
      id: [null],
      model: ['', Validators.required],
      serialNumber: ['', Validators.required],
      usageHours: [null, [Validators.required, Validators.min(0)]],
      client: ['', Validators.required],
      location: ['', Validators.required]
    });

    if (this.data.type === 'edit' || this.data.type === 'errorAdd') {
      this.machineForm.patchValue(this.data.element);
    }
  }

  /**
   * @description Guarda los datos del formulario y cierra el diálogo.
   * Si el formulario es inválido, marca todos los campos como tocados para mostrar errores.
   */
  onSave(): void {
    if (this.machineForm.valid) {
      this.dialogRef.close(this.machineForm.value);
    } else {
      this.machineForm.markAllAsTouched();
    }
  }

  /**
   * @description Cierra el diálogo sin guardar cambios.
   */
  onCancel(): void {
    this.dialogRef.close();
  }
}
