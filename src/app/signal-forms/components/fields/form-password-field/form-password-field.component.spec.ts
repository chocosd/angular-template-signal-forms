import { computed, signal } from '@angular/core';
import { FormFieldType } from '@enums/form-field-type.enum';
import { type RuntimePasswordSignalField } from '@models/signal-field-types.model';
import { type SignalFormContainer } from '@models/signal-form.model';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { createMockForm } from '../../../testing/mock-form.helper';
import { FormPasswordFieldComponent } from './form-password-field.component';

interface TestModel {
  password: string;
}

describe('FormPasswordFieldComponent', () => {
  let spectator: Spectator<FormPasswordFieldComponent<TestModel, 'password'>>;
  let mockField: RuntimePasswordSignalField<TestModel, 'password'>;
  let mockForm: SignalFormContainer<TestModel>;

  const createComponent = createComponentFactory<
    FormPasswordFieldComponent<TestModel, 'password'>
  >({
    component: FormPasswordFieldComponent,
    shallow: true,
  });

  beforeEach(() => {
    mockForm = createMockForm<TestModel>({ password: '' });

    mockField = {
      name: 'password',
      label: 'Password',
      type: FormFieldType.PASSWORD,
      error: signal(null),
      touched: signal(false),
      dirty: signal(false),
      focus: signal(false),
      value: signal(''),
      getForm: () => mockForm,
      path: 'password',
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

  it('should render password input with correct attributes', () => {
    const input = spectator.query('input[type="password"]');
    expect(input).toBeTruthy();
    expect(input?.classList.contains('form-input')).toBe(true);
  });

  it('should display current field value', () => {
    mockField.value.set('secret123');
    spectator.detectChanges();

    const input = spectator.query('input') as HTMLInputElement;
    expect(input.value).toBe('secret123');
  });

  it('should update field value on input', () => {
    const input = spectator.query('input') as HTMLInputElement;
    spectator.typeInElement('newpassword', input);

    expect(mockField.value()).toBe('newpassword');
  });

  it('should handle empty value', () => {
    mockField.value.set('');
    spectator.detectChanges();

    const input = spectator.query('input') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('should handle null value', () => {
    mockField.value.set(null as any);
    spectator.detectChanges();

    const input = spectator.query('input') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('should handle special characters in password', () => {
    const specialPassword = 'P@ssw0rd!#$%';
    mockField.value.set(specialPassword);
    spectator.detectChanges();

    const input = spectator.query('input') as HTMLInputElement;
    expect(input.value).toBe(specialPassword);
  });

  it('should handle long passwords', () => {
    const longPassword = 'a'.repeat(100);
    mockField.value.set(longPassword);
    spectator.detectChanges();

    const input = spectator.query('input') as HTMLInputElement;
    expect(input.value).toBe(longPassword);
  });
});
