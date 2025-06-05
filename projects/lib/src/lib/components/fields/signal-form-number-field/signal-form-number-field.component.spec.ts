import { computed, signal } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { type RuntimeNumberSignalField } from '../../../models/signal-field-types.model';
import { type SignalFormContainer } from '../../../models/signal-form.model';
import { createMockForm } from '../../../testing/mock-form.helper';
import { SignalFormNumberFieldComponent } from './signal-form-number-field.component';

interface TestModel {
  age: number;
}

describe('SignalFormNumberFieldComponent', () => {
  let spectator: Spectator<SignalFormNumberFieldComponent<TestModel, 'age'>>;
  let mockField: RuntimeNumberSignalField<TestModel, 'age'>;
  let mockForm: SignalFormContainer<TestModel>;

  const createComponent = createComponentFactory<
    SignalFormNumberFieldComponent<TestModel, 'age'>
  >({
    component: SignalFormNumberFieldComponent,
    shallow: true,
  });

  beforeEach(() => {
    mockForm = createMockForm<TestModel>({ age: 0 });

    mockField = {
      name: 'age',
      label: 'Age',
      type: FormFieldType.NUMBER,
      error: signal(null),
      touched: signal(false),
      dirty: signal(false),
      focus: signal(false),
      value: signal(0),
      getForm: () => mockForm,
      path: 'age',
      isDisabled: computed(() => false),
      isHidden: computed(() => false),
      config: {},
    } as any;

    spectator = createComponent({
      props: {
        field: mockField,
      },
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should render input wrapper with correct class', () => {
    const wrapper = spectator.query('.form-input-wrapper');
    expect(wrapper).toBeTruthy();
  });

  it('should render number input with correct attributes', () => {
    const input = spectator.query('input[type="number"]');
    expect(input).toBeTruthy();
    expect(input?.classList.contains('form-input')).toBe(true);
  });

  it('should display current field value', () => {
    mockField.value.set(25);
    spectator.detectChanges();

    const input = spectator.query('input') as HTMLInputElement;
    expect(input.valueAsNumber).toBe(25);
  });

  it('should update field value on input', () => {
    const input = spectator.query('input') as HTMLInputElement;
    spectator.typeInElement('42', input);

    expect(mockField.value()).toBe(42);
  });

  it('should handle zero value', () => {
    mockField.value.set(0);
    spectator.detectChanges();

    const input = spectator.query('input') as HTMLInputElement;
    expect(input.valueAsNumber).toBe(0);
  });

  it('should handle negative numbers', () => {
    mockField.value.set(-10);
    spectator.detectChanges();

    const input = spectator.query('input') as HTMLInputElement;
    expect(input.valueAsNumber).toBe(-10);
  });

  it('should handle decimal numbers', () => {
    mockField.value.set(3.14);
    spectator.detectChanges();

    const input = spectator.query('input') as HTMLInputElement;
    expect(input.valueAsNumber).toBe(3.14);
  });

  it('should handle null value', () => {
    mockField.value.set(null as any);
    spectator.detectChanges();

    const input = spectator.query('input') as HTMLInputElement;
    expect(isNaN(input.valueAsNumber)).toBe(true);
  });
});
