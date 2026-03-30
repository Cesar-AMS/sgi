import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendasNewComponent } from './vendas-new.component';

describe('VendasNewComponent', () => {
  let component: VendasNewComponent;
  let fixture: ComponentFixture<VendasNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendasNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendasNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
