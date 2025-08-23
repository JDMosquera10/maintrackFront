import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  AuthState,
  UserRole 
} from '../shared/models/user.model';
import { IAuthService } from '../shared/interfaces/auth.interface';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseApiService implements IAuthService {
  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false
  });

  constructor(http: HttpClient) {
    super(http, 'auth');
    this.initializeAuthState();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.setLoading(true);
    
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success) {
          this.setAuthState(response.payload.user, response.payload.token);
        }
      }),
      catchError(error => {
        this.setLoading(false);
        return throwError(() => error);
      }),
      tap(() => this.setLoading(false))
    );
  }

  register(userData: RegisterRequest): Observable<LoginResponse> {
    this.setLoading(true);
    
    return this.http.post<LoginResponse>(`${this.baseUrl}/register`, userData).pipe(
      tap(response => {
        if (response.success) {
          this.setAuthState(response.payload.user, response.payload.token);
        }
      }),
      catchError(error => {
        this.setLoading(false);
        return throwError(() => error);
      }),
      tap(() => this.setLoading(false))
    );
  }

  logout(): Observable<boolean> {
    return this.http.post<{ success: boolean }>(`${this.baseUrl}/logout`, {}).pipe(
      tap(() => this.clearAuthState()),
      map(response => response.success),
      catchError(() => {
        this.clearAuthState();
        return of(true);
      })
    );
  }

  refreshToken(): Observable<LoginResponse> {
    let refreshToken: string | null = null;
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      refreshToken = localStorage.getItem('refreshToken');
    }
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    return this.http.post<LoginResponse>(`${this.baseUrl}/refresh`, { refreshToken }).pipe(
      tap(response => {
        if (response.success) {
          this.setAuthState(response.payload.user, response.payload.token);
        }
      }),
      catchError(error => {
        this.clearAuthState();
        return throwError(() => error);
      })
    );
  }

  /**
   * Devuelve un observable con el usuario actual (o null si no hay usuario autenticado).
   * @returns {Observable<User | null>}
   */
  getCurrentUser(): Observable<User | null> {
    return this.authStateSubject.pipe(
      map(state => state.user)
    );
  }

  /**
   * Devuelve un observable con el rol del usuario actual (o null si no hay usuario autenticado).
   * @returns {Observable<UserRole | null>}
   */
  getCurrentRole(): Observable<UserRole | undefined> {
    return this.authStateSubject.pipe(
      map(state => state.user?.role)
    );
  }

  /**
   * Devuelve un observable booleano indicando si el usuario esta autenticado.
   * @returns {Observable<boolean>}
   */
  isAuthenticated(): Observable<boolean> {
    return this.authStateSubject.pipe(
      map(state => state.isAuthenticated)
    );
  }

  /**
   * Devuelve el estado completo de autenticación como observable.
   * @returns {Observable<AuthState>}
   */
  getAuthState(): Observable<AuthState> {
    return this.authStateSubject.asObservable();
  }

  /**
   * Devuelve true si el usuario autenticado tiene el rol especificado.
   * @param role 
   * @returns 
   */
  hasRole(role: UserRole): boolean {
    const currentUser = this.authStateSubject.value.user;
    return currentUser?.role === role;
  }

  /**
   * Inicializa el estado de autenticación desde el almacenamiento local.
   */
  private initializeAuthState(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        try {
          const user: User = JSON.parse(userStr);
          this.setAuthState(user, token);
        } catch (error) {
          this.clearAuthState();
        }
      }
    }
  }

  private setAuthState(user: User, token: string): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    this.authStateSubject.next({
      user,
      token,
      isAuthenticated: true,
      isLoading: false
    });
  }

  private clearAuthState(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    this.authStateSubject.next({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    });
  }

  private setLoading(isLoading: boolean): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      isLoading
    });
  }
} 