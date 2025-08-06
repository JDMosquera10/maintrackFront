export interface Maintenance {
  id: string;
  machineId: Machine;
  type: string;
  spareParts: string[];
  technicianId?: Technician;
  technician?: string;
  isCompleted?: boolean;
  date: Date;
  observations: string;
  workHours?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Technician {
  _id: string,
  email: string;
  firstName: string;
  lastName: string;
}

export interface Machine {
  _id: string,
  model: string;
  serialNumber: string;
  client: string;
  location: string;
}

export interface CreateMaintenanceRequest {
  id?: string;
  _id?: string; // Optional for updates
  machineId: string;
  date: Date;
  type: string;
  spareParts: string[];
  technicianId?: string;
  observations?: string;
  workHours?: number;
  isCompleted?: boolean;
  completedAt?: Date;
}

export interface UpdateMaintenanceRequest extends Partial<CreateMaintenanceRequest> {
  id: string;
}

export interface MaintenanceResponse {
  success: boolean;
  payload: Maintenance | Maintenance[];
  message?: string;
  error?: string;
}

export interface PaginatedMaintenanceResponse {
  success: boolean;
  payload: {
    data: Maintenance[];
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
  error?: string;
} 