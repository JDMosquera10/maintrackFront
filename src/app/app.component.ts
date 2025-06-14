import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, MatCardModule, MatIconModule, MatDividerModule, MatSidenavModule, MatButtonModule, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'machingP';

  constructor(private router: Router) { }

  showFilterImage = false;
  stats = [
    { label: 'Máquinas registradas', value: 14, icon: 'precision_manufacturing' },
    { label: 'Mantenimientos pendientes', value: 5, icon: 'build' },
    { label: 'Alertas próximas', value: 3, icon: 'warning' }
  ];

  navegate(event: string, cb: MatDrawer) {
    console.log(event);
    this.showFilterImage = false;
    this.router.navigate([event || '/dashboard']);
    cb.toggle();

  }
}