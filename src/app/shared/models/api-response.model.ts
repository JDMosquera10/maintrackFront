export interface ApiResponse<T> {
  success: boolean;
  payload: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  payload: {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
  error?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  statusCode?: number;
} 