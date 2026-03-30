import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DreComponent } from './dre.component';

describe('DreComponent', () => {
  let component: DreComponent;
  let fixture: ComponentFixture<DreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
