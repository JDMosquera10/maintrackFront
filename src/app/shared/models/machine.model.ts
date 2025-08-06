export interface Machine {
  id: string;
  model: string;
  serialNumber: number;
  status: string;
  usageHours: number;
  client: string;
  location: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateMachineRequest {
  model: string;
  serialNumber: number;
  status: boolean;
  usageHours: number;
  client: string;
  locations: string;
}

export interface UpdateMachineRequest extends Partial<CreateMachineRequest> {
  id: string;
}

export interface MachineResponse {
  success: boolean;
  payload: Machine | Machine[];
  message?: string;
  error?: string;
}

export interface PaginatedMachineResponse {
  success: boolean;
  payload: {
    data: Machine[];
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
  error?: string;
} 