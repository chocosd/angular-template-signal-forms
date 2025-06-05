import { signal } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { FormStatus } from '../../../enums/form-status.enum';
import { type SignalFormContainer } from '../../../models/signal-form.model';
import { SignalFormSaveButtonComponent } from './signal-form-save-button.component';

interface TestModel {
  name: string;
}

describe('SignalFormSaveButtonComponent', () => {
  let spectator: Spectator<SignalFormSaveButtonComponent<TestModel>>;
  let mockForm: SignalFormContainer<TestModel>;
  let anyTouchedSignal = signal(false);
  let hasSavedSignal = signal(false);

  const createComponent = createComponentFactory<
    SignalFormSaveButtonComponent<TestModel>
  >({
    component: SignalFormSaveButtonComponent,
    shallow: true,
  });

  beforeEach(() => {
    anyTouchedSignal = signal(false);
    hasSavedSignal = signal(false);

    mockForm = {
      fields: [],
      getField: jest.fn(),
      getValue: jest.fn(),
      getRawValue: jest.fn(),
      getErrors: jest.fn(),
      validateForm: jest.fn(),
      reset: jest.fn(),
      save: jest.fn(),
      value: signal({ name: '' }),
      rawValue: signal({ name: '' }),
      status: signal<FormStatus>(FormStatus.Idle),
      anyTouched: anyTouchedSignal,
      anyDirty: signal(false),
      hasSaved: hasSavedSignal,
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

  it('should be disabled when form is not touched', () => {
    anyTouchedSignal.set(false);
    spectator.detectChanges();

    const button = spectator.query(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    expect(button?.disabled).toBe(true);
  });

  it('should be enabled when form is touched', () => {
    anyTouchedSignal.set(true);
    spectator.detectChanges();

    const button = spectator.query(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    expect(button?.disabled).toBe(false);
  });

  it('should call save when clicked and form is valid', () => {
    anyTouchedSignal.set(true);
    mockForm.validateForm = jest.fn().mockReturnValue(true);
    spectator.detectChanges();

    const button = spectator.query('button[type="submit"]');
    spectator.click(button!);

    expect(mockForm.save).toHaveBeenCalled();
  });

  it('should not call save when clicked and form is invalid', () => {
    anyTouchedSignal.set(true);
    mockForm.validateForm = jest.fn().mockReturnValue(false);
    spectator.detectChanges();

    const button = spectator.query('button[type="submit"]');
    spectator.click(button!);

    expect(mockForm.save).not.toHaveBeenCalled();
  });

  it('should show saved state when hasSaved is true', () => {
    hasSavedSignal.set(true);
    spectator.detectChanges();

    const button = spectator.query('button[type="submit"]');
    expect(button?.classList.contains('saved')).toBe(true);
  });
});
