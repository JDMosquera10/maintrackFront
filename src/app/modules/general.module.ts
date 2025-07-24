import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Material Design Modules
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';

// Charts
import { NgxChartsModule } from '@swimlane/ngx-charts';

const MATERIAL_MODULES = [
  MatCardModule,
  MatIconModule,
  MatButtonModule,
  MatSidenavModule,
  MatDividerModule,
  MatTableModule,
  MatPaginatorModule,
  MatFormFieldModule,
  MatInputModule,
  MatDialogModule,
  MatMenuModule,
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatToolbarModule,
  MatTooltipModule,
  MatChipsModule,
  MatBadgeModule
];

const ANGULAR_MODULES = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  RouterModule
];

const THIRD_PARTY_MODULES = [
  NgxChartsModule
];

@NgModule({
  imports: [
    ...ANGULAR_MODULES,
    ...MATERIAL_MODULES,
    ...THIRD_PARTY_MODULES
  ],
  exports: [
    ...ANGULAR_MODULES,
    ...MATERIAL_MODULES,
    ...THIRD_PARTY_MODULES
  ]
})
export class GeneralModule { }