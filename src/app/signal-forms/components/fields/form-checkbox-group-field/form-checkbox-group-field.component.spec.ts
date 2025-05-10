import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCheckboxGroupFieldComponent } from './form-checkbox-group-field.component';

describe('FormCheckboxGroupFieldComponent', () => {
  let component: FormCheckboxGroupFieldComponent;
  let fixture: ComponentFixture<FormCheckboxGroupFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCheckboxGroupFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormCheckboxGroupFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
