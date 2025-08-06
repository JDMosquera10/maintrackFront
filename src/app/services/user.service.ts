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
} 