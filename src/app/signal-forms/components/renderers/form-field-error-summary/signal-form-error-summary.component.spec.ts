import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignalFormErrorSummaryComponent } from './signal-form-error-summary.component';

describe('SignalFormErrorSummaryComponent', () => {
  let component: SignalFormErrorSummaryComponent<unknown>;
  let fixture: ComponentFixture<SignalFormErrorSummaryComponent<unknown>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalFormErrorSummaryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SignalFormErrorSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
