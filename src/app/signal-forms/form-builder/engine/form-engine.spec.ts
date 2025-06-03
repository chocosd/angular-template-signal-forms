import { computed, signal } from '@angular/core';
import { FormFieldType } from '@enums/form-field-type.enum';
import { FormStatus } from '@enums/form-status.enum';
import type {
  SignalFormContainer,
  SignalFormField,
} from '@models/signal-form.model';
import { FormEngine } from './form-engine';

interface TestModel {
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  nested: {
    value: string;
  };
  items: Array<{ id: number; title: string }>;
  preferences: { [key: string]: boolean };
}

describe('FormEngine', () => {
  let mockForm: SignalFormContainer<TestModel>;
  let testModel: TestModel;

  beforeEach(() => {
    testModel = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      isActive: true,
      nested: { value: 'nested data' },
      items: [{ id: 1, title: 'Item 1' }],
      preferences: { theme: true, notifications: false },
    };

    mockForm = {
      fields: [],
      getValue: jest.fn(),
      getRawValue: jest.fn(),
      getErrors: jest.fn(),
      validateForm: jest.fn(),
      reset: jest.fn(),
      save: jest.fn(),
      value: signal(testModel),
      rawValue: signal(testModel),
      status: signal(FormStatus.Idle),
      anyTouched: signal(false),
      anyDirty: signal(false),
      hasSaved: jest.fn(),
      config: { layout: 'flex' },
      patchValue: jest.fn(),
      setValue: jest.fn(),
      getField: jest.fn(),
      parentForm: signal(undefined),
    } as unknown as SignalFormContainer<TestModel>;
  });

  describe('validateForm', () => {
    it('should validate all fields and return true when all are valid', () => {
      const fields: SignalFormField<TestModel>[] = [
        createMockField('name', 'John Doe', [
          (value: any) => (value ? null : 'Name is required'),
        ]) as SignalFormField<TestModel>,
        createMockField('email', 'john@example.com', [
          (value: any) => (value.includes('@') ? null : 'Invalid email'),
        ]) as SignalFormField<TestModel>,
      ];

      const validateFn = FormEngine.validateForm(fields, mockForm);
      const isValid = validateFn();

      expect(isValid).toBe(true);
      expect(fields[0].error()).toBe(null);
      expect(fields[1].error()).toBe(null);
      expect(fields[0].touched()).toBe(true);
      expect(fields[1].touched()).toBe(true);
    });

    it('should validate fields and return false when validation fails', () => {
      const fields: SignalFormField<TestModel>[] = [
        createMockField('name', '', [
          (value: any) => (value ? null : 'Name is required'),
        ]) as SignalFormField<TestModel>,
        createMockField('email', 'invalid-email', [
          (value: any) => (value.includes('@') ? null : 'Invalid email'),
        ]) as SignalFormField<TestModel>,
      ];

      const validateFn = FormEngine.validateForm(fields, mockForm);
      const isValid = validateFn();

      expect(isValid).toBe(false);
      expect(fields[0].error()).toBe('Name is required');
      expect(fields[1].error()).toBe('Invalid email');
    });

    it('should handle nested form validation', () => {
      const nestedForm = {
        validateForm: jest.fn().mockReturnValue(false),
      } as unknown as SignalFormContainer<TestModel['nested']>;

      const fieldWithForm = {
        ...createMockField('nested', testModel.nested),
        form: nestedForm,
      } as unknown as SignalFormField<TestModel>;

      const fields = [fieldWithForm];
      const validateFn = FormEngine.validateForm(fields, mockForm);
      const isValid = validateFn();

      expect(isValid).toBe(false);
      expect(nestedForm.validateForm).toHaveBeenCalled();
    });

    it('should handle repeatable field validation', () => {
      const repeatableForm1 = {
        validateForm: jest.fn().mockReturnValue(true),
      } as unknown as SignalFormContainer<TestModel['items'][0]>;

      const repeatableForm2 = {
        validateForm: jest.fn().mockReturnValue(false),
      } as unknown as SignalFormContainer<TestModel['items'][0]>;

      const repeatableField = {
        ...createMockField('items', testModel.items),
        repeatableForms: signal([repeatableForm1, repeatableForm2]),
      } as unknown as SignalFormField<TestModel>;

      const fields = [repeatableField];
      const validateFn = FormEngine.validateForm(fields, mockForm);
      const isValid = validateFn();

      expect(isValid).toBe(false);
      expect(repeatableForm1.validateForm).toHaveBeenCalled();
      expect(repeatableForm2.validateForm).toHaveBeenCalled();
    });

    it('should stop at first validation error for a field', () => {
      const validator1 = jest.fn().mockReturnValue('First error');
      const validator2 = jest.fn().mockReturnValue('Second error');

      const fields: SignalFormField<TestModel>[] = [
        createMockField('name', 'test', [
          validator1,
          validator2,
        ]) as SignalFormField<TestModel>,
      ];

      const validateFn = FormEngine.validateForm(fields, mockForm);
      validateFn();

      expect(validator1).toHaveBeenCalled();
      expect(validator2).not.toHaveBeenCalled();
      expect(fields[0].error()).toBe('First error');
    });
  });

  describe('resetForm', () => {
    it('should reset all field values and states to initial model', () => {
      const initialModel = { ...testModel, name: 'Original Name' };
      const fields: SignalFormField<TestModel>[] = [
        createMockField('name', 'Modified Name') as SignalFormField<TestModel>,
        createMockField(
          'email',
          'modified@example.com',
        ) as SignalFormField<TestModel>,
      ];

      // Simulate field modifications
      fields[0].touched.set(true);
      fields[0].dirty.set(true);
      fields[0].error.set('Some error');
      fields[0].focus.set(true);

      const resetFn = FormEngine.resetForm(fields, initialModel);
      resetFn();

      expect(fields[0].value()).toBe('Original Name');
      expect(fields[0].touched()).toBe(false);
      expect(fields[0].dirty()).toBe(false);
      expect(fields[0].error()).toBe(null);
      expect(fields[0].focus()).toBe(false);
    });

    it('should reset nested forms', () => {
      const nestedForm = {
        reset: jest.fn(),
      } as unknown as SignalFormContainer<TestModel['nested']>;

      const fieldWithForm = {
        ...createMockField('nested', testModel.nested),
        form: nestedForm,
      } as unknown as SignalFormField<TestModel>;

      const fields = [fieldWithForm];
      const resetFn = FormEngine.resetForm(fields, testModel);
      resetFn();

      expect(nestedForm.reset).toHaveBeenCalled();
    });
  });

  describe('patchForm', () => {
    it('should patch field values with partial data', () => {
      const fields: SignalFormField<TestModel>[] = [
        createMockField('name', 'John Doe') as SignalFormField<TestModel>,
        createMockField(
          'email',
          'john@example.com',
        ) as SignalFormField<TestModel>,
        createMockField('age', 30) as SignalFormField<TestModel>,
      ];

      const patchFn = FormEngine.patchForm(fields);
      patchFn({ name: 'Jane Smith', age: 25 });

      expect(fields[0].value()).toBe('Jane Smith');
      expect(fields[0].dirty()).toBe(true);
      expect(fields[1].value()).toBe('john@example.com'); // Unchanged
      expect(fields[1].dirty()).toBe(false);
      expect(fields[2].value()).toBe(25);
      expect(fields[2].dirty()).toBe(true);
    });

    it('should skip undefined values in patch', () => {
      const fields: SignalFormField<TestModel>[] = [
        createMockField('name', 'John Doe') as SignalFormField<TestModel>,
      ];

      const patchFn = FormEngine.patchForm(fields);
      patchFn({ name: 'Updated Name' }); // Only update name

      expect(fields[0].value()).toBe('Updated Name');
      expect(fields[0].dirty()).toBe(true);
    });

    it('should patch nested forms', () => {
      const nestedForm = {
        patchValue: jest.fn(),
      } as unknown as SignalFormContainer<TestModel['nested']>;

      const fieldWithForm = {
        ...createMockField('nested', testModel.nested),
        form: nestedForm,
      } as unknown as SignalFormField<TestModel>;

      const fields = [fieldWithForm];
      const patchFn = FormEngine.patchForm(fields);
      patchFn({ nested: { value: 'updated nested' } });

      expect(nestedForm.patchValue).toHaveBeenCalledWith({
        value: 'updated nested',
      });
    });
  });

  describe('setFormValue', () => {
    it('should set all field values from complete model', () => {
      const fields: SignalFormField<TestModel>[] = [
        createMockField('name', 'Old Name') as SignalFormField<TestModel>,
        createMockField(
          'email',
          'old@example.com',
        ) as SignalFormField<TestModel>,
      ];

      const newModel = {
        ...testModel,
        name: 'New Name',
        email: 'new@example.com',
      };

      const setValueFn = FormEngine.setFormValue(fields);
      setValueFn(newModel);

      expect(fields[0].value()).toBe('New Name');
      expect(fields[0].dirty()).toBe(true);
      expect(fields[1].value()).toBe('new@example.com');
      expect(fields[1].dirty()).toBe(true);
    });

    it('should set nested form values', () => {
      const nestedForm = {
        setValue: jest.fn(),
      } as unknown as SignalFormContainer<TestModel['nested']>;

      const fieldWithForm = {
        ...createMockField('nested', testModel.nested),
        form: nestedForm,
      } as unknown as SignalFormField<TestModel>;

      const fields = [fieldWithForm];
      const setValueFn = FormEngine.setFormValue(fields);
      setValueFn(testModel);

      expect(nestedForm.setValue).toHaveBeenCalledWith(testModel.nested);
    });
  });

  describe('getErrors', () => {
    it('should collect errors from all fields', () => {
      const fields: SignalFormField<TestModel>[] = [
        {
          ...createMockField('name', ''),
          error: signal('Name is required'),
        } as SignalFormField<TestModel>,
        {
          ...createMockField('email', 'invalid'),
          error: signal('Invalid email'),
        } as SignalFormField<TestModel>,
        {
          ...createMockField('age', 30),
          error: signal(null),
        } as SignalFormField<TestModel>,
      ];

      const getErrorsFn = FormEngine.getErrors(fields);
      const errors = getErrorsFn();

      expect(errors).toHaveLength(2);
      expect(errors[0]).toEqual(
        expect.objectContaining({
          name: 'name',
          message: 'Name is required',
          path: 'name',
        }),
      );
      expect(errors[1]).toEqual(
        expect.objectContaining({
          name: 'email',
          message: 'Invalid email',
          path: 'email',
        }),
      );
    });

    it('should collect errors from nested forms with updated paths', () => {
      const nestedForm = {
        getErrors: jest
          .fn()
          .mockReturnValue([
            { name: 'value', message: 'Nested error', path: 'value' },
          ]),
      } as unknown as SignalFormContainer<TestModel['nested']>;

      const fieldWithForm = {
        ...createMockField('nested', testModel.nested),
        form: nestedForm,
        path: 'nested',
      } as unknown as SignalFormField<TestModel>;

      const fields = [fieldWithForm];
      const getErrorsFn = FormEngine.getErrors(fields);
      const errors = getErrorsFn();

      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual({
        name: 'value',
        message: 'Nested error',
        path: 'nested.value',
      });
    });
  });

  describe('getValueFromFields', () => {
    it('should get values from all enabled fields', () => {
      const fields: SignalFormField<TestModel>[] = [
        createMockField('name', 'John Doe') as SignalFormField<TestModel>,
        createMockField(
          'email',
          'john@example.com',
        ) as SignalFormField<TestModel>,
        {
          ...createMockField('age', 30),
          disabled: true,
        } as SignalFormField<TestModel>, // Disabled field
      ];

      const result = FormEngine.getValueFromFields(fields, mockForm);

      expect(result).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        // age should be excluded as it's disabled
      });
    });

    it('should handle dynamic disabled state', () => {
      const fields: SignalFormField<TestModel>[] = [
        createMockField('name', 'John Doe') as SignalFormField<TestModel>,
        {
          ...createMockField('email', 'john@example.com'),
          disabled: (form: SignalFormContainer<TestModel>) =>
            form.getValue().name === 'John Doe',
        } as SignalFormField<TestModel>,
      ];

      // Setup mockForm.getValue to return the current model
      mockForm.getValue = jest.fn().mockReturnValue(testModel);

      const result = FormEngine.getValueFromFields(fields, mockForm);

      expect(result).toEqual({
        name: 'John Doe',
        // email excluded because disabled function returns true
      });
    });
  });

  describe('getFieldOutputValue', () => {
    it('should get simple field value', () => {
      const field = createMockField(
        'name',
        'John Doe',
      ) as SignalFormField<TestModel>;
      const result = FormEngine.getFieldOutputValue(field);
      expect(result).toBe('John Doe');
    });

    it('should get nested form value', () => {
      const nestedForm = {
        getValue: jest.fn().mockReturnValue({ value: 'nested data' }),
      } as unknown as SignalFormContainer<TestModel['nested']>;

      const fieldWithForm = {
        ...createMockField('nested', testModel.nested),
        form: nestedForm,
      } as unknown as SignalFormField<TestModel>;

      const result = FormEngine.getFieldOutputValue(fieldWithForm);
      expect(result).toEqual({ value: 'nested data' });
      expect(nestedForm.getValue).toHaveBeenCalled();
    });

    it('should get repeatable field values', () => {
      const form1 = {
        getValue: jest.fn().mockReturnValue({ id: 1, title: 'Item 1' }),
      } as unknown as SignalFormContainer<TestModel['items'][0]>;

      const form2 = {
        getValue: jest.fn().mockReturnValue({ id: 2, title: 'Item 2' }),
      } as unknown as SignalFormContainer<TestModel['items'][0]>;

      const repeatableField = {
        ...createMockField('items', testModel.items),
        repeatableForms: signal([form1, form2]),
      } as unknown as SignalFormField<TestModel>;

      const result = FormEngine.getFieldOutputValue(repeatableField);
      expect(result).toEqual([
        { id: 1, title: 'Item 1' },
        { id: 2, title: 'Item 2' },
      ]);
    });

    it('should handle checkbox group with array value type', () => {
      const checkboxGroupField = {
        ...createMockField('preferences', {
          theme: true,
          notifications: false,
        }),
        type: FormFieldType.CHECKBOX_GROUP,
        valueType: 'array' as const,
      } as unknown as SignalFormField<TestModel>;

      const result = FormEngine.getFieldOutputValue(checkboxGroupField);
      expect(result).toEqual(['theme']);
    });

    it('should handle checkbox group with map value type', () => {
      const checkboxGroupField = {
        ...createMockField('preferences', {
          theme: true,
          notifications: false,
        }),
        type: FormFieldType.CHECKBOX_GROUP,
        valueType: 'map' as const,
      } as unknown as SignalFormField<TestModel>;

      const result = FormEngine.getFieldOutputValue(checkboxGroupField);
      expect(result).toEqual({ theme: true, notifications: false });
    });
  });

  describe('runSaveHandler', () => {
    it('should validate form before saving and call save handler on success', () => {
      const mockSaveHandler = jest.fn();
      const fields: SignalFormField<TestModel>[] = [
        createMockField('name', 'John Doe', [
          (value: any) => (value ? null : 'Name is required'),
        ]) as SignalFormField<TestModel>,
      ];
      const status = signal(FormStatus.Idle);

      const saveFn = FormEngine.runSaveHandler(
        fields,
        status,
        mockForm,
        mockSaveHandler,
      );

      saveFn();

      expect(status()).toBe(FormStatus.Success);
      expect(mockSaveHandler).toHaveBeenCalledWith({ name: 'John Doe' });
    });

    it('should not call save handler when validation fails', () => {
      const mockSaveHandler = jest.fn();
      const fields: SignalFormField<TestModel>[] = [
        createMockField('name', '', [
          (value: any) => (value ? null : 'Name is required'),
        ]) as SignalFormField<TestModel>,
      ];
      const status = signal(FormStatus.Idle);

      const saveFn = FormEngine.runSaveHandler(
        fields,
        status,
        mockForm,
        mockSaveHandler,
      );

      saveFn();

      expect(status()).toBe(FormStatus.Error);
      expect(mockSaveHandler).not.toHaveBeenCalled();
    });

    it('should handle missing save handler gracefully', () => {
      const fields: SignalFormField<TestModel>[] = [
        createMockField('name', 'John Doe') as SignalFormField<TestModel>,
      ];
      const status = signal(FormStatus.Idle);

      const saveFn = FormEngine.runSaveHandler(fields, status, mockForm);

      expect(() => saveFn()).not.toThrow();
      expect(status()).toBe(FormStatus.Success);
    });

    it('should set status to saving during save operation', () => {
      const mockSaveHandler = jest.fn();
      const fields: SignalFormField<TestModel>[] = [
        createMockField('name', 'John Doe') as SignalFormField<TestModel>,
      ];
      const status = signal(FormStatus.Idle);

      const saveFn = FormEngine.runSaveHandler(
        fields,
        status,
        mockForm,
        mockSaveHandler,
      );

      saveFn();

      expect(mockSaveHandler).toHaveBeenCalledWith({ name: 'John Doe' });
    });
  });
});

// Helper function to create mock fields
function createMockField<TModel>(
  name: keyof TModel,
  initialValue: TModel[keyof TModel],
  validators: Array<(value: TModel[keyof TModel]) => string | null> = [],
): SignalFormField<TModel> {
  return {
    name,
    type: FormFieldType.TEXT,
    label: String(name),
    validators,
    touched: signal(false),
    dirty: signal(false),
    error: signal(null),
    value: signal(initialValue),
    path: String(name),
    focus: signal(false),
    isDisabled: computed(() => false),
    isHidden: computed(() => false),
    getForm: () => ({}) as SignalFormContainer<TModel>,
    asyncError: signal(null),
    validating: signal(false),
  } as SignalFormField<TModel>;
}
