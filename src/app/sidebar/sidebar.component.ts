import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../shared/models/user.model';

export type Image = {
  src: string;
  title: string;
  description: string;
  path: string;
  role: UserRole[];
};

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Output() actionComponent = new EventEmitter<string>();

  protected imagesFiltered: Image[] = [];
  private images: Image[] = [
    {
      src: 'https://machine-app-test-1.s3.us-east-2.amazonaws.com/siderbar/pruebaimagen.png',
      title: 'Dashboard',
      path: '/dashboard',
      role: [UserRole.ADMIN, UserRole.COORDINATOR],
      description: 'Puedes ver el estado general del sistema aquí.',
    },
    {
      src: 'https://machine-app-test-1.s3.us-east-2.amazonaws.com/siderbar/pruebaimagen2.png',
      title: 'Gestión de maquinas',
      path: '/machines',
      role: [UserRole.ADMIN, UserRole.COORDINATOR],
      description: 'Registra y edita las maquinas de tu sistema.',
    },
    {
      src: 'https://machine-app-test-1.s3.us-east-2.amazonaws.com/siderbar/pruebaimagen4.png',
      title: 'Gestión de mantenimientos',
      path: '/maintenance',
      role: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TECHNICIAN],
      description: 'Registra y edita los mantenimientos de tu sistema.',
    },
    {
      src: 'https://machine-app-test-1.s3.us-east-2.amazonaws.com/siderbar/pruebaimagen3.png',
      title: 'Tabla de mantenimientos',
      path: '/machines-table',
      role: [UserRole.ADMIN, UserRole.COORDINATOR],
      description: 'mira los detalles de tus mantenimientos registrados en una lista.',
    }
  ];

  constructor(private authService: AuthService) {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user) {
        this.imagesFiltered = this.images.filter((image) => image.role.includes(user.role));
      }
    });
  }

  onActionComponent(data: Image) {
    this.actionComponent.emit(data.path);
  }
}
