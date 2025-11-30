import { Machine } from './machine.model';
import { Maintenance } from './maintenance.model';

export interface DashboardStats {
  totalMachines: number;
  activeMachines: number;
  pendingMaintenances: number;
  completedMaintenances: number;
  upcomingAlerts: number;
  totalWorkHours: number;
  averageUsageHours: number;
}

export interface MaintenancesByMonth {
  month: string; // Formato: "YYYY-MM" según documentación del backend
  preventive: number; // Siempre 0 (tipos dinámicos)
  corrective: number; // Siempre 0 (tipos dinámicos)
  total: number; // Total de mantenimientos en ese mes
}

export interface MachineStatusData {
  operational: number;
  maintenance: number;
}

export interface SpareParts {
  month: string;
  filtersUsed: number;
  oilUsed: number;
  partsReplaced: number;
}

export interface DashboardCharts {
  maintenancesByMonth: MaintenancesByMonth[];
  machineStatus: MachineStatusData;
  sparePartsConsumption: SpareParts[];
}

export interface MaintenanceAlert {
  id: string;
  maintenanceId: string;
  machineId: string;
  machineModel: string;
  machineSerial: string;
  client: string;
  dueDate: Date | string;
  daysRemaining: number;
  maintenanceType: string; // Actualmente siempre "preventive" por compatibilidad
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  technicianId: string;
  spareParts: string[];
  observations?: string;
}

export interface RecentMachine {
  id: string;
  model: string;
  serialNumber: string;
  client: string;
  nextMaintenanceDate: Date | string;
  daysUntilMaintenance: number;
  status: string; // "operational" | "maintenance" | "out_of_service"
  location: string;
}

export interface DashboardData {
  stats: DashboardStats;
  charts: DashboardCharts;
  alerts: MaintenanceAlert[];
  recentMachines: RecentMachine[];
  lastUpdated: Date;
}

export interface DashboardFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  client?: string;
  machineType?: string;
  location?: string;
  status?: string[];
}

export interface DashboardResponse {
  success: boolean;
  payload: DashboardData;
  message?: string;
  error?: string;
}

// WebSocket events para actualizaciones en tiempo real
export interface DashboardUpdateEvent {
  type: 'dashboard_update';
  data: Partial<DashboardData>;
  timestamp: Date;
}

export interface MachineStatusUpdateEvent {
  type: 'machine_status_update';
  data: {
    machineId: string;
    oldStatus: string;
    newStatus: string;
    timestamp: Date;
  };
}

export interface MaintenanceUpdateEvent {
  type: 'maintenance_update';
  data: {
    maintenanceId: string;
    machineId: string;
    action: 'created' | 'completed' | 'updated' | 'cancelled';
    timestamp: Date;
  };
}

export type DashboardWebSocketEvent = 
  | DashboardUpdateEvent 
  | MachineStatusUpdateEvent 
  | MaintenanceUpdateEvent;
