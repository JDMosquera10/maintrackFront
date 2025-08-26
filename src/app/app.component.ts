import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, MatCardModule, MatIconModule, MatDividerModule, MatSidenavModule, MatButtonModule, MatSnackBarModule, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'machingP';

  constructor(
    private router: Router,
    public themeService: ThemeService,
    private authService: AuthService
  ) { }

  showFilterImage = false;
  isMenuOpen = false; // Para saber si el menú está abierto
  
  stats = [
    { label: 'Máquinas registradas', value: 14, icon: 'precision_manufacturing' },
    { label: 'Mantenimientos pendientes', value: 5, icon: 'build' },
    { label: 'Alertas próximas', value: 3, icon: 'warning' }
  ];

  // Módulos de navegación rápida basados en el sidebar
  quickNavModules = [
    { icon: 'dashboard', path: '/dashboard', title: 'Dashboard' },
    { icon: 'precision_manufacturing', path: '/machines', title: 'Máquinas' },
    { icon: 'build', path: '/maintenance', title: 'Mantenimientos' },
    { icon: 'table_chart', path: '/machines-table', title: 'Tabla Máquinas' }
  ];

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
    this.isMenuOpen = false; // El menú se cierra después de navegar
  }

  toggleMenu(drawer: MatDrawer) {
    // Actualizar el estado inmediatamente basándose en el estado actual
    this.isMenuOpen = !drawer.opened;
    this.showFilterImage = !this.showFilterImage;
    
    // Realizar el toggle después de actualizar el estado
    drawer.toggle();
  }

  // Método ya no necesario - los iconos se controlan directamente con isMenuOpen

  navigateQuick(path: string) {
    this.router.navigate([path]);
    // Los iconos permanecen visibles después de navegar
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
        // Aunque haya error, limpiar sesión local y redirigir
        this.router.navigate(['/login']);
      }
    });
  }
}