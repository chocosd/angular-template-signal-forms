import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormMultiselectFieldComponent } from './form-multiselect-field.component';

describe('FormMultiselectFieldComponent', () => {
  let component: FormMultiselectFieldComponent;
  let fixture: ComponentFixture<FormMultiselectFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormMultiselectFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormMultiselectFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
