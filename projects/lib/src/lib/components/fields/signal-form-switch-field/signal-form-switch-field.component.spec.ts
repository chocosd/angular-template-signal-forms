import { computed, signal } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { type RuntimeSwitchSignalField } from '../../../models/signal-field-types.model';
import { type SignalFormContainer } from '../../../models/signal-form.model';
import { createMockForm } from '../../../testing/mock-form.helper';
import { SignalFormSwitchFieldComponent } from './signal-form-switch-field.component';

interface TestModel {
  isEnabled: boolean;
}

describe('SignalFormSwitchFieldComponent', () => {
  let spectator: Spectator<
    SignalFormSwitchFieldComponent<TestModel, 'isEnabled'>
  >;
  let mockField: RuntimeSwitchSignalField<TestModel, 'isEnabled'>;
  let mockForm: SignalFormContainer<TestModel>;

  const createComponent = createComponentFactory<
    SignalFormSwitchFieldComponent<TestModel, 'isEnabled'>
  >({
    component: SignalFormSwitchFieldComponent,
    shallow: true,
  });

  beforeEach(() => {
    mockForm = createMockForm<TestModel>({ isEnabled: false });

    mockField = {
      name: 'isEnabled',
      label: 'Is Enabled',
      type: FormFieldType.SWITCH,
      error: signal(null),
      touched: signal(false),
      dirty: signal(false),
      focus: signal(false),
      value: signal(false),
      getForm: () => mockForm,
      path: 'isEnabled',
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

  it('should render switch wrapper', () => {
    const wrapper = spectator.query('.switch-wrapper');
    expect(wrapper).toBeTruthy();
  });

  it('should render switch input with correct attributes', () => {
    const input = spectator.query('input[type="checkbox"]');
    expect(input).toBeTruthy();
    expect(input?.getAttribute('role')).toBe('switch');
    expect(input?.classList.contains('switch-input')).toBe(true);
  });

  it('should render switch slider', () => {
    const slider = spectator.query('.switch-slider');
    expect(slider).toBeTruthy();
    expect(slider?.getAttribute('aria-hidden')).toBe('true');
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

  it('should update field value when switch is clicked', () => {
    const input = spectator.query('input') as HTMLInputElement;
    spectator.click(input);

    expect(mockField.value()).toBe(true);
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
});
