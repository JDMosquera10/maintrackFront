import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: any): Observable<boolean | UrlTree> {
    const requiredRoles = route.data?.['roles'] as UserRole[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return new Observable(observer => observer.next(true));
    }

    return this.authService.getCurrentUser().pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }

        const hasRequiredRole = requiredRoles.includes(user.role);
        
        if (!hasRequiredRole) {
          this.router.navigate(['/unauthorized']);
          return false;
        }

        return true;
      })
    );
  }
} 