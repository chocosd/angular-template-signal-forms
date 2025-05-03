import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignalFormFieldsComponent } from './signal-form-fields.component';

describe('SignalFormFieldsComponent', () => {
  let component: SignalFormFieldsComponent;
  let fixture: ComponentFixture<SignalFormFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalFormFieldsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignalFormFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
