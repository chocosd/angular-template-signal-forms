/// <reference types="jest" />
import { computed, Directive, input, signal } from '@angular/core';
import { createDirectiveFactory, SpectatorDirective } from '@ngneat/spectator';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { FormStatus } from '../../../enums/form-status.enum';
import { type RuntimeTextSignalField } from '../../../models/signal-field-types.model';
import {
  type FormOption,
  type SignalFormContainer,
  type SignalValidatorFn,
} from '../../../models/signal-form.model';
import { BaseInputDirective } from './base-input.directive';

// Create a concrete implementation for testing
@Directive({
  standalone: true,
  selector: '[testInput]',
})
class TestInputDirective extends BaseInputDirective<
  RuntimeTextSignalField<TestModel, 'name'>,
  TestModel,
  'name'
> {
  override field = input.required<RuntimeTextSignalField<TestModel, 'name'>>();
  override form = input.required<SignalFormContainer<TestModel>>();

  // Make protected methods public for testing
  public testIsRequired() {
    return this.isRequired();
  }
  public testIsHidden() {
    return this.isHidden();
  }
  public testIsDisabled() {
    return this.isDisabled();
  }
  public testFilteredOptions() {
    return this.filteredOptions();
  }
}

interface TestModel {
  name: string;
}

describe.skip('BaseInputDirective', () => {
  let spectator: SpectatorDirective<TestInputDirective>;
  let mockField: RuntimeTextSignalField<TestModel, 'name'> & {
    options?: ReturnType<typeof computed<FormOption<string>[]>>;
  };
  let mockForm: SignalFormContainer<TestModel>;

  const createDirective = createDirectiveFactory({
    directive: TestInputDirective,
    imports: [TestInputDirective],
    shallow: true,
  });

  beforeEach(() => {
    mockForm = {
      fields: [],
      getField: jest.fn(),
      getValue: jest.fn(),
      getRawValue: jest.fn(),
      getErrors: jest.fn(),
      validateForm: jest.fn(),
      reset: jest.fn(),
      save: jest.fn(),
      value: signal({ name: '' }),
      rawValue: signal({ name: '' }),
      status: signal<FormStatus>(FormStatus.Idle),
      anyTouched: signal(false),
      anyDirty: signal(false),
      hasSaved: signal(false),
      patchValue: jest.fn(),
      setValue: jest.fn(),
      config: { layout: 'flex' },
      parentForm: null,
    } as unknown as SignalFormContainer<TestModel>;

    mockField = {
      name: 'name',
      label: 'Name',
      type: FormFieldType.TEXT,
      error: signal(null),
      touched: signal(false),
      dirty: signal(false),
      focus: signal(false),
      value: signal(''),
      getForm: () => mockForm,
      path: 'name',
      isDisabled: computed(() => false),
      isHidden: computed(() => false),
      options: computed(() => []),
      asyncError: signal(null),
      validating: signal(false),
      validators: [],
      config: {},
    };

    spectator = createDirective('<div testInput></div>', {
      hostProps: {
        field: mockField,
        form: mockForm,
      },
    });
  });

  it('should create', () => {
    expect(spectator.directive).toBeTruthy();
  });

  describe('isRequired', () => {
    it('should return false when no validators are present', () => {
      expect(spectator.directive.testIsRequired()).toBe(false);
    });

    it('should return true when required validator is present', () => {
      const requiredValidator: SignalValidatorFn<string, TestModel> = (
        value,
        form,
      ) => (value ? null : 'Required');
      Object.assign(requiredValidator, { __meta: { required: true } });
      mockField.validators = [requiredValidator];
      expect(spectator.directive.testIsRequired()).toBe(true);
    });
  });

  describe('isHidden', () => {
    it('should return false by default', () => {
      expect(spectator.directive.testIsHidden()).toBe(false);
    });

    it('should return true when hidden is true', () => {
      const isHidden = signal(false);
      mockField.isHidden = computed(() => isHidden());
      isHidden.set(true);
      spectator.detectChanges();
      expect(spectator.directive.testIsHidden()).toBe(true);
    });
  });

  describe('isDisabled', () => {
    it('should return false by default', () => {
      expect(spectator.directive.testIsDisabled()).toBe(false);
    });

    it('should return true when disabled is true', () => {
      const isDisabled = signal(false);
      mockField.isDisabled = computed(() => isDisabled());
      isDisabled.set(true);
      spectator.detectChanges();
      expect(spectator.directive.testIsDisabled()).toBe(true);
    });
  });

  describe('filteredOptions', () => {
    it('should return empty array when field has no options', () => {
      expect(spectator.directive.testFilteredOptions()).toEqual([]);
    });

    it('should return options when present', () => {
      const options = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
      ];
      mockField.options = computed(() => options);
      spectator.detectChanges();
      expect(spectator.directive.testFilteredOptions()).toEqual(options);
    });
  });

  describe('validation', () => {
    it('should set error when validator fails', () => {
      const customValidator: SignalValidatorFn<string, TestModel> = () =>
        'Invalid value';
      Object.assign(customValidator, { __meta: { type: 'custom' } });
      mockField.validators = [customValidator];
      mockField.value.set('test');
      expect(mockField.error()).toEqual('Invalid value');
    });

    it('should clear error when all validators pass', () => {
      const customValidator: SignalValidatorFn<string, TestModel> = () => null;
      Object.assign(customValidator, { __meta: { type: 'custom' } });
      mockField.validators = [customValidator];
      mockField.value.set('test');
      expect(mockField.error()).toBeNull();
    });
  });
});
