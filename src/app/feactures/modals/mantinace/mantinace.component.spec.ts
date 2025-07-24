import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantinaceComponent } from './mantinace.component';

describe('MantinaceComponent', () => {
  let component: MantinaceComponent;
  let fixture: ComponentFixture<MantinaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MantinaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MantinaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
