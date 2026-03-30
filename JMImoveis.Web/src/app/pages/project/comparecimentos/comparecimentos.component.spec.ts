import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparecimentosComponent } from './comparecimentos.component';

describe('ComparecimentosComponent', () => {
  let component: ComparecimentosComponent;
  let fixture: ComponentFixture<ComparecimentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComparecimentosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparecimentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
