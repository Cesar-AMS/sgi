import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeraisComponent } from './gerais.component';

describe('GeraisComponent', () => {
  let component: GeraisComponent;
  let fixture: ComponentFixture<GeraisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeraisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeraisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
