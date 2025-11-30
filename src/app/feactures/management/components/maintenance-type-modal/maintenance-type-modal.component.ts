import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GeneralModule } from '../../../../modules/general.module';
import { CreateMaintenanceTypeRequest } from '../../../../shared/models/maintenance-type.model';

@Component({
  selector: 'app-maintenance-type-modal',
  standalone: true,
  imports: [GeneralModule],
  templateUrl: './maintenance-type-modal.component.html',
  styleUrl: './maintenance-type-modal.component.scss'
})
export class MaintenanceTypeModalComponent {
  maintenanceTypeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MaintenanceTypeModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.maintenanceTypeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      isActive: [true, Validators.required]
    });

    if (this.data.type === 'edit' || this.data.type === 'errorAdd') {
      this.maintenanceTypeForm.patchValue({
        name: this.data.element.name,
        description: this.data.element.description,
        isActive: this.data.element.isActive
      });
    }
  }

  submit() {
    if (this.maintenanceTypeForm.valid) {
      const formValue = this.maintenanceTypeForm.value;
      const maintenanceType: CreateMaintenanceTypeRequest = {
        name: formValue.name,
        description: formValue.description,
        isActive: formValue.isActive
      };
      this.dialogRef.close(maintenanceType);
    } else {
      this.maintenanceTypeForm.markAllAsTouched();
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}

