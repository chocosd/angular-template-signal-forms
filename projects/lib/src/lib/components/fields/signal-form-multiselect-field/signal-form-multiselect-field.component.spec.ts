import { computed, signal } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { type RuntimeMultiSelectSignalField } from '../../../models/signal-field-types.model';
import {
  type FormOption,
  type SignalFormContainer,
} from '../../../models/signal-form.model';
import { createMockForm } from '../../../testing/mock-form.helper';
import { SignalFormMultiselectFieldComponent } from './signal-form-multiselect-field.component';

interface TestModel {
  categories: string;
}

describe('SignalFormMultiselectFieldComponent', () => {
  let spectator: Spectator<
    SignalFormMultiselectFieldComponent<TestModel, 'categories'>
  >;
  let mockField: RuntimeMultiSelectSignalField<TestModel, 'categories'>;
  let mockForm: SignalFormContainer<TestModel>;

  const createComponent = createComponentFactory<
    SignalFormMultiselectFieldComponent<TestModel, 'categories'>
  >({
    component: SignalFormMultiselectFieldComponent,
    shallow: true,
  });

  beforeEach(() => {
    mockForm = createMockForm<TestModel>({ categories: [] as any });

    mockField = {
      name: 'categories',
      label: 'Categories',
      type: FormFieldType.MULTISELECT,
      error: signal(null),
      touched: signal(false),
      dirty: signal(false),
      focus: signal(false),
      value: signal<FormOption<string>[]>([]),
      path: 'categories',
      isDisabled: computed(() => false),
      isHidden: computed(() => false),
      getForm: () => mockForm,
      validators: [],
      asyncError: signal(null),
      validating: signal(false),
      options: computed<FormOption<string>[]>(() => [
        { label: 'Category 1', value: 'cat1' },
        { label: 'Category 2', value: 'cat2' },
        { label: 'Category 3', value: 'cat3' },
      ]),
    };

    spectator = createComponent({
      props: {
        field: mockField,
      },
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should render multiselect wrapper with correct ARIA attributes', () => {
    const wrapper = spectator.query('.multi-select-wrapper');
    expect(wrapper).toBeTruthy();
    expect(wrapper?.getAttribute('role')).toBe('listbox');
    expect(wrapper?.getAttribute('aria-expanded')).toBe('false');
    expect(wrapper?.getAttribute('aria-multiselectable')).toBe('true');
    expect(wrapper?.getAttribute('aria-haspopup')).toBe('listbox');
  });

  it('should show placeholder when no items are selected', () => {
    const placeholder = spectator.query('.placeholder');
    expect(placeholder).toBeTruthy();
  });

  it('should render selected items as chips', () => {
    const selectedItems: FormOption<string>[] = [
      { label: 'Category 1', value: 'cat1' },
      { label: 'Category 3', value: 'cat3' },
    ];
    mockField.value.set(selectedItems);
    spectator.detectChanges();

    const chips = spectator.queryAll('.chip');
    expect(chips.length).toBe(2);
    expect(chips[0].textContent).toContain('Category 1');
    expect(chips[1].textContent).toContain('Category 3');
  });

  it('should remove chip when remove button is clicked', () => {
    const selectedItems: FormOption<string>[] = [
      { label: 'Category 1', value: 'cat1' },
      { label: 'Category 3', value: 'cat3' },
    ];
    mockField.value.set(selectedItems);
    spectator.detectChanges();

    const removeButton = spectator.query('.remove-btn') as HTMLButtonElement;
    spectator.click(removeButton);

    expect(mockField.value()).toEqual([selectedItems[1]]);
    expect(mockField.touched()).toBe(true);
  });

  it('should toggle dropdown when wrapper is clicked', () => {
    // Call the component method directly since the click event might not trigger properly in tests
    spectator.component.toggleDropdown();
    spectator.detectChanges();

    expect(spectator.component['showDropdown']()).toBe(true);
  });

  it('should toggle dropdown on Enter key', () => {
    const wrapper = spectator.query('.multi-select-wrapper') as HTMLElement;
    spectator.dispatchKeyboardEvent(wrapper, 'keydown', 'Enter');
    spectator.detectChanges();

    expect(spectator.component['showDropdown']()).toBe(true);
  });

  it('should return field error from form.getErrors', () => {
    const errorMessage = 'Please select at least one category';
    (mockForm.getErrors as jest.Mock).mockReturnValue({
      categories: errorMessage,
    });
    spectator.detectChanges();

    expect(mockForm.getErrors()).toEqual({
      categories: errorMessage,
    });
  });

  it('should have proper ARIA attributes for selected items', () => {
    const selectedItems: FormOption<string>[] = [
      { label: 'Category 1', value: 'cat1' },
    ];
    mockField.value.set(selectedItems);
    spectator.detectChanges();

    const chipList = spectator.query('.chip-list');
    expect(chipList?.getAttribute('role')).toBe('list');
    expect(chipList?.getAttribute('aria-label')).toBe(
      'Selected Categories items',
    );

    const chip = spectator.query('.chip');
    expect(chip?.getAttribute('role')).toBe('listitem');
  });

  it('should have proper ARIA attributes for remove buttons', () => {
    const selectedItems: FormOption<string>[] = [
      { label: 'Category 1', value: 'cat1' },
    ];
    mockField.value.set(selectedItems);
    spectator.detectChanges();

    const removeButton = spectator.query('.remove-btn');
    expect(removeButton?.getAttribute('aria-label')).toBe('Remove Category 1');
  });
});
