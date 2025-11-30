export interface State {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateStateRequest {
  name: string;
  description: string;
  isActive: boolean;
}

export interface UpdateStateRequest extends Partial<CreateStateRequest> {
  id: string;
}

export interface StateResponse {
  success: boolean;
  payload: State | State[];
  message?: string;
  error?: string;
}

