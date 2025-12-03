export interface Customer {
  _id: string;
  identificationNumber: string;
  name: string;
  lastName: string;
  cellphoneNumber?: string;
  address?: string;
  email?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateCustomerRequest {
  identificationNumber: string;
  name: string;
  lastName: string;
  cellphoneNumber?: string;
  address?: string;
  email?: string;
  isActive?: boolean;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {
  _id?: string;
}

export interface CustomerResponse {
  success: boolean;
  payload: Customer | Customer[];
  message?: string;
  error?: string;
}

