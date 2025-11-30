import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GeneralModule } from '../../../../modules/general.module';
import { CreateUserRequest, UserRole } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [GeneralModule],
  templateUrl: './user-modal.component.html',
  styleUrl: './user-modal.component.scss'
})
export class UserModalComponent {
  userForm: FormGroup;
  roles = Object.values(UserRole);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.data.type === 'add' ? [Validators.required, Validators.minLength(6)] : []],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      role: [UserRole.TECHNICIAN, Validators.required],
      isActive: [true, Validators.required]
    });

    if (this.data.type === 'edit' || this.data.type === 'errorAdd') {
      this.userForm.patchValue({
        email: this.data.element.email,
        firstName: this.data.element.firstName,
        lastName: this.data.element.lastName,
        role: this.data.element.role,
        isActive: this.data.element.isActive
      });
      // No requerir password en edición
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  submit() {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      const user: CreateUserRequest = {
        email: formValue.email,
        password: formValue.password || '',
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        role: formValue.role,
        isActive: formValue.isActive
      };
      this.dialogRef.close(user);
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}

