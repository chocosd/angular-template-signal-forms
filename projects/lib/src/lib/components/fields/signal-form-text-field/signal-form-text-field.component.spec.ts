import { computed, signal } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { type RuntimeTextSignalField } from '../../../models/signal-field-types.model';
import { type SignalFormContainer } from '../../../models/signal-form.model';
import { createMockForm } from '../../../testing/mock-form.helper';
import { SignalFormTextFieldComponent } from './signal-form-text-field.component';

interface TestModel {
  name: string;
}

describe('SignalFormTextFieldComponent', () => {
  let spectator: Spectator<SignalFormTextFieldComponent<TestModel, 'name'>>;
  let mockField: RuntimeTextSignalField<TestModel, 'name'>;
  let mockForm: SignalFormContainer<TestModel>;

  const createComponent = createComponentFactory<
    SignalFormTextFieldComponent<TestModel, 'name'>
  >({
    component: SignalFormTextFieldComponent,
    shallow: true,
  });

  beforeEach(() => {
    mockForm = createMockForm<TestModel>({ name: '' });

    mockField = {
      name: 'name',
      label: 'Name',
      type: FormFieldType.TEXT,
      error: signal(null),
      touched: signal(false),
      dirty: signal(false),
      focus: signal(false),
      value: signal(''),
      getForm: () => mockForm,
      path: 'name',
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

  it('should render text input with correct attributes', () => {
    const input = spectator.query('input[type="text"]');
    expect(input).toBeTruthy();
    expect(input?.classList.contains('form-input')).toBe(true);
  });

  it('should display current field value', () => {
    mockField.value.set('Test Value');
    spectator.detectChanges();

    const input = spectator.query('input') as HTMLInputElement;
    expect(input.value).toBe('Test Value');
  });

  it('should update field value on input', () => {
    const input = spectator.query('input') as HTMLInputElement;
    spectator.typeInElement('New Value', input);

    expect(mockField.value()).toBe('New Value');
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
});
