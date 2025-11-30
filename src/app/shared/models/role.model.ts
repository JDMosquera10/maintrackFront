export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
}

export interface UpdateRoleRequest extends Partial<CreateRoleRequest> {
  id: string;
}

export interface RoleResponse {
  success: boolean;
  payload: Role | Role[];
  message?: string;
  error?: string;
}

