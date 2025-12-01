import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MachinesComponent } from './machines.component';

describe('MachinesComponent', () => {
  let component: MachinesComponent;
  let fixture: ComponentFixture<MachinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MachinesComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MachinesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have TRADUCERSTATES defined', () => {
    expect(component.TRADUCERSTATES).toBeDefined();
  });

  it('should have displayedColumns defined', () => {
    expect(component.displayedColumns).toBeDefined();
    expect(component.displayedColumns.length).toBeGreaterThan(0);
  });

  it('should have dataSource defined', () => {
    expect(component.dataSource).toBeDefined();
  });

  it('should have dialog defined', () => {
    expect(component.dialog).toBeDefined();
  });
});
