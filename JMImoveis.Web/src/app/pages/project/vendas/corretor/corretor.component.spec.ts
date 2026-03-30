import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorretorComponent } from './corretor.component';

describe('CorretorComponent', () => {
  let component: CorretorComponent;
  let fixture: ComponentFixture<CorretorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorretorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorretorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
