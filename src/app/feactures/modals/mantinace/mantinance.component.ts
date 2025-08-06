import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MachineService } from '../../../services/machine.service';
import { Machine } from '../../../shared/models/machine.model';
import { CreateMaintenanceRequest, Technician } from '../../../shared/models/maintenance.model';
import { GeneralModule } from '../../../modules/general.module';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAINTENANCE_TYPE_TRANSLATIONS } from '../../../shared/constants/translation.constants';
import { format } from 'date-fns';
import { id } from '@swimlane/ngx-charts';


@Component({
  selector: 'app-mantinance',
  imports: [GeneralModule],
  providers: [provideNativeDateAdapter()],
  templateUrl: './mantinance.component.html',
  styleUrl: './mantinance.component.scss'
})
export class MantinanceComponent implements OnInit {
  TRADUCERTYPES = MAINTENANCE_TYPE_TRANSLATIONS;
  protected stepForm: FormGroup;
  protected machines: Machine[] = [];
  protected technicals: Technician[] = [];
  private currentStep = 0;
  protected isLoadingMachines: boolean = true;
  protected isLoadingUsers: boolean = true;
  readonly serializedDate = new FormControl(new Date().toISOString());
  protected isObservations = true;

  constructor(
    private fb: FormBuilder,
    private machineService: MachineService,
    private authService: AuthService,
    private userService: UserService,
    private dialogRef: MatDialogRef<MantinanceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.stepForm = this.fb.group({
      datos: this.fb.group({
        id: [null],
        machine: [null, Validators.required],
        date: [null, Validators.required],
        type: [null, Validators.required],
        technician: [null, Validators.required],
        observations: [''],
        workHours: [null, [Validators.min(0)]]
      }),
      repuestos: this.fb.group({
        spareParts: this.fb.array([])
      })
    });

    if (this.data.type === 'edit' || this.data.type === 'errorAdd') {
      this.currentStep = 2;
      this.stepForm.patchValue({
        datos: {
          id: this.data.element._id || this.data.element.id || null,
          machine: this.data.element.machineId._id || this.data.element.machineId || null,
          date: this.data.element.date,
          type: this.data.element.type,
          technician: this.data.element.technicianId._id || this.data.element.technicianId || null,
          observations: this.data.element.observations || null,
          workHours: this.data.element.workHours
        }
      });
      this.data.element.spareParts.map((part: string) => this.spareParts.push(this.fb.control(part)));
    }
    this.authService.getCurrentUser().subscribe((user: any) => {
      if (this.data.type === 'add') {
        (this.stepForm.controls['datos'] as FormGroup).controls['technician'].setValue(user?._id);
      }
    });
    this.loadMachines();
    this.loadUsers();
  }

  ngOnInit(): void {

  }


  loadMachines() {
    this.machineService.getMachines().subscribe({
      next: (machines) => {
        this.machines = machines;
        this.isLoadingMachines = false;
      },
      error: () => {
        this.isLoadingMachines = false;
      }
    });
  }

  loadUsers() {
    this.userService.getUsersList().subscribe({
      next: (technicals) => {
        this.technicals = technicals;
        this.isLoadingUsers = false;
      },
      error: () => {
        this.isLoadingUsers = false;
      }
    });
  }

  get datosForm() {
    return this.stepForm.get('datos') as FormGroup;
  }

  get repuestosForm() {
    return this.stepForm.get('repuestos') as FormGroup;
  }

  get spareParts(): FormArray {
    return this.repuestosForm.get('spareParts') as FormArray;
  }

  addSparePart(part: string) {
    if (part) {
      this.spareParts.push(this.fb.control(part));
    }
  }

  removeSparePart(index: number) {
    this.spareParts.removeAt(index);
  }

  submit() {
    if (this.stepForm.valid) {
      if (this.currentStep === 2) {
        const datos = this.datosForm.value;
        const repuestos = this.repuestosForm.value;
        const maintenance: CreateMaintenanceRequest = {
          id: datos.id,
          machineId: datos.machine,
          date: datos.date,
          type: datos.type,
          technicianId: datos.technician,
          observations: datos.observations || '',
          workHours: datos.workHours || 0,
          spareParts: repuestos.spareParts || []
        };
        this.dialogRef.close(maintenance);
      } else {
        this.currentStep += 1;
      }
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  getMachineModelById(id: string): string {
    const machine = this.machines.find(m => m.id === id);
    return machine ? machine.model : '-';
  }

  changeStepper(event: any) {
    this.currentStep = event;
  }

  fromatDate(date: string) {
    return format(date, "do 'de' MMMM yyyy")
  }

  getNameTechnician(idUser: string) {
    const user = this.technicals.find(item => item._id === idUser);
    return user ? `${user.firstName} ${user.lastName}` : 'Sin técnico';
  }
}
