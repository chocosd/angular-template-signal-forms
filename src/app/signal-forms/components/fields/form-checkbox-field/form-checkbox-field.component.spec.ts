import { computed, signal } from '@angular/core';
import { FormFieldType } from '@enums/form-field-type.enum';
import { type RuntimeCheckboxSignalField } from '@models/signal-field-types.model';
import { type SignalFormContainer } from '@models/signal-form.model';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { createMockForm } from '../../../testing/mock-form.helper';
import { FormCheckboxFieldComponent } from './form-checkbox-field.component';

interface TestModel {
  isActive: boolean;
}

describe('FormCheckboxFieldComponent', () => {
  let spectator: Spectator<FormCheckboxFieldComponent<TestModel, 'isActive'>>;
  let mockField: RuntimeCheckboxSignalField<TestModel, 'isActive'>;
  let mockForm: SignalFormContainer<TestModel>;

  const createComponent = createComponentFactory<
    FormCheckboxFieldComponent<TestModel, 'isActive'>
  >({
    component: FormCheckboxFieldComponent,
    shallow: true,
  });

  beforeEach(() => {
    mockForm = createMockForm<TestModel>({ isActive: false });

    mockField = {
      name: 'isActive',
      label: 'Is Active',
      type: FormFieldType.CHECKBOX,
      error: signal(null),
      touched: signal(false),
      dirty: signal(false),
      focus: signal(false),
      value: signal(false),
      getForm: () => mockForm,
      path: 'isActive',
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

  it('should render label wrapper with correct attributes', () => {
    const label = spectator.query('.form-checkbox-wrapper');
    expect(label).toBeTruthy();
    expect(label?.getAttribute('for')).toBe('isActive');
  });

  it('should render checkbox input with correct attributes', () => {
    const input = spectator.query('input[type="checkbox"]');
    expect(input).toBeTruthy();
    expect(input?.classList.contains('checkbox')).toBe(true);
  });

  it('should display field label', () => {
    const labelText = spectator.query('.form-checkbox-label');
    expect(labelText?.textContent?.trim()).toBe('Is Active');
  });

  it('should reflect checked state from field value', () => {
    mockField.value.set(true);
    spectator.detectChanges();

    const input = spectator.query('input') as HTMLInputElement;
    expect(input.checked).toBe(true);
  });

  it('should reflect unchecked state from field value', () => {
    mockField.value.set(false);
    spectator.detectChanges();

    const input = spectator.query('input') as HTMLInputElement;
    expect(input.checked).toBe(false);
  });

  it('should update field value when checkbox is clicked', () => {
    const input = spectator.query('input') as HTMLInputElement;
    spectator.click(input);

    expect(mockField.value()).toBe(true);
  });

  it('should toggle field value when clicked multiple times', () => {
    const input = spectator.query('input') as HTMLInputElement;

    spectator.click(input);
    expect(mockField.value()).toBe(true);

    spectator.click(input);
    expect(mockField.value()).toBe(false);
  });

  it('should handle null value gracefully', () => {
    mockField.value.set(null as any);
    spectator.detectChanges();

    const input = spectator.query('input') as HTMLInputElement;
    expect(input.checked).toBe(false);
  });

  it('should handle truthy values as checked', () => {
    mockField.value.set('yes' as any);
    spectator.detectChanges();

    const input = spectator.query('input') as HTMLInputElement;
    expect(input.checked).toBe(true);
  });

  it('should handle falsy values as unchecked', () => {
    mockField.value.set(0 as any);
    spectator.detectChanges();

    const input = spectator.query('input') as HTMLInputElement;
    expect(input.checked).toBe(false);
  });

  it('should handle array values correctly', () => {
    // Implementation of the new test case
  });
});
