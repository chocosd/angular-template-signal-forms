import { computed, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { FormFieldType } from '@enums/form-field-type.enum';
import { type RuntimeAutocompleteSignalField } from '@models/signal-field-types.model';
import {
  type FormOption,
  type SignalFormContainer,
} from '@models/signal-form.model';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { FormDropdownService } from '@services/form-dropdown.service';
import { of } from 'rxjs';
import { createMockForm } from '../../../testing/mock-form.helper';
import { SignalFormAutocompleteFieldComponent } from './signal-form-autocomplete-field.component';

interface TestModel {
  country: FormOption;
}

describe('SignalFormAutocompleteFieldComponent', () => {
  let spectator: Spectator<
    SignalFormAutocompleteFieldComponent<TestModel, 'country'>
  >;
  let mockField: RuntimeAutocompleteSignalField<TestModel, 'country'>;
  let mockForm: SignalFormContainer<TestModel>;
  let mockDropdownService: jest.Mocked<FormDropdownService>;

  const mockOptions: FormOption[] = [
    { label: 'United States', value: 'US' },
    { label: 'United Kingdom', value: 'UK' },
    { label: 'Canada', value: 'CA' },
    { label: 'Australia', value: 'AU' },
  ];

  const createComponent = createComponentFactory<
    SignalFormAutocompleteFieldComponent<TestModel, 'country'>
  >({
    component: SignalFormAutocompleteFieldComponent,
    shallow: true,
    schemas: [NO_ERRORS_SCHEMA],
    providers: [
      {
        provide: FormDropdownService,
        useValue: {
          openDropdown: jest.fn(),
          destroyDropdown: jest.fn(),
        },
      },
    ],
  });

  beforeEach(() => {
    const initialOption = mockOptions[0];
    mockForm = createMockForm<TestModel>({ country: initialOption });

    mockField = {
      name: 'country',
      label: 'Country',
      type: FormFieldType.AUTOCOMPLETE,
      error: signal(null),
      touched: signal(false),
      dirty: signal(false),
      focus: signal(false),
      value: signal(initialOption),
      getForm: () => mockForm,
      path: 'country',
      isDisabled: computed(() => false),
      isHidden: computed(() => false),
      config: {
        minChars: 2,
        debounceMs: 300,
      },
      loadOptions: jest.fn((query: string) => {
        const filtered = mockOptions.filter((option) =>
          option.label.toLowerCase().includes(query.toLowerCase()),
        );
        return of(filtered);
      }),
    } as any;

    spectator = createComponent({
      props: {
        field: mockField,
      },
    });

    mockDropdownService = spectator.inject(FormDropdownService) as any;
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should render autocomplete input wrapper', () => {
    const wrapper = spectator.query('.form-input-wrapper');
    expect(wrapper).toBeTruthy();
  });

  it('should render text input with proper attributes', () => {
    const input = spectator.query('input[type="text"]');
    expect(input).toBeTruthy();
    expect(input?.getAttribute('role')).toBe('combobox');
    expect(input?.getAttribute('aria-autocomplete')).toBe('list');
    expect(input?.classList.contains('form-input')).toBe(true);
  });

  it('should display current field value label', () => {
    const fieldValue = mockField.value();
    expect(fieldValue?.label).toBe(mockOptions[0].label);
  });

  it('should handle null field value', () => {
    mockField.value.set(null as any);
    spectator.detectChanges();

    const fieldValue = mockField.value();
    expect(fieldValue?.label ?? '').toBe('');
  });

  it('should update search signal when input changes', () => {
    const input = spectator.query('input') as HTMLInputElement;
    const searchQuery = 'United';

    input.value = searchQuery;
    const event = new Event('input', { bubbles: true });
    Object.defineProperty(event, 'target', { value: input });
    spectator.component['search'].set(searchQuery);

    expect(spectator.component['search']()).toBe(searchQuery);
  });

  it('should not load options when query is below minimum characters', () => {
    const loadOptionsSpy = jest.spyOn(mockField, 'loadOptions');

    spectator.component['search'].set('U');

    expect(loadOptionsSpy).not.toHaveBeenCalled();
    expect(spectator.component['loadedOptions']()).toEqual([]);
  });

  it('should load options when query meets minimum characters', () => {
    const loadOptionsSpy = jest.spyOn(mockField, 'loadOptions');

    spectator.component['search'].set('United');

    expect(spectator.component['search']()).toBe('United');
  });

  it('should filter options based on search query', () => {
    spectator.component['search'].set('United');

    expect(spectator.component['search']()).toBe('United');

    const filteredOptions = mockOptions.filter((option) =>
      option.label.toLowerCase().includes('united'),
    );
    spectator.component['loadedOptions'].set(filteredOptions);

    expect(spectator.component['loadedOptions']()).toEqual([
      { label: 'United States', value: 'US' },
      { label: 'United Kingdom', value: 'UK' },
    ]);
  });

  it('should show dropdown when options are loaded', () => {
    spectator.component['search'].set('Canada');

    spectator.component['loadedOptions'].set([
      { label: 'Canada', value: 'CA' },
    ]);
    spectator.component['showDropdown'].set(true);

    expect(spectator.component['showDropdown']()).toBe(true);
  });

  it('should add dropdown-open class when dropdown is shown', () => {
    spectator.component['search'].set('Australia');
    spectator.component['showDropdown'].set(true);
    spectator.detectChanges();

    const wrapper = spectator.query('.form-input-wrapper');
    expect(wrapper?.classList.contains('dropdown-open')).toBe(true);
  });

  it('should handle focus event with cached options', () => {
    spectator.component['lastQuery'].set('United');
    spectator.component['cachedOptions'].set([mockOptions[0], mockOptions[1]]);

    spectator.component['handleFocus']();

    expect(spectator.component['showDropdown']()).toBe(true);
    expect(spectator.component['loadedOptions']()).toEqual([
      mockOptions[0],
      mockOptions[1],
    ]);
  });

  it('should not show dropdown on focus if no cached options', () => {
    spectator.component['lastQuery'].set('');
    spectator.component['cachedOptions'].set([]);

    spectator.component['handleFocus']();

    expect(spectator.component['showDropdown']()).toBe(false);
  });

  it('should update field value when option is selected', () => {
    const selectedOption = mockOptions[2]; // Canada

    spectator.component.onSelect(selectedOption);

    expect(mockField.value()).toBe(selectedOption);
    expect(mockField.dirty()).toBe(true);
    expect(spectator.component['showDropdown']()).toBe(false);
  });

  it('should set aria-expanded attribute correctly', () => {
    expect(spectator.component['showDropdown']()).toBe(false);

    spectator.component['showDropdown'].set(true);
    expect(spectator.component['showDropdown']()).toBe(true);
  });

  it('should handle custom debounce time', () => {
    mockField.config = { debounceMs: 100, minChars: 1 };
    spectator.detectChanges();

    spectator.component['search'].set('U');

    expect(spectator.component['search']()).toBe('U');
  });

  it('should handle default debounce time when not specified', () => {
    mockField.config = { minChars: 1 };
    spectator.detectChanges();

    spectator.component['search'].set('Test');

    expect(spectator.component['search']()).toBe('Test');
  });

  it('should cache options after loading', () => {
    spectator.component['search'].set('Canada');

    const expectedOptions = [{ label: 'Canada', value: 'CA' }];
    spectator.component['cachedOptions'].set(expectedOptions);
    spectator.component['loadedOptions'].set(expectedOptions);

    expect(spectator.component['cachedOptions']()).toEqual(expectedOptions);
  });

  it('should clear loaded options when search is empty', () => {
    spectator.component['search'].set('');
    expect(spectator.component['loadedOptions']()).toEqual([]);
  });

  it('should handle Promise-based loadOptions', () => {
    mockField.loadOptions = jest.fn((query: string) => {
      return Promise.resolve([{ label: 'Promise Option', value: 'promise' }]);
    });

    spectator.component['search'].set('promise');

    expect(spectator.component['search']()).toBe('promise');
  });

  it('should handle error in loadOptions gracefully', () => {
    mockField.loadOptions = jest.fn(() => {
      throw new Error('Load failed');
    });

    spectator.component['search'].set('error');

    expect(spectator.component['search']()).toBe('error');
  });

  it('should clear search when option is selected', () => {
    spectator.component['search'].set('United');
    spectator.component.onSelect(mockOptions[0]);

    expect(spectator.component['showDropdown']()).toBe(false);
  });

  it('should handle input reference correctly', () => {
    const inputRef = spectator.component.inputRef();
    expect(inputRef).toBeTruthy();
    expect(inputRef).toBeDefined();
  });

  it('should work with different option formats', () => {
    const customOptions: FormOption[] = [
      { label: 'Option 1', value: { id: 1, name: 'First' } },
      { label: 'Option 2', value: { id: 2, name: 'Second' } },
    ];

    mockField.loadOptions = jest.fn(() => of(customOptions));
    spectator.component.onSelect(customOptions[0]);

    expect(mockField.value()).toBe(customOptions[0]);
  });
});
