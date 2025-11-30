import { Component, ViewChild, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { GeneralModule } from '../../../../modules/general.module';
import { UserService } from '../../../../services/user.service';
import { User } from '../../../../shared/models/user.model';
import { UserModalComponent } from '../user-modal/user-modal.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [GeneralModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent {
  readonly dialog = inject(MatDialog);
  displayedColumns: string[] = ['email', 'firstName', 'lastName', 'role', 'isActive', 'acciones'];
  dataSource = new MatTableDataSource<User>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private userService: UserService) {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.dataSource.data = users;
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        console.error('Error loading users:', err);
      }
    });
  }

  actionUser(type: 'add' | 'edit' | 'errorAdd', element?: User): void {
    const dialogRef = this.dialog.open(UserModalComponent, {
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
          this.userService.createUser(result).subscribe({
            next: (user) => {
              this.dataSource.data.push(user);
              this.dataSource._updateChangeSubscription();
            },
            error: (err) => {
              if (err.status === 400) {
                this.actionUser('errorAdd', result);
              }
            }
          });
        } else if (type === 'edit' && element) {
          this.userService.updateUser({ ...result, id: element.id }).subscribe({
            next: (user) => {
              const index = this.dataSource.data.findIndex(u => u.id === element.id);
              if (index >= 0) {
                this.dataSource.data[index] = user;
                this.dataSource._updateChangeSubscription();
              }
            },
            error: (err) => {
              if (err.status === 400) {
                this.actionUser('edit', result);
              }
            }
          });
        }
      }
    });
  }

  deleteUser(element: User): void {
    if (confirm(`¿Está seguro de eliminar el usuario "${element.email}"?`)) {
      this.userService.deleteUser(element.id).subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter(u => u.id !== element.id);
          this.dataSource._updateChangeSubscription();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
        }
      });
    }
  }

  onSearchChange(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = searchValue.trim().toLowerCase();
  }
}

