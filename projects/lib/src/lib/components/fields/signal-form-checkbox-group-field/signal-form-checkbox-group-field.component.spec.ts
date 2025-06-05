import { computed, signal } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { type RuntimeCheckboxGroupSignalField } from '../../../models/signal-field-types.model';
import { type SignalFormContainer } from '../../../models/signal-form.model';
import { createMockForm } from '../../../testing/mock-form.helper';
import { SignalFormCheckboxGroupFieldComponent } from './signal-form-checkbox-group-field.component';

interface TestModel {
  options: string[];
}

describe('SignalFormCheckboxGroupFieldComponent', () => {
  let spectator: Spectator<
    SignalFormCheckboxGroupFieldComponent<TestModel, 'options'>
  >;
  let mockField: RuntimeCheckboxGroupSignalField<TestModel, 'options'>;
  let mockForm: SignalFormContainer<TestModel>;

  const createComponent = createComponentFactory<
    SignalFormCheckboxGroupFieldComponent<TestModel, 'options'>
  >({
    component: SignalFormCheckboxGroupFieldComponent,
    shallow: true,
  });

  beforeEach(() => {
    mockForm = createMockForm<TestModel>({ options: [] });

    // Create mock field
    mockField = {
      name: 'options',
      label: 'Options',
      type: FormFieldType.CHECKBOX_GROUP,
      error: signal(null),
      touched: signal(false),
      dirty: signal(false),
      focus: signal(false),
      value: signal([]),
      getForm: () => mockForm,
      path: 'options',
      isDisabled: computed(() => false),
      isHidden: computed(() => false),
      options: computed(() => [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' },
      ]),
      config: {
        layout: 'stacked',
        valueType: 'array',
      },
    } as any; // Use any to bypass complex type issues

    spectator = createComponent({
      props: {
        field: mockField,
      },
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should render fieldset with proper ARIA attributes', () => {
    const fieldset = spectator.query('fieldset');
    expect(fieldset).toBeTruthy();
    expect(fieldset?.getAttribute('role')).toBe('group');
    expect(fieldset?.classList.contains('form-checkbox-group')).toBe(true);
  });

  it('should render legend with field label', () => {
    const legend = spectator.query('legend');
    expect(legend?.textContent?.trim()).toBe('Options');
    expect(legend?.classList.contains('sr-only')).toBe(true);
  });

  it('should render all checkbox options', () => {
    const checkboxes = spectator.queryAll('input[type="checkbox"]');
    const labels = spectator.queryAll('.label-text');

    expect(checkboxes.length).toBe(3);
    expect(labels.length).toBe(3);
    expect(labels[0].textContent?.trim()).toBe('Option 1');
    expect(labels[1].textContent?.trim()).toBe('Option 2');
    expect(labels[2].textContent?.trim()).toBe('Option 3');
  });

  it('should apply stacked layout class by default', () => {
    const fieldset = spectator.query('fieldset');
    expect(fieldset?.classList.contains('checkbox-group-stacked')).toBe(true);
  });

  it('should apply inline layout class when configured', () => {
    // Create a new field with inline layout
    const inlineField = {
      ...mockField,
      config: { layout: 'inline', valueType: 'array' },
    } as any;

    spectator = createComponent({
      props: {
        field: inlineField,
      },
    });

    const fieldset = spectator.query('fieldset');
    expect(fieldset?.classList.contains('checkbox-group-inline')).toBe(true);
  });

  it('should check checkbox when option is selected (array mode)', () => {
    mockField.value.set(['option1', 'option3']);
    spectator.detectChanges();

    const checkboxes = spectator.queryAll('input[type="checkbox"]');
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(false);
    expect((checkboxes[2] as HTMLInputElement).checked).toBe(true);
  });

  it('should toggle option on checkbox change (array mode)', () => {
    const checkbox = spectator.query(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    spectator.click(checkbox);

    expect(mockField.value()).toEqual(['option1']);
    expect(mockField.touched()).toBe(true);
    expect(mockField.dirty()).toBe(true);
  });

  it('should remove option when unchecking (array mode)', () => {
    mockField.value.set(['option1', 'option2']);
    spectator.detectChanges();

    const checkbox = spectator.query(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    spectator.click(checkbox);

    expect(mockField.value()).toEqual(['option2']);
  });

  it('should handle multiple selections (array mode)', () => {
    const checkboxes = spectator.queryAll('input[type="checkbox"]');

    spectator.click(checkboxes[0]);
    spectator.click(checkboxes[2]);

    expect(mockField.value()).toEqual(['option1', 'option3']);
  });

  describe('Map value type', () => {
    beforeEach(() => {
      mockField.config = { layout: 'stacked', valueType: 'map' };
      mockField.value.set({});
      spectator.detectChanges();
    });

    it('should check checkbox when option is selected (map mode)', () => {
      mockField.value.set({ option1: true, option2: false, option3: true });
      spectator.detectChanges();

      const checkboxes = spectator.queryAll('input[type="checkbox"]');
      expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
      expect((checkboxes[1] as HTMLInputElement).checked).toBe(false);
      expect((checkboxes[2] as HTMLInputElement).checked).toBe(true);
    });

    it('should toggle option on checkbox change (map mode)', () => {
      const checkbox = spectator.query(
        'input[type="checkbox"]',
      ) as HTMLInputElement;
      spectator.click(checkbox);

      const result = mockField.value() as Record<string, boolean>;
      expect(result['option1']).toBe(true);
      expect(result['option2']).toBe(false);
      expect(result['option3']).toBe(false);
    });

    it('should create full record with all options (map mode)', () => {
      const checkboxes = spectator.queryAll('input[type="checkbox"]');
      spectator.click(checkboxes[1]); // Select option2

      const result = mockField.value() as Record<string, boolean>;
      expect(result).toEqual({
        option1: false,
        option2: true,
        option3: false,
      });
    });

    it('should toggle existing selection (map mode)', () => {
      mockField.value.set({ option1: true, option2: false, option3: false });
      spectator.detectChanges();

      const checkbox = spectator.query(
        'input[type="checkbox"]',
      ) as HTMLInputElement;
      spectator.click(checkbox); // Uncheck option1

      const result = mockField.value() as Record<string, boolean>;
      expect(result['option1']).toBe(false);
    });
  });

  it('should handle null/undefined value gracefully', () => {
    mockField.value.set(null as any);
    spectator.detectChanges();

    const checkboxes = spectator.queryAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      expect((checkbox as HTMLInputElement).checked).toBe(false);
    });
  });

  it('should set correct checkbox values', () => {
    const checkboxes = spectator.queryAll('input[type="checkbox"]');
    expect((checkboxes[0] as HTMLInputElement).value).toBe('option1');
    expect((checkboxes[1] as HTMLInputElement).value).toBe('option2');
    expect((checkboxes[2] as HTMLInputElement).value).toBe('option3');
  });
});
