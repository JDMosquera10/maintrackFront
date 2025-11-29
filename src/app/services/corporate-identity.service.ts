import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CorporateIdentity, CorporateIdentityResponse } from '../shared/models/corporate-identity.model';

@Injectable({
  providedIn: 'root'
})
export class CorporateIdentityService {
  private readonly baseUrl = `${environment.UrlServer}/admin/corporateId`;
  private cachedIdentities: Map<'dark' | 'light', CorporateIdentity | null> = new Map();

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la identidad corporativa desde el backend
   */
  getCorporateIdentity(): Observable<CorporateIdentity[]> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'tenant': environment.tenant
    });

    return this.http.get<CorporateIdentityResponse>(this.baseUrl, { headers }).pipe(
      map(response => {
        if (response.success && response.data) {
          // Cachear las identidades por tema
          response.data.forEach(identity => {
            if (identity.theme === 'dark' || identity.theme === 'light') {
              this.cachedIdentities.set(identity.theme, identity);
            }
          });
          return response.data;
        }
        return [];
      }),
      catchError(error => {
        console.warn('Error al obtener identidad corporativa, usando valores por defecto:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene la identidad corporativa para un tema específico
   */
  getIdentityByTheme(theme: 'dark' | 'light'): CorporateIdentity | null {
    return this.cachedIdentities.get(theme) || null;
  }

  /**
   * Limpia el cache de identidades
   */
  clearCache(): void {
    this.cachedIdentities.clear();
  }

  /**
   * Obtiene los temas disponibles desde las identidades cacheadas
   */
  getAvailableThemes(): ('dark' | 'light')[] {
    const themes: ('dark' | 'light')[] = [];
    if (this.cachedIdentities.has('dark')) {
      themes.push('dark');
    }
    if (this.cachedIdentities.has('light')) {
      themes.push('light');
    }
    return themes;
  }

  /**
   * Verifica si hay un solo tema disponible
   */
  hasSingleTheme(): boolean {
    const availableThemes = this.getAvailableThemes();
    return availableThemes.length === 1;
  }

  /**
   * Obtiene el único tema disponible si solo hay uno
   */
  getSingleTheme(): ('dark' | 'light') | null {
    const availableThemes = this.getAvailableThemes();
    return availableThemes.length === 1 ? availableThemes[0] : null;
  }
}

