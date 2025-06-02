import { signal } from '@angular/core';
import { FormStatus } from '@enums/form-status.enum';
import {
  type ErrorMessage,
  type SignalFormContainer,
} from '@models/signal-form.model';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { SignalFormErrorSummaryComponent } from './signal-form-error-summary.component';

interface TestModel {
  name: string;
  email: string;
}

describe('SignalFormErrorSummaryComponent', () => {
  let spectator: Spectator<SignalFormErrorSummaryComponent<TestModel>>;
  let mockForm: SignalFormContainer<TestModel>;
  let errorsSignal = signal<ErrorMessage<TestModel>[]>([]);

  const createComponent = createComponentFactory<
    SignalFormErrorSummaryComponent<TestModel>
  >({
    component: SignalFormErrorSummaryComponent,
    shallow: true,
  });

  beforeEach(() => {
    errorsSignal = signal<ErrorMessage<TestModel>[]>([]);

    mockForm = {
      fields: [],
      getField: jest.fn(),
      getValue: jest.fn(),
      getRawValue: jest.fn(),
      getErrors: jest.fn(() => errorsSignal()),
      validateForm: jest.fn(),
      reset: jest.fn(),
      save: jest.fn(),
      value: signal({ name: '', email: '' }),
      rawValue: signal({ name: '', email: '' }),
      status: signal<FormStatus>(FormStatus.Idle),
      anyTouched: signal(false),
      anyDirty: signal(false),
      hasSaved: signal(false),
      patchValue: jest.fn(),
      setValue: jest.fn(),
      config: { layout: 'flex' },
      parentForm: null,
    } as unknown as SignalFormContainer<TestModel>;

    spectator = createComponent({
      props: {
        form: mockForm,
      },
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should not display error summary when form has no errors', () => {
    const errorSummary = spectator.query('.form-error-summary');
    expect(errorSummary).toBeFalsy();
  });

  it('should display current error when form has errors', () => {
    const errors: ErrorMessage<TestModel>[] = [
      {
        name: 'name' as keyof TestModel,
        message: 'Name is required',
        path: 'name',
      },
      {
        name: 'email' as keyof TestModel,
        message: 'Invalid email format',
        path: 'email',
      },
    ];

    errorsSignal.set(errors);
    spectator.detectChanges();

    const errorSummary = spectator.query('.form-error-summary');
    expect(errorSummary).toBeTruthy();
    expect(errorSummary?.textContent).toContain('Name is required');
  });

  it('should clear errors when form becomes valid', () => {
    // First set errors
    const errors: ErrorMessage<TestModel>[] = [
      {
        name: 'name' as keyof TestModel,
        message: 'Name is required',
        path: 'name',
      },
    ];
    errorsSignal.set(errors);
    spectator.detectChanges();

    // Verify error is shown
    expect(spectator.query('.form-error-summary')).toBeTruthy();

    // Clear errors
    errorsSignal.set([]);
    spectator.detectChanges();

    // Verify errors are cleared
    expect(spectator.query('.form-error-summary')).toBeFalsy();
  });

  it('should navigate between errors', () => {
    const errors: ErrorMessage<TestModel>[] = [
      {
        name: 'name' as keyof TestModel,
        message: 'Name is required',
        path: 'name',
      },
      {
        name: 'email' as keyof TestModel,
        message: 'Invalid email format',
        path: 'email',
      },
    ];

    errorsSignal.set(errors);
    spectator.detectChanges();

    const errorSummary = spectator.query('.form-error-summary');
    expect(errorSummary?.textContent).toContain('Name is required');

    // Click next button to navigate to next error
    const nextButton = spectator.queryAll('button')[1];
    spectator.click(nextButton);
    spectator.detectChanges();

    expect(errorSummary?.textContent).toContain('Invalid email format');

    // Click previous button to go back
    const prevButton = spectator.queryAll('button')[0];
    spectator.click(prevButton);
    spectator.detectChanges();

    expect(errorSummary?.textContent).toContain('Name is required');
  });
});
