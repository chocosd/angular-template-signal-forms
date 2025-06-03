// # region
import { computed, signal } from '@angular/core';
import { FormStatus } from '@enums/form-status.enum';
import {
  type ArrayFormBuilderArgs,
  type ArrayFormContainer,
  type ErrorMessage,
  type FormBuilderArgs,
  type SignalFormContainer,
  type SignalFormField,
  type SignalSteppedFormContainer,
  type SteppedFormBuilderArgs,
} from '@models/signal-form.model';
import { FormEngine } from '../engine/form-engine';
import { FieldFactory } from '../factory/field-factory';
import { FieldUtils } from '../utils/field-utils';
// #endregion

/**
 * FormBuilder - Main factory class for creating Signal Forms
 *
 * Provides static methods to create different types of forms:
 * - Single forms with standard fields
 * - Stepped/wizard forms with multiple pages
 * - Array forms for managing collections of items
 *
 * Features:
 * - Type-safe form creation with TypeScript generics
 * - Automatic field binding and validation setup
 * - Reactive computed properties for form state
 * - Built-in save/reset functionality
 * - Parent-child form relationships
 *
 * @example
 * ```typescript
 * const userForm = FormBuilder.createForm({
 *   model: { name: '', email: '' },
 *   fields: [
 *     { name: 'name', type: FormFieldType.TEXT, label: 'Name' },
 *     { name: 'email', type: FormFieldType.TEXT, label: 'Email' }
 *   ],
 *   onSave: (data) => console.log('Saved:', data)
 * });
 * ```
 */
export class FormBuilder {
  /**
   * Creates a standard single-page form with specified fields
   *
   * Builds a complete form container with reactive state management,
   * validation, and save functionality. The form automatically binds
   * to the provided model and creates appropriate field components.
   *
   * @template TModel - The TypeScript type of the form data model
   * @param args - Configuration object for the form
   * @param args.model - Initial data model for the form
   * @param args.fields - Array of field configurations
   * @param args.title - Optional form title
   * @param args.config - Layout and behavior configuration
   * @param args.onSave - Callback function when form is saved
   * @param args.parentForm - Parent form if this is a nested form
   * @param args.parentPath - Path prefix for nested form fields
   * @returns Complete form container with reactive state and methods
   *
   * @example
   * ```typescript
   * const contactForm = FormBuilder.createForm({
   *   model: { name: '', email: '', phone: '' },
   *   fields: [
   *     { name: 'name', type: FormFieldType.TEXT, label: 'Full Name' },
   *     { name: 'email', type: FormFieldType.TEXT, label: 'Email' },
   *     { name: 'phone', type: FormFieldType.TEXT, label: 'Phone' }
   *   ],
   *   config: { layout: 'flex', view: 'stacked' },
   *   onSave: (data) => saveContact(data)
   * });
   * ```
   */
  static createForm<TModel>(
    args: FormBuilderArgs<TModel>,
  ): SignalFormContainer<TModel> {
    const form: Partial<SignalFormContainer<TModel>> = {};
    const status = signal<FormStatus>(FormStatus.Idle);

    // Create all field instances using the factory
    const fields: SignalFormField<TModel>[] = args.fields.map((field) =>
      FieldFactory.build(
        field,
        args.model,
        form as SignalFormContainer<TModel>,
        args.parentPath,
      ),
    );

    // Assemble the complete form container with all methods and reactive properties
    Object.assign(form, {
      title: args.title,
      status,
      fields,
      getField: FormEngine.getField(fields),
      anyTouched: FieldUtils.anyTouched(fields),
      anyDirty: FieldUtils.anyDirty(fields),
      value: computed(() =>
        FormEngine.getValueFromFields(
          fields,
          form as SignalFormContainer<TModel>,
        ),
      ),
      rawValue: FormEngine.getRawValue(fields),
      getValue: () => (form as SignalFormContainer<TModel>).value(),
      getRawValue: () => (form as SignalFormContainer<TModel>).rawValue(),
      hasSaved: () => FieldUtils.hasSaved(form as SignalFormContainer<TModel>),
      validateForm: FormEngine.validateForm(
        fields,
        form as SignalFormContainer<TModel>,
      ),
      reset: FormEngine.resetForm(fields, { ...args.model }),
      getErrors: FormEngine.getErrors(fields),
      config: args.config ?? { layout: 'flex' },
      patchValue: FormEngine.patchForm(fields),
      setValue: FormEngine.setFormValue(fields),
      save: FormEngine.runSaveHandler(
        fields,
        status,
        form as SignalFormContainer<TModel>,
        args.onSave,
      ),
      getParent: () => args.parentForm,
      parentForm: computed(() => args.parentForm),
      saveButtonDisabled: computed(() => {
        const errors = FormEngine.getErrors(fields)();
        const hasErrors = errors.length > 0;

        if (!hasErrors) {
          return false; // No errors, button should be enabled
        }

        // If all errors are submit-triggered, allow the save button to be enabled
        // so users can re-submit to correct submit-only validation errors
        const allErrorsAreSubmitOnly = errors.every(
          (error: ErrorMessage<TModel>) => error.trigger === 'submit',
        );

        return !allErrorsAreSubmitOnly; // Disable only if there are non-submit errors
      }),
    });

    return form as SignalFormContainer<TModel>;
  }

  /**
   * Creates a multi-step form (wizard) with separate pages/steps
   *
   * Builds a stepped form container that manages multiple form pages,
   * allowing users to navigate between steps while maintaining state.
   * Each step is a complete form with its own fields and validation.
   *
   * @template TModel - The TypeScript type of the form data model
   * @param args - Configuration object for the stepped form
   * @param args.model - Initial data model shared across all steps
   * @param args.steps - Array of step configurations, each with fields
   * @param args.onSave - Callback function when entire form is saved
   * @param args.config - Global configuration for the stepped form
   * @param args.config.canSkipIncompleteSteps - Allow navigation to incomplete steps
   * @returns Stepped form container with navigation and validation methods
   *
   * @example
   * ```typescript
   * const wizardForm = FormBuilder.createSteppedForm({
   *   model: { personal: {}, contact: {}, preferences: {} },
   *   steps: [
   *     {
   *       title: 'Personal Info',
   *       fields: [
   *         { name: 'firstName', type: FormFieldType.TEXT, label: 'First Name' }
   *       ]
   *     },
   *     {
   *       title: 'Contact Info',
   *       fields: [
   *         { name: 'email', type: FormFieldType.TEXT, label: 'Email' }
   *       ]
   *     }
   *   ],
   *   config: { canSkipIncompleteSteps: false }
   * });
   * ```
   */
  static createSteppedForm<TModel>(
    args: SteppedFormBuilderArgs<TModel>,
  ): SignalSteppedFormContainer<TModel> {
    const currentStep = signal(0);
    const status = signal<FormStatus>(FormStatus.Idle);

    // Create individual form containers for each step
    const steps: SignalFormContainer<TModel>[] = args.steps.map((step) =>
      FormBuilder.createForm({
        model: args.model,
        fields: step.fields,
        config: step.config,
      }),
    );

    // Computed value that merges data from all steps
    const value = computed(() =>
      steps.reduce(
        (acc, step) => ({ ...acc, ...step.getValue() }),
        {} as TModel,
      ),
    );

    /** Validates only the current step */
    const validateStep = () => steps[currentStep()].validateForm();

    /** Checks if current step has no validation errors */
    const isValidStep = () =>
      steps[currentStep()].fields.every((f) => !f.error());

    /** Validates all steps in the form */
    const validateAll = () => steps.every((step) => step.validateForm());

    /** Gets all validation errors from all steps */
    const getErrors = (): ErrorMessage<TModel>[] =>
      steps.flatMap((step) => step.getErrors());

    /**
     * Retrieves a specific field by name from any step
     * @param key - The field name to search for
     * @returns The field instance
     * @throws Error if field is not found in any step
     */
    const getField = <K extends keyof TModel>(
      key: K,
    ): SignalFormField<TModel, K> => {
      const allFields = steps.flatMap((step) => step.fields);
      const field = allFields.find(
        (f: SignalFormField<TModel>) => f.name === key,
      );
      if (!field) {
        throw new Error(`Field ${String(key)} not found in form`);
      }
      return field as SignalFormField<TModel, K>;
    };

    /** Resets all steps to their initial state */
    const reset = () => steps.forEach((step) => step.reset());

    // Computed reactive properties for form state
    const anyTouched = computed(() => steps.some((step) => step.anyTouched()));
    const anyDirty = computed(() => steps.some((step) => step.anyDirty()));
    const hasSaved = computed(
      () => !anyDirty() && !anyTouched() && status() === FormStatus.Success,
    );

    // Create virtual form for save handler with all fields
    const allFields = steps.flatMap((s) => s.fields);
    const virtualForm: SignalFormContainer<TModel> = {
      ...steps[0],
      fields: allFields,
      getValue: () => value(),
      anyDirty: computed(() => steps.some((s) => s.anyDirty())),
      anyTouched: computed(() => steps.some((s) => s.anyTouched())),
      config: args.config?.form ?? { layout: 'flex' },
    };

    const saveButtonDisabled = computed(() => {
      const errors = getErrors();
      const hasErrors = errors.length > 0;

      if (!hasErrors) {
        return false; // No errors, button should be enabled
      }

      // If all errors are submit-triggered, allow the save button to be enabled
      // so users can re-submit to correct submit-only validation errors
      const allErrorsAreSubmitOnly = errors.every(
        (error: ErrorMessage<TModel>) => error.trigger === 'submit',
      );

      return !allErrorsAreSubmitOnly; // Disable only if there are non-submit errors
    });

    return {
      anyTouched,
      anyDirty,
      steps,
      currentStep,
      value,
      getValue: () => value(),
      validateStep,
      validateAll,
      isValidStep,
      getErrors,
      getField,
      hasSaved,
      reset,
      save: FormEngine.runSaveHandler(
        allFields,
        status,
        virtualForm,
        args.onSave,
      ),
      status,
      config: {
        ...args.config,
        canSkipIncompleteSteps: args.config?.canSkipIncompleteSteps ?? false,
      },
      saveButtonDisabled,
    };
  }

  /**
   * Creates a form for managing an array/collection of items
   *
   * Builds a dynamic form container that manages multiple instances
   * of the same form structure. Useful for managing lists of items
   * where users can add, remove, and edit multiple entries.
   *
   * @template TModel - The TypeScript type of individual items in the array
   * @param args - Configuration object for the array form
   * @param args.model - Initial array of items
   * @param args.fields - Field configuration shared by all items
   * @param args.title - Optional form title
   * @param args.config - Layout and behavior configuration
   * @param args.onSave - Callback when entire array is saved
   * @param args.onItemAdd - Callback when new item is added
   * @param args.onItemRemove - Callback when item is removed
   * @param args.defaultItem - Default values for new items
   * @param args.parentForm - Parent form if this is nested
   * @param args.parentPath - Path prefix for nested forms
   * @returns Array form container with add/remove/manage functionality
   *
   * @example
   * ```typescript
   * const contactsForm = FormBuilder.createFormFromArray({
   *   model: [{ name: '', email: '' }],
   *   fields: [
   *     { name: 'name', type: FormFieldType.TEXT, label: 'Name' },
   *     { name: 'email', type: FormFieldType.TEXT, label: 'Email' }
   *   ],
   *   defaultItem: { name: '', email: '' },
   *   onItemAdd: (item) => console.log('Added:', item),
   *   onItemRemove: (index) => console.log('Removed index:', index)
   * });
   * ```
   */
  static createFormFromArray<TModel>(
    args: ArrayFormBuilderArgs<TModel>,
  ): ArrayFormContainer<TModel> {
    const formsSignal = signal<SignalFormContainer<TModel>[]>([]);
    const status = signal<FormStatus>(FormStatus.Idle);

    // Create initial forms from the model array
    const initialForms = args.model.map((item, index) =>
      FormBuilder.createForm<TModel>({
        model: item,
        fields: args.fields,
        config: args.config,
        parentForm: args.parentForm,
        parentPath: args.parentPath
          ? `${args.parentPath}[${index}]`
          : `[${index}]`,
      }),
    );

    formsSignal.set(initialForms);

    /**
     * Adds a new item form to the array
     * @param item - Optional partial data for the new item
     */
    const addItem = (item?: Partial<TModel>) => {
      const currentForms = formsSignal();
      const defaultItemMerged = { ...args.defaultItem, ...item } as TModel;
      const newIndex = currentForms.length;

      const newForm = FormBuilder.createForm<TModel>({
        model: defaultItemMerged,
        fields: args.fields,
        config: args.config,
        parentForm: args.parentForm,
        parentPath: args.parentPath
          ? `${args.parentPath}[${newIndex}]`
          : `[${newIndex}]`,
      });

      formsSignal.update((forms) => [...forms, newForm]);
      args.onItemAdd?.(defaultItemMerged);
    };

    /**
     * Removes an item form from the array at the specified index
     * @param index - The index of the item to remove
     */
    const removeItem = (index: number) => {
      formsSignal.update((forms) => forms.filter((_, i) => i !== index));
      args.onItemRemove?.(index);
    };

    /**
     * Gets the current values from all item forms in the array
     * @returns Array of all current form values
     */
    const getValue = (): TModel[] => {
      return formsSignal().map((form) => form.getValue());
    };

    /**
     * Validates all item forms in the array
     * @returns True if all forms are valid, false otherwise
     */
    const validateAll = (): boolean => {
      return formsSignal().every((form) => form.validateForm());
    };

    /**
     * Gets all validation errors from all item forms
     * Prefixes each error path with the array index
     * @returns Array of all validation errors with indexed paths
     */
    const getErrors = (): ErrorMessage<TModel>[] => {
      return formsSignal().flatMap((form, index) =>
        form.getErrors().map((error) => ({
          ...error,
          path: `[${index}].${error.path}`,
        })),
      );
    };

    /**
     * Saves all item forms if validation passes
     * Updates status to Success or Error based on validation
     */
    const save = () => {
      if (validateAll()) {
        status.set(FormStatus.Success);
        args.onSave?.(getValue());
      } else {
        status.set(FormStatus.Error);
      }
    };

    /**
     * Resets all item forms to their original model values
     * Recreates all forms from the initial model array
     */
    const reset = () => {
      const resetForms = args.model.map((item, index) =>
        FormBuilder.createForm<TModel>({
          model: item,
          fields: args.fields,
          config: args.config,
          parentForm: args.parentForm,
          parentPath: args.parentPath
            ? `${args.parentPath}[${index}]`
            : `[${index}]`,
        }),
      );
      formsSignal.set(resetForms);
      status.set(FormStatus.Idle);
    };

    /**
     * Checks if any item form in the array has been touched
     * @returns True if any form has been touched by user interaction
     */
    const anyTouched = (): boolean => {
      return formsSignal().some((form) => form.anyTouched());
    };

    /**
     * Checks if any item form in the array has been modified
     * @returns True if any form has dirty (changed) values
     */
    const anyDirty = (): boolean => {
      return formsSignal().some((form) => form.anyDirty());
    };

    /**
     * Determines if the save button should be disabled based on validation errors
     * @returns True if save button should be disabled
     */
    const saveButtonDisabled = (): boolean => {
      const errors = getErrors();
      const hasErrors = errors.length > 0;

      if (!hasErrors) {
        return false; // No errors, button should be enabled
      }

      // If all errors are submit-triggered, allow the save button to be enabled
      // so users can re-submit to correct submit-only validation errors
      const allErrorsAreSubmitOnly = errors.every(
        (error: ErrorMessage<TModel>) => error.trigger === 'submit',
      );

      return !allErrorsAreSubmitOnly; // Disable only if there are non-submit errors
    };

    return {
      title: args.title,
      forms: formsSignal,
      value: getValue,
      addItem,
      removeItem,
      validateAll,
      getErrors,
      save,
      reset,
      anyTouched,
      anyDirty,
      status: () => status(),
      saveButtonDisabled,
    };
  }
}
