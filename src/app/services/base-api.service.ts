import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse, ErrorResponse } from '../shared/models/api-response.model';



@Injectable({
  providedIn: 'root'
})
export abstract class BaseApiService {
  protected readonly baseUrl: string;


  constructor(
    protected http: HttpClient,
    protected endpoint: string
  ) {
    this.baseUrl = `${environment.UrlServer}/${endpoint}`;
  }

  protected getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    });
  }

  protected get<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http.get<ApiResponse<T>>(url, {
      headers: this.getHeaders(),
      params
    }).pipe(
      map(response => response.payload),
      catchError(this.handleError)
    );
  }

  protected post<T>(url: string, data: any): Observable<T> {
    return this.http.post<ApiResponse<T>>(url, data, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.payload),
      catchError((error: HttpErrorResponse) => {
        console.error('Error en POST:', error);
        return throwError(() => error);
      })
    );
  }

  protected patch<T>(url: string, data: any): Observable<T> {
    return this.http.patch<ApiResponse<T>>(url, data, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.payload),
      catchError((error: HttpErrorResponse) => {
        console.error('Error en PATCH:', error);
        return throwError(() => error);
      })
    );
  }

  protected put<T>(url: string, data: any): Observable<T> {
    return this.http.put<ApiResponse<T>>(url, data, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.payload),
      catchError((error: HttpErrorResponse) => {
        console.error('Error en POST:', error);
        return throwError(() => error);
      })
    );
  }

  protected delete<T>(url: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(url, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.payload),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error?.message || error.error?.error) {
      errorMessage = error.error.message || error.error.error;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
} 