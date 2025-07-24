import { Observable } from 'rxjs';
import { User, LoginRequest, LoginResponse, RegisterRequest, AuthState } from '../models/user.model';

export interface IAuthService {
  login(credentials: LoginRequest): Observable<LoginResponse>;
  register(userData: RegisterRequest): Observable<LoginResponse>;
  logout(): Observable<boolean>;
  refreshToken(): Observable<LoginResponse>;
  getCurrentUser(): Observable<User | null>;
  isAuthenticated(): Observable<boolean>;
  getAuthState(): Observable<AuthState>;
}

export interface IAuthGuard {
  canActivate(): Observable<boolean>;
  canActivateChild(): Observable<boolean>;
} 