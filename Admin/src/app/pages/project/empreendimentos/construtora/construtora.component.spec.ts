import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstrutoraComponent } from './construtora.component';

describe('ConstrutoraComponent', () => {
  let component: ConstrutoraComponent;
  let fixture: ComponentFixture<ConstrutoraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConstrutoraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConstrutoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
