import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCorretorComponent } from './view-corretor.component';

describe('ViewCorretorComponent', () => {
  let component: ViewCorretorComponent;
  let fixture: ComponentFixture<ViewCorretorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCorretorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewCorretorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
