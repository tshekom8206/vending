import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstateFormComponent } from './estate-form.component';

describe('EstateFormComponent', () => {
  let component: EstateFormComponent;
  let fixture: ComponentFixture<EstateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstateFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EstateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
