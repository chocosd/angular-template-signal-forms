import { FormFieldType } from '@enums/form-field-type.enum';
import { FormStatus } from '@enums/form-status.enum';
import {
  FormBuilder,
  type FormBuilderArgs,
  type SteppedFormBuilderArgs,
} from './form-builder';

interface TestModel {
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

interface NestedTestModel {
  user: {
    name: string;
    email: string;
  };
  settings: {
    theme: string;
    notifications: boolean;
  };
}

describe('FormBuilder', () => {
  let testModel: TestModel;
  let mockSaveHandler: jest.Mock;

  beforeEach(() => {
    testModel = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      isActive: true,
    };
    mockSaveHandler = jest.fn();
  });

  describe('createForm', () => {
    it('should create a basic form with all required properties', () => {
      const args: FormBuilderArgs<TestModel> = {
        model: testModel,
        fields: [
          { name: 'name', label: 'Name', type: FormFieldType.TEXT },
          { name: 'email', label: 'Email', type: FormFieldType.TEXT },
          { name: 'age', label: 'Age', type: FormFieldType.NUMBER },
        ],
        title: 'Test Form',
        onSave: mockSaveHandler,
      };

      const form = FormBuilder.createForm(args);

      // Verify basic properties
      expect(form.title).toBe('Test Form');
      expect(form.fields).toHaveLength(3);
      expect(form.status()).toBe(FormStatus.Idle);
      expect(form.config.layout).toBe('flex');

      // Verify field properties
      expect(form.fields[0].name).toBe('name');
      expect(form.fields[0].label).toBe('Name');
      expect(form.fields[0].type).toBe(FormFieldType.TEXT);
      expect(form.fields[0].value()).toBe('John Doe');

      // Verify computed properties exist
      expect(typeof form.anyTouched).toBe('function');
      expect(typeof form.anyDirty).toBe('function');
      expect(typeof form.value).toBe('function');
      expect(typeof form.rawValue).toBe('function');

      // Verify methods exist
      expect(typeof form.getField).toBe('function');
      expect(typeof form.getValue).toBe('function');
      expect(typeof form.getRawValue).toBe('function');
      expect(typeof form.validateForm).toBe('function');
      expect(typeof form.reset).toBe('function');
      expect(typeof form.getErrors).toBe('function');
      expect(typeof form.save).toBe('function');
    });

    it('should use default config when none provided', () => {
      const args: FormBuilderArgs<TestModel> = {
        model: testModel,
        fields: [{ name: 'name', label: 'Name', type: FormFieldType.TEXT }],
      };

      const form = FormBuilder.createForm(args);

      expect(form.config).toEqual({ layout: 'flex' });
    });

    it('should use provided config', () => {
      const customConfig = {
        layout: 'grid-area' as const,
        gridArea: [
          ['name', 'email'],
          ['age', '.'],
        ] as Array<(keyof TestModel | '.')[]>,
      };
      const args: FormBuilderArgs<TestModel> = {
        model: testModel,
        fields: [{ name: 'name', label: 'Name', type: FormFieldType.TEXT }],
        config: customConfig,
      };

      const form = FormBuilder.createForm(args);

      expect(form.config).toEqual(customConfig);
    });

    it('should create fields with correct values from model', () => {
      const args: FormBuilderArgs<TestModel> = {
        model: testModel,
        fields: [
          { name: 'name', label: 'Name', type: FormFieldType.TEXT },
          { name: 'email', label: 'Email', type: FormFieldType.TEXT },
          { name: 'age', label: 'Age', type: FormFieldType.NUMBER },
          {
            name: 'isActive',
            label: 'Active',
            type: FormFieldType.SWITCH,
          },
        ],
      };

      const form = FormBuilder.createForm(args);

      expect(form.fields[0].value()).toBe('John Doe');
      expect(form.fields[1].value()).toBe('john@example.com');
      expect(form.fields[2].value()).toBe(30);
      expect(form.fields[3].value()).toBe(true);
    });

    it('should handle parent form relationship', () => {
      const parentForm = FormBuilder.createForm({
        model: { nested: testModel },
        fields: [],
      });

      const args: FormBuilderArgs<TestModel> = {
        model: testModel,
        fields: [{ name: 'name', label: 'Name', type: FormFieldType.TEXT }],
        parentForm: parentForm as any,
        parentPath: 'nested',
      };

      const form = FormBuilder.createForm(args);

      expect(form.getParent?.()).toBe(parentForm);
      expect(form.parentForm()).toBe(parentForm);
    });

    it('should handle field retrieval via getField', () => {
      const args: FormBuilderArgs<TestModel> = {
        model: testModel,
        fields: [
          { name: 'name', label: 'Name', type: FormFieldType.TEXT },
          { name: 'email', label: 'Email', type: FormFieldType.TEXT },
        ],
      };

      const form = FormBuilder.createForm(args);

      const nameField = form.getField('name');
      const emailField = form.getField('email');

      expect(nameField.name).toBe('name');
      expect(nameField.value()).toBe('John Doe');
      expect(emailField.name).toBe('email');
      expect(emailField.value()).toBe('john@example.com');
    });

    it('should track touched and dirty states', () => {
      const args: FormBuilderArgs<TestModel> = {
        model: testModel,
        fields: [
          { name: 'name', label: 'Name', type: FormFieldType.TEXT },
          { name: 'email', label: 'Email', type: FormFieldType.TEXT },
        ],
      };

      const form = FormBuilder.createForm(args);

      // Initially not touched or dirty
      expect(form.anyTouched()).toBe(false);
      expect(form.anyDirty()).toBe(false);

      // Simulate field interaction
      form.fields[0].touched.set(true);
      expect(form.anyTouched()).toBe(true);

      form.fields[0].dirty.set(true);
      expect(form.anyDirty()).toBe(true);
    });

    it('should handle save functionality', () => {
      const args: FormBuilderArgs<TestModel> = {
        model: testModel,
        fields: [{ name: 'name', label: 'Name', type: FormFieldType.TEXT }],
        onSave: mockSaveHandler,
      };

      const form = FormBuilder.createForm(args);

      // Simulate save
      form.save();

      expect(mockSaveHandler).toHaveBeenCalled();
    });
  });

  describe('createSteppedForm', () => {
    it('should create stepped form with multiple steps', () => {
      const args: SteppedFormBuilderArgs<TestModel> = {
        model: testModel,
        steps: [
          {
            title: 'Personal Info',
            description: 'Enter your personal information',
            fields: [
              { name: 'name', label: 'Name', type: FormFieldType.TEXT },
              { name: 'age', label: 'Age', type: FormFieldType.NUMBER },
            ],
          },
          {
            title: 'Contact Info',
            description: 'Enter your contact information',
            fields: [
              { name: 'email', label: 'Email', type: FormFieldType.TEXT },
            ],
          },
        ],
        onSave: mockSaveHandler,
      };

      const steppedForm = FormBuilder.createSteppedForm(args);

      expect(steppedForm.steps).toHaveLength(2);
      expect(steppedForm.currentStep()).toBe(0);
      expect(steppedForm.status()).toBe(FormStatus.Idle);

      // Test step navigation properties
      expect(typeof steppedForm.validateStep).toBe('function');
      expect(typeof steppedForm.validateAll).toBe('function');
      expect(typeof steppedForm.isValidStep).toBe('function');

      // Test aggregate properties
      expect(typeof steppedForm.anyTouched).toBe('function');
      expect(typeof steppedForm.anyDirty).toBe('function');
      expect(typeof steppedForm.value).toBe('function');
    });

    it('should aggregate values from all steps', () => {
      const args: SteppedFormBuilderArgs<TestModel> = {
        model: testModel,
        steps: [
          {
            fields: [
              { name: 'name', label: 'Name', type: FormFieldType.TEXT },
              { name: 'age', label: 'Age', type: FormFieldType.NUMBER },
            ],
          },
          {
            fields: [
              { name: 'email', label: 'Email', type: FormFieldType.TEXT },
              {
                name: 'isActive',
                label: 'Active',
                type: FormFieldType.SWITCH,
              },
            ],
          },
        ],
      };

      const steppedForm = FormBuilder.createSteppedForm(args);

      const aggregatedValue = steppedForm.getValue();

      expect(aggregatedValue).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        isActive: true,
      });
    });

    it('should handle step navigation and current step', () => {
      const args: SteppedFormBuilderArgs<TestModel> = {
        model: testModel,
        steps: [
          {
            fields: [{ name: 'name', label: 'Name', type: FormFieldType.TEXT }],
          },
          {
            fields: [
              { name: 'email', label: 'Email', type: FormFieldType.TEXT },
            ],
          },
        ],
      };

      const steppedForm = FormBuilder.createSteppedForm(args);

      expect(steppedForm.currentStep()).toBe(0);

      // Simulate step navigation
      steppedForm.currentStep.set(1);
      expect(steppedForm.currentStep()).toBe(1);
    });

    it('should validate individual steps and all steps', () => {
      const args: SteppedFormBuilderArgs<TestModel> = {
        model: { ...testModel, name: '' }, // Invalid name
        steps: [
          {
            fields: [
              {
                name: 'name',
                label: 'Name',
                type: FormFieldType.TEXT,
                validators: [
                  (value: string) => (value ? null : 'Name is required'),
                ],
              },
            ],
          },
          {
            fields: [
              { name: 'email', label: 'Email', type: FormFieldType.TEXT },
            ],
          },
        ],
      };

      const steppedForm = FormBuilder.createSteppedForm(args);

      // Run validation first to populate error states
      steppedForm.validateStep();

      // Test step validation
      expect(steppedForm.isValidStep()).toBe(false); // Step 0 has invalid name
      steppedForm.currentStep.set(1);

      // Run validation for step 1
      steppedForm.validateStep();
      expect(steppedForm.isValidStep()).toBe(true); // Step 1 is valid

      // Test overall validation
      expect(steppedForm.validateAll()).toBe(false); // Overall form is invalid
    });

    it('should handle stepped form configuration', () => {
      const config = {
        canSkipIncompleteSteps: true,
        form: { layout: 'flex' as const },
      };

      const args: SteppedFormBuilderArgs<TestModel> = {
        model: testModel,
        steps: [
          {
            fields: [{ name: 'name', label: 'Name', type: FormFieldType.TEXT }],
          },
        ],
        config,
      };

      const steppedForm = FormBuilder.createSteppedForm(args);

      expect(steppedForm.config?.canSkipIncompleteSteps).toBe(true);
      expect(steppedForm.config?.form).toEqual({ layout: 'flex' });
    });

    it('should default canSkipIncompleteSteps to false', () => {
      const args: SteppedFormBuilderArgs<TestModel> = {
        model: testModel,
        steps: [
          {
            fields: [{ name: 'name', label: 'Name', type: FormFieldType.TEXT }],
          },
        ],
      };

      const steppedForm = FormBuilder.createSteppedForm(args);

      expect(steppedForm.config?.canSkipIncompleteSteps).toBe(false);
    });

    it('should handle field retrieval across all steps', () => {
      const args: SteppedFormBuilderArgs<TestModel> = {
        model: testModel,
        steps: [
          {
            fields: [{ name: 'name', label: 'Name', type: FormFieldType.TEXT }],
          },
          {
            fields: [
              { name: 'email', label: 'Email', type: FormFieldType.TEXT },
            ],
          },
        ],
      };

      const steppedForm = FormBuilder.createSteppedForm(args);

      const nameField = steppedForm.getField('name');
      const emailField = steppedForm.getField('email');

      expect(nameField.name).toBe('name');
      expect(emailField.name).toBe('email');
    });

    it('should throw error when field not found', () => {
      const args: SteppedFormBuilderArgs<TestModel> = {
        model: testModel,
        steps: [
          {
            fields: [{ name: 'name', label: 'Name', type: FormFieldType.TEXT }],
          },
        ],
      };

      const steppedForm = FormBuilder.createSteppedForm(args);

      expect(() =>
        steppedForm.getField('nonexistent' as keyof TestModel),
      ).toThrow('Field nonexistent not found in form');
    });

    it('should aggregate touched and dirty states from all steps', () => {
      const args: SteppedFormBuilderArgs<TestModel> = {
        model: testModel,
        steps: [
          {
            fields: [{ name: 'name', label: 'Name', type: FormFieldType.TEXT }],
          },
          {
            fields: [
              { name: 'email', label: 'Email', type: FormFieldType.TEXT },
            ],
          },
        ],
      };

      const steppedForm = FormBuilder.createSteppedForm(args);

      // Initially not touched or dirty
      expect(steppedForm.anyTouched()).toBe(false);
      expect(steppedForm.anyDirty()).toBe(false);

      // Touch field in first step
      steppedForm.steps[0].fields[0].touched.set(true);
      expect(steppedForm.anyTouched()).toBe(true);

      // Make field dirty in second step
      steppedForm.steps[1].fields[0].dirty.set(true);
      expect(steppedForm.anyDirty()).toBe(true);
    });

    it('should handle reset functionality', () => {
      const args: SteppedFormBuilderArgs<TestModel> = {
        model: testModel,
        steps: [
          {
            fields: [{ name: 'name', label: 'Name', type: FormFieldType.TEXT }],
          },
          {
            fields: [
              { name: 'email', label: 'Email', type: FormFieldType.TEXT },
            ],
          },
        ],
      };

      const steppedForm = FormBuilder.createSteppedForm(args);

      // Modify some values
      steppedForm.steps[0].fields[0].value.set('Modified Name');
      steppedForm.steps[0].fields[0].touched.set(true);

      // Reset the form
      steppedForm.reset();

      // Verify reset worked
      expect(steppedForm.steps[0].fields[0].value()).toBe('John Doe');
      expect(steppedForm.steps[0].fields[0].touched()).toBe(false);
    });
  });
});
