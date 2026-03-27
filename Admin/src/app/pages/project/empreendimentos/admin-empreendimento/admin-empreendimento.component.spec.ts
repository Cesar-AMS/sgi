import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEmpreendimentoComponent } from './admin-empreendimento.component';

describe('AdminEmpreendimentoComponent', () => {
  let component: AdminEmpreendimentoComponent;
  let fixture: ComponentFixture<AdminEmpreendimentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEmpreendimentoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEmpreendimentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
