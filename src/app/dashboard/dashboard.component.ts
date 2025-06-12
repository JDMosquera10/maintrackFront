import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, MatCardModule, MatIconModule, MatSidenavModule, MatButtonModule, SidebarComponent],
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  showFiller = false;
  stats = [
    { label: 'Máquinas registradas', value: 14, icon: 'precision_manufacturing' },
    { label: 'Mantenimientos pendientes', value: 5, icon: 'build' },
    { label: 'Alertas próximas', value: 3, icon: 'warning' }
  ];
}
