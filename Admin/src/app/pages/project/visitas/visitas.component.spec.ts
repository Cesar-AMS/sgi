import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitasComponent } from './visitas.component';

describe('VisitasComponent', () => {
  let component: VisitasComponent;
  let fixture: ComponentFixture<VisitasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
