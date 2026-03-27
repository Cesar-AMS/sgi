import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContasContabeisComponent } from './contas-contabeis.component';

describe('ContasContabeisComponent', () => {
  let component: ContasContabeisComponent;
  let fixture: ComponentFixture<ContasContabeisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContasContabeisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContasContabeisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
