import { Machine } from './machine.model';
import { Maintenance } from './maintenance.model';

export interface DashboardStats {
  totalMachines: number;
  activeMachines: number;
  inactiveMachines: number;
  pendingMaintenances: number;
  completedMaintenances: number;
  upcomingAlerts: number;
  totalWorkHours: number;
  averageUsageHours: number;
}

export interface MaintenancesByMonth {
  month: string;
  preventive: number;
  corrective: number;
  total: number;
}

export interface MachineStatusData {
  operational: number;
  maintenance: number;
  offline: number;
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
  dueDate: Date;
  daysRemaining: number;
  maintenanceType: string;
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
  nextMaintenanceDate: Date;
  daysUntilMaintenance: number;
  status: string;
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
