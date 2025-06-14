import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'machines',
    loadComponent: () => import('./machines/machines.component').then(m => m.MachinesComponent)
  },
   {
    path: 'maintenance',
    loadComponent: () => import('./maintenances/maintenances.component').then(m => m.MaintenancesComponent)
  },
  {
    path: 'machines-table',
    loadComponent: () => import('./details/details.component').then(m => m.DetailsComponent)
  }
];
