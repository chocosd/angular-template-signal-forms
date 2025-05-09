import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormChipListFieldComponent } from './form-chip-list-field.component';

describe('FormChipListFieldComponent', () => {
  let component: FormChipListFieldComponent;
  let fixture: ComponentFixture<FormChipListFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormChipListFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormChipListFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
