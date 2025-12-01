import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DetailsComponent } from './details.component';

describe('DetailsComponent', () => {
  let component: DetailsComponent;
  let fixture: ComponentFixture<DetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have TRADUCERTYPES defined', () => {
    expect(component.TRADUCERTYPES).toBeDefined();
  });

  it('should have displayColunmMaintenance defined', () => {
    expect(component.displayColunmMaintenance).toBeDefined();
    expect(component.displayColunmMaintenance.length).toBeGreaterThan(0);
  });

  it('should have dataSource defined', () => {
    expect(component.dataSource).toBeDefined();
  });

  it('should have dialog defined', () => {
    expect(component.dialog).toBeDefined();
  });
});
