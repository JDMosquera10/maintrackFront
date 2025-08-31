import { Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';
import { NoAuthGuard } from './shared/guards/no-auth.guard';
import { RoleGuard } from './shared/guards/role.guard';
import { UserRole } from './shared/models/user.model';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./feactures/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./feactures/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'machines',
    loadComponent: () => import('./feactures/machines/machines.component').then(m => m.MachinesComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.COORDINATOR] }
  },
  {
    path: 'maintenance',
    loadComponent: () => import('./feactures/maintenances/maintenances.component').then(m => m.MaintenancesComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.COORDINATOR] }
  },
  {
    path: 'machines-table',
    loadComponent: () => import('./feactures/details/details.component').then(m => m.DetailsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
