import { computed, signal } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { SignalModelDirective } from '../../../directives/signal-model.directive';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { type RuntimeSelectSignalField } from '../../../models/signal-field-types.model';
import {
  type FormOption,
  type SignalFormContainer,
} from '../../../models/signal-form.model';
import { createMockForm } from '../../../testing/mock-form.helper';
import { SignalFormSelectFieldComponent } from './signal-form-select-field.component';

interface TestModel {
  category: string;
}

describe('SignalFormSelectFieldComponent', () => {
  let spectator: Spectator<
    SignalFormSelectFieldComponent<TestModel, 'category'>
  >;
  let mockField: RuntimeSelectSignalField<TestModel, 'category'>;
  let mockForm: SignalFormContainer<TestModel>;

  const createComponent = createComponentFactory<
    SignalFormSelectFieldComponent<TestModel, 'category'>
  >({
    component: SignalFormSelectFieldComponent,
    imports: [SignalModelDirective],
    shallow: true,
  });

  beforeEach(() => {
    mockForm = createMockForm<TestModel>({ category: '' });

    mockField = {
      name: 'category',
      label: 'Category',
      type: FormFieldType.SELECT,
      error: signal(null),
      touched: signal(false),
      dirty: signal(false),
      focus: signal(false),
      value: signal(''),
      getForm: () => mockForm,
      path: 'category',
      isDisabled: computed(() => false),
      isHidden: computed(() => false),
      options: computed<FormOption<string>[]>(() => [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' },
      ]),
      config: {
        placeholder: 'Select an option',
      },
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

  it('should render select wrapper with correct attributes', () => {
    const wrapper = spectator.query('.form-select-wrapper');
    expect(wrapper).toBeTruthy();
    expect(wrapper?.getAttribute('role')).toBe('combobox');
    expect(wrapper?.getAttribute('aria-expanded')).toBe('false');
  });

  it('should display placeholder when no value is selected', () => {
    const display = spectator.query('.form-select-display');
    expect(display?.textContent?.trim()).toBe('Select an option');
  });

  it('should display selected option label', () => {
    mockField.value.set({ label: 'Option 2', value: 'option2' });
    spectator.detectChanges();

    const display = spectator.query('.form-select-display');
    expect(display?.textContent?.trim()).toBe('Option 2');
  });

  it('should render dropdown arrow', () => {
    const arrow = spectator.query('.form-select-arrow');
    expect(arrow).toBeTruthy();
    expect(arrow?.textContent?.trim()).toBe('▾');
  });

  it('should toggle dropdown when clicked', () => {
    const wrapper = spectator.query('.form-select-wrapper') as HTMLElement;
    spectator.click(wrapper);

    expect(spectator.component['showDropdown']()).toBe(true);
  });

  it('should toggle dropdown on Enter key', () => {
    const wrapper = spectator.query('.form-select-wrapper') as HTMLElement;
    spectator.dispatchKeyboardEvent(wrapper, 'keydown', 'Enter');

    expect(spectator.component['showDropdown']()).toBe(true);
  });

  it('should update aria-expanded when dropdown is toggled', () => {
    const wrapper = spectator.query('.form-select-wrapper');

    spectator.component.toggleDropdown();
    spectator.detectChanges();

    expect(wrapper?.getAttribute('aria-expanded')).toBe('true');
  });

  it('should handle FormOption object as value', () => {
    const optionValue: FormOption<string> = {
      label: 'Option 1',
      value: 'option1',
    };
    mockField.value.set(optionValue as any);
    spectator.detectChanges();

    const display = spectator.query('.form-select-display');
    expect(display?.textContent?.trim()).toBe('Option 1');
  });

  it('should handle null value gracefully', () => {
    mockField.value.set(null as any);
    spectator.detectChanges();

    const display = spectator.query('.form-select-display');
    expect(display?.textContent?.trim()).toBe('Select an option');
  });

  it('should handle empty string value', () => {
    mockField.value.set({ label: '', value: '' });
    spectator.detectChanges();

    const display = spectator.query('.form-select-display');
    expect(display?.textContent?.trim()).toBe('Select an option');
  });

  it('should handle unknown value gracefully', () => {
    mockField.value.set({ label: 'Unknown Value', value: 'unknown-value' });
    spectator.detectChanges();

    const display = spectator.query('.form-select-display');
    expect(display?.textContent?.trim()).toBe('Unknown Value');
  });

  it('should display placeholder when no config placeholder is provided', () => {
    mockField.config = {};
    mockField.value.set(null as any);
    spectator.detectChanges();

    const display = spectator.query('.form-select-display');
    expect(display?.textContent?.trim()).toBe('');
  });

  it('should call displayValue method correctly', () => {
    const result = spectator.component.displayValue();
    expect(result).toBe('Select an option');

    mockField.config = {};
    mockField.value.set(null as any);
    const resultEmpty = spectator.component.displayValue();
    expect(resultEmpty).toBe('');
  });

  it('should call toggleDropdown method when wrapper is clicked', () => {
    const toggleSpy = jest.spyOn(spectator.component, 'toggleDropdown');
    const wrapper = spectator.query('.form-select-wrapper') as HTMLElement;

    spectator.click(wrapper);

    expect(toggleSpy).toHaveBeenCalled();
  });
});
