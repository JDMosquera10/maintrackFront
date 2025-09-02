import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { UserRole } from './shared/models/user.model';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, MatCardModule, MatIconModule, MatDividerModule, MatSidenavModule, MatButtonModule, MatSnackBarModule, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'machingP';
  isLoginRoute = false;
  private routerSubscription: Subscription = new Subscription();



  showFilterImage = false;
  isMenuOpen = false;

  stats = [
    { label: 'Máquinas registradas', value: 14, icon: 'precision_manufacturing' },
    { label: 'Mantenimientos pendientes', value: 5, icon: 'build' },
    { label: 'Alertas próximas', value: 3, icon: 'warning' }
  ];

  protected quickNavModulesFiltered: { icon: string; path: string; title: string; role: UserRole[] }[] = [];

  // Módulos de navegación rápida basados en el sidebar
  private quickNavModules = [
    { icon: 'dashboard', path: '/dashboard', title: 'Dashboard', role: [UserRole.ADMIN, UserRole.COORDINATOR] },
    { icon: 'precision_manufacturing', path: '/machines', title: 'Máquinas', role: [UserRole.ADMIN, UserRole.COORDINATOR] },
    { icon: 'build', path: '/maintenance', title: 'Mantenimientos', role: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TECHNICIAN] },
    { icon: 'table_chart', path: '/machines-table', title: 'Tabla Máquinas', role: [UserRole.ADMIN, UserRole.COORDINATOR] }
  ];
  constructor(
    private router: Router,
    public themeService: ThemeService,
    protected authService: AuthService,

  ) {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user) {
        this.quickNavModulesFiltered = this.quickNavModules.filter((module) => module.role.includes(user.role));
      }
    });
  }

  // Función para obtener el icono del tema
  getThemeIcon(): string {
    return this.themeService.isDarkTheme() ? 'light_mode' : 'dark_mode';
  }

  // Función para obtener el tooltip del tema
  getThemeTooltip(): string {
    return this.themeService.isDarkTheme() ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';
  }

  // Función para cambiar el tema
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  navegate(event: string, cb: MatDrawer) {
    console.log(event);
    this.showFilterImage = false;
    this.router.navigate([event || '/dashboard']);
    cb.toggle();
    this.isMenuOpen = false;
  }

  toggleMenu(drawer: MatDrawer) {
    this.isMenuOpen = !drawer.opened;
    this.showFilterImage = !this.showFilterImage;

    drawer.toggle();
  }


  navigateQuick(path: string) {
    this.router.navigate([path]);
  }

  // Método para hacer logout
  logout(): void {
    this.authService.logout().subscribe({
      next: (success) => {
        if (success) {
          this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        console.error('Error during logout:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnInit(): void {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isLoginRoute = event.url === '/login';
      });

    this.isLoginRoute = this.router.url === '/login';
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }
}