// field-factory.ts
import { computed, signal } from '@angular/core';
import { FormFieldType } from '../../enums/form-field-type.enum';
import {
  FieldWithOptions,
  type BaseFieldState,
  type ItemOf,
  type NestedGroupBuilderField,
  type RepeatableGroupBuilderField,
  type RepeatableGroupSignalFormField,
  type SignalFormContainer,
  type SignalFormField,
  type SignalFormFieldBuilderInput,
} from '../../models/signal-form.model';
import { SignalFormBuilder } from '../builder/form-builder';
import { FieldUtils } from '../utils/field-utils';

/**
 * FieldFactory - Factory class for building Signal Form fields
 *
 * Responsible for converting field builder configurations into fully
 * initialized SignalFormField instances with reactive state management.
 * Handles different field types including nested forms, repeatable groups,
 * and fields with static or computed options.
 *
 * Features:
 * - Type-safe field construction with TypeScript generics
 * - Automatic reactive state binding (value, error, validation, etc.)
 * - Support for nested form groups and repeatable field arrays
 * - Dynamic and computed options for select-type fields
 * - Path tracking for nested field references
 *
 * @example
 * ```typescript
 * const textField = FieldFactory.build(
 *   { name: 'email', type: FormFieldType.TEXT, label: 'Email' },
 *   { email: '' },
 *   formContainer,
 *   'user'
 * );
 * ```
 */
export class FieldFactory {
  /**
   * Builds a complete SignalFormField from a field configuration
   *
   * Converts field builder input into a reactive field with full state management.
   * Automatically detects field type (normal, nested group, or repeatable group)
   * and creates appropriate field structure with computed properties and signals.
   *
   * @template TModel - The TypeScript type of the form data model
   * @param field - Field configuration from form builder
   * @param model - Current form data model containing initial values
   * @param formRef - Reference to the parent form container
   * @param parentPath - Path prefix for nested fields (e.g., "user.address")
   * @returns Fully initialized SignalFormField with reactive state
   *
   * @example
   * ```typescript
   * // Build a simple text field
   * const nameField = FieldFactory.build(
   *   { name: 'firstName', type: FormFieldType.TEXT, label: 'First Name' },
   *   { firstName: 'John' },
   *   formContainer
   * );
   *
   * // Build a select field with options
   * const countryField = FieldFactory.build(
   *   {
   *     name: 'country',
   *     type: FormFieldType.SELECT,
   *     label: 'Country',
   *     options: [{ value: 'US', label: 'United States' }]
   *   },
   *   { country: 'US' },
   *   formContainer
   * );
   * ```
   */
  static build<TModel>(
    field: SignalFormFieldBuilderInput<TModel>,
    model: TModel,
    formRef: SignalFormContainer<TModel>,
    parentPath = '',
  ): SignalFormField<TModel> {
    const rawValue = model[field.name as keyof TModel];
    const referencePath = parentPath
      ? `${parentPath}.${String(field.name)}`
      : `${String(field.name)}`;

    // Create base reactive state that all fields share
    const baseFieldState: BaseFieldState<TModel, TModel[keyof TModel]> = {
      path: referencePath,
      error: signal<string | null>(null),
      asyncError: signal<string | null>(null),
      validating: signal<boolean>(false),
      touched: signal<boolean>(false),
      dirty: signal<boolean>(false),
      focus: signal<boolean>(false),
      value: signal(rawValue),
      getForm: () => formRef,
      isDisabled: computed(() =>
        typeof field.disabled === 'function'
          ? field.disabled(formRef)
          : (field.disabled ?? false),
      ),
      isHidden: computed(() =>
        typeof field.hidden === 'function'
          ? field.hidden(formRef)
          : (field.hidden ?? false),
      ),
    };

    // Handle Repeatable Group fields (arrays of forms)
    if (this.isRepeatableGroupField(field)) {
      return this.buildRepeatableGroup(
        { ...field, path: referencePath },
        rawValue,
        formRef,
        referencePath,
        baseFieldState,
      );
    }

    // Handle Nested Form Group fields (nested forms)
    if (this.isNestedGroupField(field)) {
      return this.buildNestedForm(
        { ...field, path: referencePath },
        rawValue,
        formRef,
        referencePath,
        baseFieldState,
      );
    }

    // Handle normal fields (text, select, etc.)
    let baseField = {
      ...field,
      ...baseFieldState,
      path: referencePath,
    } as SignalFormField<TModel>;

    // Handle options for fields that support them (select, radio, etc.)
    if (!this.hasOptions(field)) {
      return baseField;
    }
    if (this.hasComputedOptions(field)) {
      // Create computed options that react to form state changes
      const fieldWithComputedOptions = field as any;
      const computedOptionsSignal = computed(() => {
        const sourceValue =
          fieldWithComputedOptions.computedOptions.source(formRef);
        return fieldWithComputedOptions.computedOptions.filterFn(
          sourceValue,
          fieldWithComputedOptions.options,
          baseField.value(),
        );
      });

      return {
        ...baseField,
        options: computedOptionsSignal,
      } as unknown as SignalFormField<TModel>;
    }
    // Use static options wrapped in a signal
    return {
      ...baseField,
      options: signal(field.options),
    } as unknown as SignalFormField<TModel>;
  }

  /**
   * Type guard to check if a field is a repeatable group field
   * Repeatable groups contain arrays of form items that can be added/removed
   *
   * @template TModel - The form model type
   * @param field - Field configuration to check
   * @returns True if field is a repeatable group, false otherwise
   * @private
   */
  private static isRepeatableGroupField<TModel>(
    field: SignalFormFieldBuilderInput<TModel>,
  ): field is Extract<
    SignalFormFieldBuilderInput<TModel>,
    RepeatableGroupBuilderField<TModel, keyof TModel>
  > {
    return 'type' in field && field.type === FormFieldType.REPEATABLE_GROUP;
  }

  /**
   * Type guard to check if a field is a nested group field
   * Nested groups contain sub-forms with their own field collections
   *
   * @template TModel - The form model type
   * @param field - Field configuration to check
   * @returns True if field is a nested group, false otherwise
   * @private
   */
  private static isNestedGroupField<TModel>(
    field: SignalFormFieldBuilderInput<TModel>,
  ): field is Extract<
    SignalFormFieldBuilderInput<TModel>,
    NestedGroupBuilderField<TModel, keyof TModel>
  > {
    return (
      !('type' in field) && 'fields' in field && Array.isArray(field.fields)
    );
  }

  /**
   * Type guard to check if a field supports options (select, radio, etc.)
   * Uses Extract to get only field types that have options property
   *
   * @template TModel - The form model type
   * @param field - Field configuration to check
   * @returns True if field supports options, false otherwise
   * @private
   */
  private static hasOptions<TModel>(
    field: SignalFormFieldBuilderInput<TModel>,
  ): field is FieldWithOptions<TModel> {
    return (
      'type' in field &&
      'options' in field &&
      Array.isArray((field as FieldWithOptions<TModel>).options) &&
      [
        FormFieldType.SELECT,
        FormFieldType.RADIO,
        FormFieldType.CHECKBOX,
        FormFieldType.CHECKBOX_GROUP,
        FormFieldType.MULTISELECT,
        FormFieldType.CHIPLIST,
      ].includes((field as FieldWithOptions<TModel>).type)
    );
  }

  /**
   * Checks if a field has computed/dynamic options configuration
   * Computed options change based on form state or other reactive values
   *
   * @template TModel - The form model type
   * @param field - Field configuration to check
   * @returns True if field has computed options, false otherwise
   * @private
   */
  private static hasComputedOptions<TModel>(
    field: SignalFormFieldBuilderInput<TModel>,
  ): boolean {
    return (
      'computedOptions' in field && (field as any).computedOptions !== undefined
    );
  }

  /**
   * Builds a repeatable group field that manages an array of sub-forms
   *
   * Creates a field that contains multiple instances of the same form structure,
   * allowing users to add and remove items dynamically. Each item is a complete
   * form with its own validation and state management.
   *
   * @template TModel - The form model type
   * @param field - Repeatable group field configuration
   * @param rawValue - Current array value from the model
   * @param parentForm - Reference to the parent form container
   * @param referencePath - Path to this field for nested references
   * @param baseFieldState - Base reactive state for the field
   * @returns Configured repeatable group field with add/remove functionality
   * @private
   */
  private static buildRepeatableGroup<TModel>(
    field: RepeatableGroupBuilderField<TModel, keyof TModel>,
    rawValue: TModel[keyof TModel],
    parentForm: SignalFormContainer<TModel>,
    referencePath: string,
    baseFieldState: BaseFieldState<TModel, TModel[keyof TModel]>,
  ): SignalFormField<TModel> {
    const items = Array.isArray(rawValue) ? rawValue : [];
    type TItemType = ItemOf<TModel[keyof TModel]>;

    // Create individual forms for each array item
    const repeatableForms = signal(
      items.map((item, index) =>
        SignalFormBuilder.createForm<TItemType>({
          model: item,
          fields: field.fields,
          config: FieldUtils.createDefaultConfig(field.config),
          parentForm: parentForm as unknown as SignalFormContainer<unknown>,
          parentPath: `${referencePath}[${index}]`,
        }),
      ),
    );

    const repeatableField: RepeatableGroupSignalFormField<
      TModel,
      keyof TModel
    > = {
      ...field,
      error: signal(false),
      touched: signal(false),
      dirty: signal(false),
      value: computed(() => repeatableForms().map((f) => f.getValue())),
      repeatableForms,
      addItem: (initial = {} as TItemType) => {
        const currentForms = repeatableForms();
        const newIndex = currentForms.length;
        const newForm = SignalFormBuilder.createForm<TItemType>({
          model: initial,
          fields: field.fields,
          config: FieldUtils.createDefaultConfig(field.config),
          parentForm: parentForm as unknown as SignalFormContainer<unknown>,
          parentPath: `${referencePath}[${newIndex}]`,
        });

        repeatableForms.update((forms) => [...forms, newForm]);
        repeatableField.dirty.set(true);
        repeatableField.touched.set(true);
      },
      removeItem: (index: number) => {
        repeatableForms.update((forms) => forms.filter((_, i) => i !== index));
        repeatableField.dirty.set(true);
        repeatableField.touched.set(true);
      },
    };

    return repeatableField as unknown as SignalFormField<TModel>;
  }

  /**
   * Builds a nested form group field that contains a sub-form
   *
   * Creates a field that embeds another complete form within the current form.
   * The nested form has its own fields, validation, and state management while
   * being part of the parent form's structure.
   *
   * @template TModel - The form model type
   * @param field - Nested group field configuration
   * @param rawValue - Current nested object value from the model
   * @param parentForm - Reference to the parent form container
   * @param referencePath - Path to this field for nested references
   * @param baseFieldState - Base reactive state for the field
   * @returns Configured nested form field with embedded sub-form
   * @private
   */
  private static buildNestedForm<TModel>(
    field: NestedGroupBuilderField<TModel, keyof TModel>,
    rawValue: TModel[keyof TModel],
    parentForm: SignalFormContainer<TModel>,
    referencePath: string,
    baseFieldState: BaseFieldState<TModel, TModel[keyof TModel]>,
  ): SignalFormField<TModel> {
    type TNestedType = TModel[keyof TModel];

    // Create embedded form for the nested object
    const nestedForm = SignalFormBuilder.createForm<TNestedType>({
      model: rawValue,
      fields: field.fields,
      config: FieldUtils.createDefaultConfig(field.config),
      parentForm: parentForm as unknown as SignalFormContainer<unknown>,
      parentPath: referencePath,
    });

    const nestedField = {
      ...field,
      ...baseFieldState,
      form: nestedForm,
      fields: nestedForm.fields,
    };

    return nestedField as unknown as SignalFormField<TModel>;
  }
}
