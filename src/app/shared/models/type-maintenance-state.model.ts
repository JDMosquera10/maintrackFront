import { State } from './state.model';
import { MaintenanceType } from './maintenance-type.model';

export interface TypeMaintenanceState {
  id: string;
  typeMaintenanceId: string;
  stateId: string;
  order: number;
  isActive: boolean;
  state?: State;
  typeMaintenance?: MaintenanceType;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateTypeMaintenanceStateRequest {
  typeMaintenanceId: string;
  stateId: string;
  order: number;
  isActive: boolean;
}

export interface UpdateTypeMaintenanceStateRequest extends Partial<CreateTypeMaintenanceStateRequest> {
  id: string;
}

export interface UpdateOrderRequest {
  typeMaintenanceId: string;
  stateId: string;
  order: number;
}

export interface TypeMaintenanceStateResponse {
  success: boolean;
  payload: TypeMaintenanceState | TypeMaintenanceState[];
  message?: string;
  error?: string;
}

