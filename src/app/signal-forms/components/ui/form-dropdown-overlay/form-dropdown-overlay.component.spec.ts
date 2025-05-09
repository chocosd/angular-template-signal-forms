import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDropdownOverlayComponent } from './form-dropdown-overlay.component';

describe('FormDropdownOverlayComponent', () => {
  let component: FormDropdownOverlayComponent;
  let fixture: ComponentFixture<FormDropdownOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormDropdownOverlayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormDropdownOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
