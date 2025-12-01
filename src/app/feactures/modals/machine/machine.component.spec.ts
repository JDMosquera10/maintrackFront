import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MachineComponent } from './machine.component';

describe('MachineComponent', () => {
  let component: MachineComponent;
  let fixture: ComponentFixture<MachineComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<MachineComponent>>;

  beforeEach(async () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [MachineComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { type: 'add' } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MachineComponent);
    component = fixture.componentInstance;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<MachineComponent>>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('should have machineForm defined', () => {
  //   expect(component.machineForm).toBeDefined();
  // });

  it('should have data defined', () => {
    expect(component.data).toBeDefined();
  });

  it('should initialize form on ngOnInit', () => {
    component.ngOnInit();
    expect(component.machineForm).toBeDefined();
  });

  it('should have form with required fields', () => {
    component.ngOnInit();
    expect(component.machineForm.get('model')).toBeDefined();
    expect(component.machineForm.get('serialNumber')).toBeDefined();
    expect(component.machineForm.get('usageHours')).toBeDefined();
  });
});
