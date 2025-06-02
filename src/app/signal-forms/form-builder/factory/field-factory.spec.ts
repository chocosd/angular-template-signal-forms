import { signal } from '@angular/core';
import { FormFieldType } from '@enums/form-field-type.enum';
import type {
  RuntimeCheckboxGroupSignalField,
  RuntimeChipListSignalField,
  RuntimeMultiSelectSignalField,
  RuntimeRadioSignalField,
  RuntimeSelectSignalField,
} from '@models/signal-field-types.model';
import type {
  ComputedOptions,
  FormOption,
  RepeatableGroupSignalFormField,
  SignalFormContainer,
  SignalFormField,
  SignalFormFieldBuilderInput,
} from '@models/signal-form.model';
import { FieldFactory } from './field-factory';

interface TestModel {
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  preferences: string[];
  nested: {
    value: string;
    description: string;
  };
  items: Array<{ id: number; title: string }>;
  category: string;
}

describe('FieldFactory', () => {
  let testModel: TestModel;
  let mockForm: SignalFormContainer<TestModel>;

  beforeEach(() => {
    testModel = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      isActive: true,
      preferences: ['theme', 'notifications'],
      nested: { value: 'nested data', description: 'test description' },
      items: [{ id: 1, title: 'Item 1' }],
      category: 'work',
    };

    mockForm = {
      fields: [],
      getValue: jest.fn().mockReturnValue(testModel),
      getRawValue: jest.fn().mockReturnValue(testModel),
      getErrors: jest.fn(),
      validateForm: jest.fn(),
      reset: jest.fn(),
      save: jest.fn(),
      value: signal(testModel),
      rawValue: signal(testModel),
      status: signal(0),
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

  describe('build - basic fields', () => {
    it('should build a basic text field', () => {
      const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
        name: 'name',
        label: 'Name',
        type: FormFieldType.TEXT,
      };

      const field = FieldFactory.build(fieldConfig, testModel, mockForm);

      expect(field.name).toBe('name');
      expect(field.label).toBe('Name');
      expect(field.type).toBe(FormFieldType.TEXT);
      expect(field.value()).toBe('John Doe');
      expect(field.path).toBe('name');
      expect(field.touched()).toBe(false);
      expect(field.dirty()).toBe(false);
      expect(field.error()).toBe(null);
      expect(field.isDisabled()).toBe(false);
      expect(field.isHidden()).toBe(false);
    });

    it('should build field with parent path', () => {
      const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
        name: 'name',
        label: 'Name',
        type: FormFieldType.TEXT,
      };

      const field = FieldFactory.build(
        fieldConfig,
        testModel,
        mockForm,
        'parent',
      );

      expect(field.path).toBe('parent.name');
    });

    it('should build field with disabled state', () => {
      const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
        name: 'name',
        label: 'Name',
        type: FormFieldType.TEXT,
        disabled: true,
      };

      const field = FieldFactory.build(fieldConfig, testModel, mockForm);

      expect(field.isDisabled()).toBe(true);
    });

    it('should build field with dynamic disabled state', () => {
      const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
        name: 'email',
        label: 'Email',
        type: FormFieldType.TEXT,
        disabled: (form: SignalFormContainer<TestModel>) =>
          form.getValue().name === 'John Doe',
      };

      const field = FieldFactory.build(fieldConfig, testModel, mockForm);

      expect(field.isDisabled()).toBe(true);
    });

    it('should build field with hidden state', () => {
      const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
        name: 'name',
        label: 'Name',
        type: FormFieldType.TEXT,
        hidden: true,
      };

      const field = FieldFactory.build(fieldConfig, testModel, mockForm);

      expect(field.isHidden()).toBe(true);
    });

    it('should build field with dynamic hidden state', () => {
      const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
        name: 'email',
        label: 'Email',
        type: FormFieldType.TEXT,
        hidden: (form: SignalFormContainer<TestModel>) =>
          form.getValue().age < 18,
      };

      const field = FieldFactory.build(fieldConfig, testModel, mockForm);

      expect(field.isHidden()).toBe(false); // age is 30, so not hidden
    });

    it('should build different field types correctly', () => {
      const fieldTypes = [
        { type: FormFieldType.TEXT, name: 'name' as const },
        { type: FormFieldType.TEXT, name: 'email' as const },
        { type: FormFieldType.NUMBER, name: 'age' as const },
        { type: FormFieldType.SWITCH, name: 'isActive' as const },
      ];

      fieldTypes.forEach(({ type, name }) => {
        const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
          name,
          label: String(name),
          type: type as
            | FormFieldType.TEXT
            | FormFieldType.NUMBER
            | FormFieldType.SWITCH,
        };

        const field = FieldFactory.build(fieldConfig, testModel, mockForm);

        expect(field.type).toBe(type);
        expect(field.name).toBe(name);
        expect(field.value()).toBe(testModel[name]);
      });
    });
  });

  describe('build - fields with options', () => {
    it('should build select field with static options', () => {
      const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
        name: 'category',
        label: 'Category',
        type: FormFieldType.SELECT,
        options: [
          { label: 'Work', value: 'work' },
          { label: 'Personal', value: 'personal' },
          { label: 'Other', value: 'other' },
        ],
      };

      const field = FieldFactory.build(
        fieldConfig,
        testModel,
        mockForm,
      ) as unknown as RuntimeSelectSignalField<TestModel, 'category'>;

      expect(field.type).toBe(FormFieldType.SELECT);
      expect(field.options().length).toBe(3);
      expect(field.options()[0]).toEqual({ label: 'Work', value: 'work' });
    });

    it('should build radio field with static options', () => {
      const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
        name: 'category',
        label: 'Category',
        type: FormFieldType.RADIO,
        options: [
          { label: 'Work', value: 'work' },
          { label: 'Personal', value: 'personal' },
        ],
      };

      const field = FieldFactory.build(
        fieldConfig,
        testModel,
        mockForm,
      ) as unknown as RuntimeRadioSignalField<TestModel, 'category'>;

      expect(field.type).toBe(FormFieldType.RADIO);
      expect(field.options().length).toBe(2);
    });

    it('should build checkbox group field with static options', () => {
      const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
        name: 'preferences',
        label: 'Preferences',
        type: FormFieldType.CHECKBOX_GROUP,
        options: [
          { label: 'Theme', value: 'theme' },
          { label: 'Notifications', value: 'notifications' },
          { label: 'Email Updates', value: 'email' },
        ],
      };

      const field = FieldFactory.build(
        fieldConfig,
        testModel,
        mockForm,
      ) as unknown as RuntimeCheckboxGroupSignalField<TestModel, 'preferences'>;

      expect(field.type).toBe(FormFieldType.CHECKBOX_GROUP);
      expect(field.options().length).toBe(3);
    });

    it('should build multiselect field with static options', () => {
      const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
        name: 'preferences',
        label: 'Preferences',
        type: FormFieldType.MULTISELECT,
        options: [
          { label: 'Option 1', value: 'opt1' },
          { label: 'Option 2', value: 'opt2' },
        ],
      };

      const field = FieldFactory.build(
        fieldConfig,
        testModel,
        mockForm,
      ) as unknown as RuntimeMultiSelectSignalField<TestModel, 'preferences'>;

      expect(field.type).toBe(FormFieldType.MULTISELECT);
      expect(field.options().length).toBe(2);
    });

    it('should build chiplist field with static options', () => {
      const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
        name: 'preferences',
        label: 'Preferences',
        type: FormFieldType.CHIPLIST,
        options: [
          { label: 'Chip 1', value: 'chip1' },
          { label: 'Chip 2', value: 'chip2' },
        ],
      };

      const field = FieldFactory.build(
        fieldConfig,
        testModel,
        mockForm,
      ) as unknown as RuntimeChipListSignalField<TestModel, 'preferences'>;

      expect(field.type).toBe(FormFieldType.CHIPLIST);
      expect(field.options().length).toBe(2);
    });

    it('should build field with computed options', () => {
      const allOptions: FormOption[] = [
        { label: 'Work', value: 'work' },
        { label: 'Personal', value: 'personal' },
        { label: 'Other', value: 'other' },
      ];

      const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
        name: 'category',
        label: 'Category',
        type: FormFieldType.SELECT,
        options: allOptions,
        computedOptions: {
          source: (form: SignalFormContainer<TestModel>) => form.getValue().age,
          filterFn: (
            age: number,
            options: FormOption[],
            currentValue: unknown,
          ) => {
            // Filter options based on age
            if (age >= 18) {
              return options;
            }
            return options.filter((opt) => opt.value !== 'work');
          },
        } as ComputedOptions<TestModel>,
      };

      const field = FieldFactory.build(
        fieldConfig,
        testModel,
        mockForm,
      ) as unknown as RuntimeSelectSignalField<TestModel, 'category'>;

      expect(field.type).toBe(FormFieldType.SELECT);
      // Age is 30, so all options should be available
      expect(field.options().length).toBe(3);
      expect(field.options()).toEqual(allOptions);
    });

    it('should build field with computed options that filter based on form state', () => {
      const allOptions: FormOption[] = [
        { label: 'Work', value: 'work' },
        { label: 'Personal', value: 'personal' },
        { label: 'Other', value: 'other' },
      ];

      // Create a mock form where age < 18
      const youngPersonModel = { ...testModel, age: 16 };
      const youngPersonForm = {
        ...mockForm,
        getValue: jest.fn().mockReturnValue(youngPersonModel),
      };

      const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
        name: 'category',
        label: 'Category',
        type: FormFieldType.SELECT,
        options: allOptions,
        computedOptions: {
          source: (form: SignalFormContainer<TestModel>) => form.getValue().age,
          filterFn: (
            age: number,
            options: FormOption[],
            currentValue: unknown,
          ) => {
            if (age >= 18) {
              return options;
            }
            return options.filter((opt) => opt.value !== 'work');
          },
        } as ComputedOptions<TestModel>,
      };

      const field = FieldFactory.build(
        fieldConfig,
        youngPersonModel,
        youngPersonForm as SignalFormContainer<TestModel>,
      ) as unknown as RuntimeSelectSignalField<TestModel, 'category'>;

      expect(field.options().length).toBe(2);
      expect(field.options()).toEqual([
        { label: 'Personal', value: 'personal' },
        { label: 'Other', value: 'other' },
      ]);
    });
  });

  describe('build - nested form fields', () => {
    it('should build nested form field', () => {
      const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
        name: 'nested',
        heading: 'Nested Data',
        subheading: 'Enter nested information',
        fields: [
          {
            name: 'value' as keyof TestModel['nested'],
            label: 'Value',
            type: FormFieldType.TEXT,
          },
          {
            name: 'description' as keyof TestModel['nested'],
            label: 'Description',
            type: FormFieldType.TEXTAREA,
          },
        ],
      };

      const field = FieldFactory.build(
        fieldConfig,
        testModel,
        mockForm,
      ) as unknown as SignalFormField<TestModel> & {
        form: SignalFormContainer<TestModel['nested']>;
      };

      expect(field.name).toBe('nested');
      expect(field.form.fields).toHaveLength(2);
      expect(field.form.fields[0].name).toBe('value');
      expect(field.form.fields[1].name).toBe('description');
      expect(field.form.getValue()).toEqual(testModel.nested);
    });

    it('should build nested form field with proper path', () => {
      const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
        name: 'nested',
        heading: 'Nested Data',
        subheading: 'Enter nested information',
        fields: [
          {
            name: 'value' as keyof TestModel['nested'],
            label: 'Value',
            type: FormFieldType.TEXT,
          },
        ],
      };

      const field = FieldFactory.build(
        fieldConfig,
        testModel,
        mockForm,
        'parent',
      ) as unknown as SignalFormField<TestModel> & {
        form: SignalFormContainer<TestModel['nested']>;
      };

      expect(field.path).toBe('parent.nested');
      expect(field.form.fields[0].path).toBe('parent.nested.value');
    });
  });

  describe('build - repeatable group fields', () => {
    it('should build repeatable group field', () => {
      const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
        name: 'items',
        heading: 'Items',
        type: FormFieldType.REPEATABLE_GROUP,
        fields: [
          {
            name: 'id' as keyof TestModel['items'][0],
            label: 'ID',
            type: FormFieldType.NUMBER,
          },
          {
            name: 'title' as keyof TestModel['items'][0],
            label: 'Title',
            type: FormFieldType.TEXT,
          },
        ],
      };

      const field = FieldFactory.build(
        fieldConfig,
        testModel,
        mockForm,
      ) as unknown as RepeatableGroupSignalFormField<TestModel, 'items'>;

      expect(field.name).toBe('items');
      expect(field.type).toBe(FormFieldType.REPEATABLE_GROUP);
      expect(field.repeatableForms().length).toBe(1); // One item in testModel.items
      expect(typeof field.addItem).toBe('function');
      expect(typeof field.removeItem).toBe('function');
    });

    it('should build repeatable group field with proper forms', () => {
      const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
        name: 'items',
        heading: 'Items',
        type: FormFieldType.REPEATABLE_GROUP,
        fields: [
          {
            name: 'id' as keyof TestModel['items'][0],
            label: 'ID',
            type: FormFieldType.NUMBER,
          },
          {
            name: 'title' as keyof TestModel['items'][0],
            label: 'Title',
            type: FormFieldType.TEXT,
          },
        ],
      };

      const field = FieldFactory.build(
        fieldConfig,
        testModel,
        mockForm,
      ) as unknown as RepeatableGroupSignalFormField<TestModel, 'items'>;

      const forms = field.repeatableForms();
      expect(forms.length).toBe(1);

      const firstForm = forms[0];
      expect(firstForm.fields).toHaveLength(2);
      expect(firstForm.fields[0].name).toBe('id');
      expect(firstForm.fields[1].name).toBe('title');
      expect(firstForm.getValue()).toEqual({ id: 1, title: 'Item 1' });
    });

    it('should build repeatable group field for empty array', () => {
      const emptyModel = { ...testModel, items: [] };

      const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
        name: 'items',
        heading: 'Items',
        type: FormFieldType.REPEATABLE_GROUP,
        fields: [
          {
            name: 'id' as keyof TestModel['items'][0],
            label: 'ID',
            type: FormFieldType.NUMBER,
          },
        ],
      };

      const field = FieldFactory.build(
        fieldConfig,
        emptyModel,
        mockForm,
      ) as unknown as RepeatableGroupSignalFormField<TestModel, 'items'>;

      expect(field.repeatableForms().length).toBe(0);
    });

    it('should build repeatable group field with configuration', () => {
      const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
        name: 'items',
        heading: 'Items',
        type: FormFieldType.REPEATABLE_GROUP,
        config: { layout: 'flex' },
        fields: [
          {
            name: 'id' as keyof TestModel['items'][0],
            label: 'ID',
            type: FormFieldType.NUMBER,
          },
        ],
      };

      const field = FieldFactory.build(
        fieldConfig,
        testModel,
        mockForm,
      ) as unknown as RepeatableGroupSignalFormField<TestModel, 'items'>;

      const forms = field.repeatableForms();
      expect(forms[0].config).toEqual({ layout: 'flex' });
    });
  });

  describe('field validation and edge cases', () => {
    it('should handle validators correctly', () => {
      const validators = [
        (value: string) => (value ? null : 'Required'),
        (value: string) => (value.length > 2 ? null : 'Too short'),
      ];

      const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
        name: 'name',
        label: 'Name',
        type: FormFieldType.TEXT,
        validators,
      };

      const field = FieldFactory.build(fieldConfig, testModel, mockForm);

      expect(field.validators).toBe(validators);
    });

    it('should handle field configuration correctly', () => {
      const config = {
        placeholder: 'Enter your name',
        maxLength: 50,
      };

      const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
        name: 'name',
        label: 'Name',
        type: FormFieldType.TEXT,
        config,
      };

      const field = FieldFactory.build(fieldConfig, testModel, mockForm);

      expect(field.config).toBe(config);
    });

    it('should handle missing model values gracefully', () => {
      const partialModel = { name: 'John' } as TestModel;

      const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
        name: 'email',
        label: 'Email',
        type: FormFieldType.TEXT,
      };

      const field = FieldFactory.build(fieldConfig, partialModel, mockForm);

      expect(field.value()).toBeUndefined();
    });

    it('should create proper getForm reference', () => {
      const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
        name: 'name',
        label: 'Name',
        type: FormFieldType.TEXT,
      };

      const field = FieldFactory.build(fieldConfig, testModel, mockForm);

      expect(field.getForm()).toBe(mockForm);
    });

    it('should handle non-array value for repeatable group gracefully', () => {
      const invalidModel = { ...testModel, items: null } as TestModel & {
        items: null;
      };

      const fieldConfig: SignalFormFieldBuilderInput<TestModel> = {
        name: 'items',
        heading: 'Items',
        type: FormFieldType.REPEATABLE_GROUP,
        fields: [
          {
            name: 'id' as keyof TestModel['items'][0],
            label: 'ID',
            type: FormFieldType.NUMBER,
          },
        ],
      };

      const field = FieldFactory.build(
        fieldConfig,
        invalidModel,
        mockForm,
      ) as unknown as RepeatableGroupSignalFormField<TestModel, 'items'>;

      expect(field.repeatableForms().length).toBe(0);
    });
  });
});
