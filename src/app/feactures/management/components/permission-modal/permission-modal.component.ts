import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GeneralModule } from '../../../../modules/general.module';
import { CreatePermissionRequest } from '../../../../shared/models/permission.model';

@Component({
  selector: 'app-permission-modal',
  standalone: true,
  imports: [GeneralModule],
  templateUrl: './permission-modal.component.html',
  styleUrl: './permission-modal.component.scss'
})
export class PermissionModalComponent {
  permissionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PermissionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.permissionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      resource: ['', [Validators.required]],
      action: ['', [Validators.required]],
      isActive: [true, Validators.required]
    });

    if (this.data.type === 'edit' || this.data.type === 'errorAdd') {
      this.permissionForm.patchValue({
        name: this.data.element.name,
        description: this.data.element.description,
        resource: this.data.element.resource,
        action: this.data.element.action,
        isActive: this.data.element.isActive
      });
    }
  }

  submit() {
    if (this.permissionForm.valid) {
      const formValue = this.permissionForm.value;
      const permission: CreatePermissionRequest = {
        name: formValue.name,
        description: formValue.description,
        resource: formValue.resource,
        action: formValue.action,
        isActive: formValue.isActive
      };
      this.dialogRef.close(permission);
    } else {
      this.permissionForm.markAllAsTouched();
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}

