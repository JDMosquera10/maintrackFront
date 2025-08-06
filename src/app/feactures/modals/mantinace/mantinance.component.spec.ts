import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantinanceComponent } from './mantinance.component';

describe('MantinanceComponent', () => {
  let component: MantinanceComponent;
  let fixture: ComponentFixture<MantinanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MantinanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MantinanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
