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
  UserRole,
  CreateUserRequest,
  UpdateUserRequest
} from '../shared/models/user.model';
import { IUserService } from '../shared/interfaces/user.interface';
import { BaseApiService } from './base-api.service';
import { Technician } from '../shared/models/maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseApiService {
  constructor(http: HttpClient) {
    super(http, 'users');
  }

  getUsersList(): Observable<Technician[]> {
    return this.get<Technician[]>(`${this.baseUrl}/actives`);
  }

  /**
   * Obtiene todos los usuarios (para gestión)
   */
  getAllUsers(): Observable<User[]> {
    return this.get<User[]>(this.baseUrl).pipe(
      map(result => result.map(this.mapToUser))
    );
  }

  /**
   * Obtiene un usuario por ID
   */
  getUserById(id: string): Observable<User> {
    return this.get<User>(`${this.baseUrl}/${id}`).pipe(
      map(result => this.mapToUser(result))
    );
  }

  /**
   * Crea un nuevo usuario
   */
  createUser(user: CreateUserRequest): Observable<User> {
    return this.post<User>(this.baseUrl, user).pipe(
      map(result => this.mapToUser(result))
    );
  }

  /**
   * Actualiza un usuario existente
   */
  updateUser(user: UpdateUserRequest): Observable<User> {
    return this.put<User>(`${this.baseUrl}/${user.id}`, user).pipe(
      map(result => this.mapToUser(result))
    );
  }

  /**
   * Elimina un usuario
   */
  deleteUser(id: string): Observable<boolean> {
    return this.delete<boolean>(`${this.baseUrl}/${id}`);
  }

  /**
   * Convierte un objeto de datos en un objeto User
   */
  private mapToUser(data: any): User {
    return {
      _id: data._id || data.id,
      id: data._id || data.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      isActive: data.isActive,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }
} 