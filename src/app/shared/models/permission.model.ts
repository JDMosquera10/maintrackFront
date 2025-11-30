export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreatePermissionRequest {
  name: string;
  description: string;
  resource: string;
  action: string;
  isActive: boolean;
}

export interface UpdatePermissionRequest extends Partial<CreatePermissionRequest> {
  id: string;
}

export interface PermissionResponse {
  success: boolean;
  payload: Permission | Permission[];
  message?: string;
  error?: string;
}

