import { Component, ViewChild, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { GeneralModule } from '../../../../modules/general.module';
import { PermissionService } from '../../../../services/permission.service';
import { Permission } from '../../../../shared/models/permission.model';
import { PermissionModalComponent } from '../permission-modal/permission-modal.component';

@Component({
  selector: 'app-permission-management',
  standalone: true,
  imports: [GeneralModule],
  templateUrl: './permission-management.component.html',
  styleUrl: './permission-management.component.scss'
})
export class PermissionManagementComponent {
  readonly dialog = inject(MatDialog);
  displayedColumns: string[] = ['name', 'description', 'resource', 'action', 'isActive', 'acciones'];
  dataSource = new MatTableDataSource<Permission>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private permissionService: PermissionService) {
    this.loadPermissions();
  }

  loadPermissions() {
    this.permissionService.getPermissions().subscribe({
      next: (permissions) => {
        this.dataSource.data = permissions;
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        console.error('Error loading permissions:', err);
      }
    });
  }

  actionPermission(type: 'add' | 'edit' | 'errorAdd', element?: Permission): void {
    const dialogRef = this.dialog.open(PermissionModalComponent, {
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
          this.permissionService.createPermission(result).subscribe({
            next: (permission) => {
              this.dataSource.data.push(permission);
              this.dataSource._updateChangeSubscription();
            },
            error: (err) => {
              if (err.status === 400) {
                this.actionPermission('errorAdd', result);
              }
            }
          });
        } else if (type === 'edit' && element) {
          this.permissionService.updatePermission({ ...result, id: element.id }).subscribe({
            next: (permission) => {
              const index = this.dataSource.data.findIndex(p => p.id === element.id);
              if (index >= 0) {
                this.dataSource.data[index] = permission;
                this.dataSource._updateChangeSubscription();
              }
            },
            error: (err) => {
              if (err.status === 400) {
                this.actionPermission('edit', result);
              }
            }
          });
        }
      }
    });
  }

  deletePermission(element: Permission): void {
    if (confirm(`¿Está seguro de eliminar el permiso "${element.name}"?`)) {
      this.permissionService.deletePermission(element.id).subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter(p => p.id !== element.id);
          this.dataSource._updateChangeSubscription();
        },
        error: (err) => {
          console.error('Error deleting permission:', err);
        }
      });
    }
  }

  onSearchChange(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = searchValue.trim().toLowerCase();
  }
}

