import { computed, signal } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { type RuntimeChipListSignalField } from '../../../models/signal-field-types.model';
import {
  type FormOption,
  type SignalFormContainer,
} from '../../../models/signal-form.model';
import { createMockForm } from '../../../testing/mock-form.helper';
import { SignalFormChipListFieldComponent } from './signal-form-chip-list-field.component';

interface TestModel {
  tags: Array<{ label: string; value: string }>;
}

describe('SignalFormChipListFieldComponent', () => {
  let spectator: Spectator<SignalFormChipListFieldComponent<TestModel, 'tags'>>;
  let mockField: RuntimeChipListSignalField<TestModel, 'tags'>;
  let mockForm: SignalFormContainer<TestModel>;

  const createComponent = createComponentFactory<
    SignalFormChipListFieldComponent<TestModel, 'tags'>
  >({
    component: SignalFormChipListFieldComponent,
    shallow: true,
  });

  beforeEach(() => {
    mockForm = createMockForm<TestModel>({ tags: [] });

    mockField = {
      name: 'tags',
      label: 'Tags',
      type: FormFieldType.CHIPLIST,
      error: signal(null),
      touched: signal(false),
      dirty: signal(false),
      focus: signal(false),
      value: signal([]),
      path: 'tags',
      isDisabled: computed(() => false),
      isHidden: computed(() => false),
      getForm: () => mockForm,
      options: computed(
        () =>
          [
            { label: 'Tag 1', value: 'tag1' },
            { label: 'Tag 2', value: 'tag2' },
          ] as FormOption[],
      ),
      asyncError: signal(null),
      validating: signal(false),
    } as RuntimeChipListSignalField<TestModel, 'tags'>;

    spectator = createComponent({
      props: {
        field: mockField,
      },
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should render all available options', () => {
    const options = spectator.queryAll('.chip-option');
    expect(options.length).toBe(2);
    expect(options[0].textContent?.trim()).toBe('Tag 1');
    expect(options[1].textContent?.trim()).toBe('Tag 2');
  });

  it('should select option on click', () => {
    const option = spectator.query('.chip-option') as HTMLElement;
    spectator.click(option);

    expect(mockField.value()).toEqual([{ label: 'Tag 1', value: 'tag1' }]);
    expect(mockField.touched()).toBe(true);
    expect(mockField.dirty()).toBe(true);
  });

  it('should deselect option on second click', () => {
    const option = spectator.query('.chip-option') as HTMLElement;

    // First click to select
    spectator.click(option);
    expect(mockField.value()).toEqual([{ label: 'Tag 1', value: 'tag1' }]);

    // Second click to deselect
    spectator.click(option);
    expect(mockField.value()).toEqual([]);
  });

  it('should add selected class to selected options', () => {
    const option = spectator.query('.chip-option') as HTMLElement;
    spectator.click(option);

    expect(option.classList.contains('selected')).toBe(true);
  });

  it('should handle keyboard navigation with Enter', () => {
    const option = spectator.query('.chip-option') as HTMLElement;
    spectator.dispatchKeyboardEvent(option, 'keydown', 'Enter');

    expect(mockField.value()).toEqual([{ label: 'Tag 1', value: 'tag1' }]);
  });

  it('should handle keyboard navigation with Space', () => {
    const option = spectator.query('.chip-option') as HTMLElement;
    spectator.dispatchKeyboardEvent(option, 'keydown', ' ');

    expect(mockField.value()).toEqual([{ label: 'Tag 1', value: 'tag1' }]);
  });

  it('should have proper ARIA attributes', () => {
    const container = spectator.query('.chip-option-list');
    const option = spectator.query('.chip-option');

    expect(container?.getAttribute('role')).toBe('group');
    expect(container?.getAttribute('aria-labelledby')).toBe('tags-label');
    expect(option?.getAttribute('role')).toBe('checkbox');
    expect(option?.getAttribute('aria-checked')).toBe('false');
    expect(option?.getAttribute('tabindex')).toBe('0');
  });

  it('should update ARIA checked state when selected', () => {
    const option = spectator.query('.chip-option') as HTMLElement;
    spectator.click(option);

    expect(option.getAttribute('aria-checked')).toBe('true');
  });

  it('should allow multiple selections', () => {
    const options = spectator.queryAll('.chip-option');

    spectator.click(options[0]);
    spectator.click(options[1]);

    expect(mockField.value()).toEqual([
      { label: 'Tag 1', value: 'tag1' },
      { label: 'Tag 2', value: 'tag2' },
    ]);
  });

  it('should maintain selection order', () => {
    const options = spectator.queryAll('.chip-option');

    // Select in reverse order
    spectator.click(options[1]);
    spectator.click(options[0]);

    const selectedValues = mockField.value();
    expect(selectedValues[0]).toEqual({ label: 'Tag 2', value: 'tag2' });
    expect(selectedValues[1]).toEqual({ label: 'Tag 1', value: 'tag1' });
  });
});
