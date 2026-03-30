import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardVendasComponent } from './dashboard-vendas.component';

describe('DashboardVendasComponent', () => {
  let component: DashboardVendasComponent;
  let fixture: ComponentFixture<DashboardVendasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardVendasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardVendasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
