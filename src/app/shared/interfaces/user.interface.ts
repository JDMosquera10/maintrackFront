import { Observable } from 'rxjs';
import { LoginResponse, RegisterRequest } from '../models/user.model';

export interface IUserService {
  getUsersList(userData: RegisterRequest): Observable<LoginResponse>;
}