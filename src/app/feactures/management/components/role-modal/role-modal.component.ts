import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GeneralModule } from '../../../../modules/general.module';
import { CreateRoleRequest } from '../../../../shared/models/role.model';
import { PermissionService } from '../../../../services/permission.service';
import { Permission } from '../../../../shared/models/permission.model';

@Component({
  selector: 'app-role-modal',
  standalone: true,
  imports: [GeneralModule],
  templateUrl: './role-modal.component.html',
  styleUrl: './role-modal.component.scss'
})
export class RoleModalComponent implements OnInit {
  roleForm: FormGroup;
  availablePermissions: Permission[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RoleModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private permissionService: PermissionService
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      permissions: this.fb.array([]),
      isActive: [true, Validators.required]
    });
  }

  ngOnInit() {
    this.loadPermissions();
    
    if (this.data.type === 'edit' || this.data.type === 'errorAdd') {
      this.roleForm.patchValue({
        name: this.data.element.name,
        description: this.data.element.description,
        isActive: this.data.element.isActive
      });
      
      // Cargar permisos seleccionados
      if (this.data.element.permissions) {
        this.data.element.permissions.forEach((permId: string) => {
          const control = this.fb.control(permId);
          this.permissions.push(control);
        });
      }
    }
  }

  loadPermissions() {
    this.permissionService.getPermissions().subscribe({
      next: (permissions) => {
        this.availablePermissions = permissions.filter(p => p.isActive);
      },
      error: (err) => {
        console.error('Error loading permissions:', err);
      }
    });
  }

  get permissions(): FormArray {
    return this.roleForm.get('permissions') as FormArray;
  }

  togglePermission(permissionId: string) {
    const index = this.permissions.controls.findIndex(
      control => control.value === permissionId
    );
    
    if (index >= 0) {
      this.permissions.removeAt(index);
    } else {
      this.permissions.push(this.fb.control(permissionId));
    }
  }

  isPermissionSelected(permissionId: string): boolean {
    return this.permissions.controls.some(control => control.value === permissionId);
  }

  submit() {
    if (this.roleForm.valid) {
      const formValue = this.roleForm.value;
      const role: CreateRoleRequest = {
        name: formValue.name,
        description: formValue.description,
        permissions: formValue.permissions || [],
        isActive: formValue.isActive
      };
      this.dialogRef.close(role);
    } else {
      this.roleForm.markAllAsTouched();
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}

