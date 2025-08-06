import { Observable } from 'rxjs';
import { Maintenance, CreateMaintenanceRequest, UpdateMaintenanceRequest, MaintenanceResponse, PaginatedMaintenanceResponse } from '../models/maintenance.model';

export interface IMaintenanceService {
  getMaintenances(): Observable<Maintenance[]>;
  getMaintenanceById(id: string): Observable<Maintenance>;
  createMaintenance(maintenance: CreateMaintenanceRequest): Observable<Maintenance>;
  updateMaintenance(maintenance: UpdateMaintenanceRequest): Observable<Maintenance>;
  deleteMaintenance(id: string): Observable<boolean>;
  getMaintenancesPaginated(page: number, limit: number): Observable<PaginatedMaintenanceResponse>;
} 