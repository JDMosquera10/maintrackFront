import { Component, ViewChild, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { GeneralModule } from '../../../../modules/general.module';
import { RoleService } from '../../../../services/role.service';
import { Role } from '../../../../shared/models/role.model';
import { RoleModalComponent } from '../role-modal/role-modal.component';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [GeneralModule],
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.scss'
})
export class RoleManagementComponent {
  readonly dialog = inject(MatDialog);
  displayedColumns: string[] = ['name', 'description', 'permissions', 'isActive', 'acciones'];
  dataSource = new MatTableDataSource<Role>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private roleService: RoleService) {
    this.loadRoles();
  }

  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.dataSource.data = roles;
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        console.error('Error loading roles:', err);
      }
    });
  }

  actionRole(type: 'add' | 'edit' | 'errorAdd', element?: Role): void {
    const dialogRef = this.dialog.open(RoleModalComponent, {
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
          this.roleService.createRole(result).subscribe({
            next: (role) => {
              this.dataSource.data.push(role);
              this.dataSource._updateChangeSubscription();
            },
            error: (err) => {
              if (err.status === 400) {
                this.actionRole('errorAdd', result);
              }
            }
          });
        } else if (type === 'edit' && element) {
          this.roleService.updateRole({ ...result, id: element.id }).subscribe({
            next: (role) => {
              const index = this.dataSource.data.findIndex(r => r.id === element.id);
              if (index >= 0) {
                this.dataSource.data[index] = role;
                this.dataSource._updateChangeSubscription();
              }
            },
            error: (err) => {
              if (err.status === 400) {
                this.actionRole('edit', result);
              }
            }
          });
        }
      }
    });
  }

  deleteRole(element: Role): void {
    if (confirm(`¿Está seguro de eliminar el rol "${element.name}"?`)) {
      this.roleService.deleteRole(element.id).subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter(r => r.id !== element.id);
          this.dataSource._updateChangeSubscription();
        },
        error: (err) => {
          console.error('Error deleting role:', err);
        }
      });
    }
  }

  onSearchChange(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = searchValue.trim().toLowerCase();
  }
}

