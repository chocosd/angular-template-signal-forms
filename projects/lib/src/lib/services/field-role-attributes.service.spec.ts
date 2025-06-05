import { computed, signal } from '@angular/core';
import { FormFieldType } from '../enums/form-field-type.enum';
import { SignalFormField } from '../models/signal-form.model';
import { FieldRoleAttributesService } from './field-role-attributes.service';

interface TestModel {
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  preferences: string[];
}

describe('FieldRoleAttributesService', () => {
  let service: FieldRoleAttributesService;
  let mockField: SignalFormField<TestModel, 'name'>;

  beforeEach(() => {
    service = new FieldRoleAttributesService();

    // Create a base mock field
    mockField = {
      name: 'name',
      label: 'Name',
      type: FormFieldType.TEXT,
      validators: [],
      error: signal<string | null>(null),
      touched: signal(false),
      dirty: signal(false),
      focus: signal(false),
      value: signal(''),
      path: 'name',
      isDisabled: computed(() => false),
      isHidden: computed(() => false),
      getForm: jest.fn(),
      asyncError: signal(null),
      validating: signal(false),
      config: { placeholder: 'Enter your name' },
    } as SignalFormField<TestModel, 'name'>;
  });

  describe('getAttributesForField', () => {
    it('should return basic attributes for a text field', () => {
      const attributes = service.getAttributesForField(mockField);

      expect(attributes.ariaAttributes['aria-invalid']).toBe('false');
      expect(attributes.ariaAttributes['aria-describedby']).toBe(null);
      expect(attributes.inputAttributes['disabled']).toBe(null);
      expect(attributes.inputAttributes['placeholder']).toBe('Enter your name');
    });

    it('should set aria-invalid to true when field has error', () => {
      mockField.error.set('Name is required');

      const attributes = service.getAttributesForField(mockField);

      expect(attributes.ariaAttributes['aria-invalid']).toBe('true');
      expect(attributes.ariaAttributes['aria-describedby']).toBe('name-error');
    });

    it('should set disabled to true when field is disabled', () => {
      mockField.isDisabled = computed(() => true);

      const attributes = service.getAttributesForField(mockField);

      expect(attributes.inputAttributes['disabled']).toBe(true);
    });

    it('should set disabled to null when field is enabled', () => {
      mockField.isDisabled = computed(() => false);

      const attributes = service.getAttributesForField(mockField);

      expect(attributes.inputAttributes['disabled']).toBe(null);
    });

    it('should handle dynamic disabled state changes', () => {
      const disabled = signal(false);
      mockField.isDisabled = computed(() => disabled());

      // Initially enabled
      let attributes = service.getAttributesForField(mockField);
      expect(attributes.inputAttributes['disabled']).toBe(null);

      // Change to disabled
      disabled.set(true);
      attributes = service.getAttributesForField(mockField);
      expect(attributes.inputAttributes['disabled']).toBe(true);

      // Change back to enabled
      disabled.set(false);
      attributes = service.getAttributesForField(mockField);
      expect(attributes.inputAttributes['disabled']).toBe(null);
    });
  });

  describe('SELECT field attributes', () => {
    beforeEach(() => {
      mockField.type = FormFieldType.SELECT;
    });

    it('should set combobox role and ARIA attributes for select field', () => {
      const attributes = service.getAttributesForField(mockField);

      expect(attributes.role).toBe('combobox');
      expect(attributes.ariaAttributes['aria-owns']).toBe('name-listbox');
      expect(attributes.ariaAttributes['aria-controls']).toBe('name-listbox');
      expect(attributes.ariaAttributes['aria-haspopup']).toBe('listbox');
    });
  });

  describe('MULTISELECT field attributes', () => {
    beforeEach(() => {
      mockField.type = FormFieldType.MULTISELECT;
    });

    it('should set listbox role and multiselectable attributes', () => {
      const attributes = service.getAttributesForField(mockField);

      expect(attributes.role).toBe('listbox');
      expect(attributes.ariaAttributes['aria-label']).toBe('Name');
      expect(attributes.ariaAttributes['aria-multiselectable']).toBe('true');
      expect(attributes.ariaAttributes['aria-invalid']).toBe('false');
    });

    it('should set error describedby when field has error', () => {
      mockField.error.set('Required field');

      const attributes = service.getAttributesForField(mockField);

      expect(attributes.ariaAttributes['aria-describedby']).toBe('name-error');
    });
  });

  describe('CHECKBOX_GROUP field attributes', () => {
    beforeEach(() => {
      mockField.type = FormFieldType.CHECKBOX_GROUP;
    });

    it('should set group role and labelledby attributes', () => {
      const attributes = service.getAttributesForField(mockField);

      expect(attributes.role).toBe('group');
      expect(attributes.ariaAttributes['aria-labelledby']).toBe('name-legend');
    });
  });

  describe('RADIO field attributes', () => {
    beforeEach(() => {
      mockField.type = FormFieldType.RADIO;
    });

    it('should set radiogroup role and labelledby attributes', () => {
      const attributes = service.getAttributesForField(mockField);

      expect(attributes.role).toBe('radiogroup');
      expect(attributes.ariaAttributes['aria-labelledby']).toBe('name-legend');
    });
  });

  describe('SWITCH field attributes', () => {
    let switchField: SignalFormField<TestModel, 'isActive'>;

    beforeEach(() => {
      switchField = {
        name: 'isActive',
        label: 'Is Active',
        type: FormFieldType.SWITCH,
        validators: [],
        error: signal<string | null>(null),
        touched: signal(false),
        dirty: signal(false),
        focus: signal(false),
        value: signal(false),
        path: 'isActive',
        isDisabled: computed(() => false),
        isHidden: computed(() => false),
        getForm: jest.fn(),
        asyncError: signal(null),
        validating: signal(false),
        config: {},
      } as SignalFormField<TestModel, 'isActive'>;
    });

    it('should set switch role and aria-checked for boolean value', () => {
      const attributes = service.getAttributesForField(switchField);

      expect(attributes.role).toBe('switch');
      expect(attributes.ariaAttributes['aria-checked']).toBe('false');
      expect(attributes.inputAttributes['checked']).toBe(false);
    });

    it('should handle true boolean value', () => {
      switchField.value.set(true);

      const attributes = service.getAttributesForField(switchField);

      expect(attributes.ariaAttributes['aria-checked']).toBe('true');
      expect(attributes.inputAttributes['checked']).toBe(true);
    });

    it('should handle null/undefined values', () => {
      switchField.value.set(null as any);

      const attributes = service.getAttributesForField(switchField);

      expect(attributes.ariaAttributes['aria-checked']).toBe(null);
      expect(attributes.inputAttributes['checked']).toBe(false);
    });
  });

  describe('SLIDER field attributes', () => {
    let sliderField: SignalFormField<TestModel, 'age'>;

    beforeEach(() => {
      sliderField = {
        name: 'age',
        label: 'Age',
        type: FormFieldType.SLIDER,
        validators: [],
        error: signal<string | null>(null),
        touched: signal(false),
        dirty: signal(false),
        focus: signal(false),
        value: signal(50),
        path: 'age',
        isDisabled: computed(() => false),
        isHidden: computed(() => false),
        getForm: jest.fn(),
        asyncError: signal(null),
        validating: signal(false),
        config: { min: 0, max: 100, step: 1 },
      } as SignalFormField<TestModel, 'age'>;
    });

    it('should set slider role and value attributes', () => {
      const attributes = service.getAttributesForField(sliderField);

      expect(attributes.role).toBe('slider');
      expect(attributes.ariaAttributes['aria-valuemin']).toBe('0');
      expect(attributes.ariaAttributes['aria-valuemax']).toBe('100');
      expect(attributes.ariaAttributes['aria-valuenow']).toBe('50');
      expect(attributes.inputAttributes['min']).toBe('0');
      expect(attributes.inputAttributes['max']).toBe('100');
      expect(attributes.inputAttributes['step']).toBe('1');
    });

    it('should use defaults when config is not provided', () => {
      sliderField.config = {};

      const attributes = service.getAttributesForField(sliderField);

      expect(attributes.ariaAttributes['aria-valuemin']).toBe('0');
      expect(attributes.ariaAttributes['aria-valuemax']).toBe('100');
      expect(attributes.inputAttributes['step']).toBe('1');
    });
  });

  describe('RATING field attributes', () => {
    let ratingField: SignalFormField<TestModel, 'age'>;

    beforeEach(() => {
      ratingField = {
        name: 'age',
        label: 'Rating',
        type: FormFieldType.RATING,
        validators: [],
        error: signal<string | null>(null),
        touched: signal(false),
        dirty: signal(false),
        focus: signal(false),
        value: signal(3),
        path: 'age',
        isDisabled: computed(() => false),
        isHidden: computed(() => false),
        getForm: jest.fn(),
        asyncError: signal(null),
        validating: signal(false),
        config: { max: 5 },
      } as SignalFormField<TestModel, 'age'>;
    });

    it('should set radiogroup role and rating attributes', () => {
      const attributes = service.getAttributesForField(ratingField);

      expect(attributes.role).toBe('radiogroup');
      expect(attributes.ariaAttributes['aria-valuemin']).toBe('0');
      expect(attributes.ariaAttributes['aria-valuemax']).toBe('5');
      expect(attributes.ariaAttributes['aria-valuenow']).toBe('3');
      expect(attributes.ariaAttributes['aria-label']).toBe('Rating');
      expect(attributes.ariaAttributes['aria-invalid']).toBe('false');
      expect(attributes.ariaAttributes['aria-describedby']).toBe('hint-age');
    });

    it('should use default max when not provided', () => {
      ratingField.config = {};

      const attributes = service.getAttributesForField(ratingField);

      expect(attributes.ariaAttributes['aria-valuemax']).toBe('5');
    });

    it('should set error describedby when field has error', () => {
      ratingField.error.set('Rating is required');

      const attributes = service.getAttributesForField(ratingField);

      expect(attributes.ariaAttributes['aria-describedby']).toBe('error-age');
    });
  });

  describe('FILE field attributes', () => {
    let fileField: SignalFormField<TestModel, 'name'>;

    beforeEach(() => {
      fileField = {
        name: 'name',
        label: 'File',
        type: FormFieldType.FILE,
        validators: [],
        error: signal<string | null>(null),
        touched: signal(false),
        dirty: signal(false),
        focus: signal(false),
        value: signal(''),
        path: 'name',
        isDisabled: computed(() => false),
        isHidden: computed(() => false),
        getForm: jest.fn(),
        asyncError: signal(null),
        validating: signal(false),
        config: { accept: ['image/*', 'application/pdf'] },
      } as SignalFormField<TestModel, 'name'>;
    });

    it('should set button role and accept attributes', () => {
      const attributes = service.getAttributesForField(fileField);

      expect(attributes.role).toBe('button');
      expect(attributes.ariaAttributes['aria-label']).toBe(
        'Click or drag a file to upload',
      );
      expect(attributes.inputAttributes['accept']).toBe(
        'image/*,application/pdf',
      );
    });

    it('should use custom upload text when provided', () => {
      fileField.config = { uploadText: 'Upload your document' };

      const attributes = service.getAttributesForField(fileField);

      expect(attributes.ariaAttributes['aria-label']).toBe(
        'Upload your document',
      );
    });

    it('should handle null accept value', () => {
      fileField.config = {};

      const attributes = service.getAttributesForField(fileField);

      expect(attributes.inputAttributes['accept']).toBe(null);
    });
  });

  describe('PASSWORD field attributes', () => {
    beforeEach(() => {
      mockField.type = FormFieldType.PASSWORD;
    });

    it('should set password-specific attributes', () => {
      const attributes = service.getAttributesForField(mockField);

      expect(attributes.ariaAttributes['aria-label']).toBe(
        'Password field for Name',
      );
      expect(attributes.inputAttributes['autocomplete']).toBe(
        'current-password',
      );
    });
  });

  describe('COLOR field attributes', () => {
    beforeEach(() => {
      mockField.type = FormFieldType.COLOR;
    });

    it('should set color picker aria-label', () => {
      const attributes = service.getAttributesForField(mockField);

      expect(attributes.ariaAttributes['aria-label']).toBe(
        'Color picker for Name',
      );
    });
  });

  describe('AUTOCOMPLETE field attributes', () => {
    beforeEach(() => {
      mockField.type = FormFieldType.AUTOCOMPLETE;
    });

    it('should set combobox role and ARIA attributes', () => {
      const attributes = service.getAttributesForField(mockField);

      expect(attributes.role).toBe('combobox');
      expect(attributes.ariaAttributes['aria-owns']).toBe('name-listbox');
      expect(attributes.ariaAttributes['aria-controls']).toBe('name-listbox');
      expect(attributes.ariaAttributes['aria-haspopup']).toBe('listbox');
    });
  });

  describe('default field types', () => {
    it('should return empty attributes for unsupported field types', () => {
      mockField.type = FormFieldType.DATETIME;

      const attributes = service.getAttributesForField(mockField);

      // Should still have base attributes
      expect(attributes.ariaAttributes['aria-invalid']).toBe('false');
      expect(attributes.inputAttributes['disabled']).toBe(null);

      // But no role-specific attributes for datetime
      expect(attributes.role).toBeUndefined();
    });
  });
});
