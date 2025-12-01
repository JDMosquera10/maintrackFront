import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ManagementComponent } from './management.component';

describe('ManagementComponent', () => {
  let component: ManagementComponent;
  let fixture: ComponentFixture<ManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagementComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have panelOpenState defined', () => {
    expect(component.panelOpenState).toBeDefined();
  });

  it('should have panelOpenState with users property', () => {
    expect(component.panelOpenState.users).toBeDefined();
  });

  it('should have panelOpenState with roles property', () => {
    expect(component.panelOpenState.roles).toBeDefined();
  });

  it('should have panelOpenState with permissions property', () => {
    expect(component.panelOpenState.permissions).toBeDefined();
  });
});

