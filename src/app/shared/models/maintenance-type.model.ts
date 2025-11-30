export interface MaintenanceType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateMaintenanceTypeRequest {
  name: string;
  description: string;
  isActive: boolean;
}

export interface UpdateMaintenanceTypeRequest extends Partial<CreateMaintenanceTypeRequest> {
  id: string;
}

export interface MaintenanceTypeResponse {
  success: boolean;
  payload: MaintenanceType | MaintenanceType[];
  message?: string;
  error?: string;
}

