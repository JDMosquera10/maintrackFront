import { Component } from '@angular/core';
import { GeneralModule } from '../../modules/general.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { RoleManagementComponent } from './components/role-management/role-management.component';
import { PermissionManagementComponent } from './components/permission-management/permission-management.component';
import { MaintenanceTypeManagementComponent } from './components/maintenance-type-management/maintenance-type-management.component';
import { StateManagementComponent } from './components/state-management/state-management.component';
import { TypeMaintenanceStatesManagementComponent } from './components/type-maintenance-states-management/type-maintenance-states-management.component';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [
    GeneralModule, 
    MatExpansionModule,
    UserManagementComponent,
    RoleManagementComponent,
    PermissionManagementComponent,
    MaintenanceTypeManagementComponent,
    StateManagementComponent,
    TypeMaintenanceStatesManagementComponent
  ],
  templateUrl: './management.component.html',
  styleUrl: './management.component.scss'
})
export class ManagementComponent {
  // Control de acordeones abiertos
  panelOpenState = {
    users: false,
    roles: false,
    permissions: false,
    maintenances: false
  };
}

