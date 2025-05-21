// # region
import { computed, isSignal, signal, WritableSignal } from '@angular/core';
import { FormFieldType } from '@enums/form-field-type.enum';
import { FormStatus } from '@enums/form-status.enum';
import {
  type CheckboxGroupSignalFormField,
  type DeepPartial,
  type ErrorMessage,
  type ItemOf,
  type RepeatableGroupBuilderField,
  type RepeatableGroupSignalFormField,
  type SignalFormConfig,
  type SignalFormContainer,
  type SignalFormField,
  type SignalFormFieldBuilderInput,
  type SignalFormFieldForKey,
  type SignalSteppedFormConfig,
  type SignalSteppedFormContainer,
  type SignalValidatorFn,
} from '@models/signal-form.model';
// #endregion
export class FormBuilder {
  static createForm<TModel>(args: {
    model: TModel;
    title?: string;
    fields: SignalFormFieldBuilderInput<TModel>[];
    config?: SignalFormConfig<TModel>;
    onSave?: (value: TModel) => void;
  }): SignalFormContainer<TModel> {
    const status = signal<FormStatus>(FormStatus.Idle);
    const form = {} as SignalFormContainer<TModel>;

    const fields: SignalFormField<TModel>[] = args.fields.map((field) =>
      this.buildField(field, args.model),
    );

    Object.assign(form, {
      title: args.title,
      status,
      fields,
      getField: this.getField(fields),
      anyTouched: this.anyTouched(fields),
      anyDirty: this.anyDirty(fields),
      value: computed(() => {
        return fields.reduce((acc, field) => {
          const isDisabled =
            typeof field.disabled === 'function'
              ? field.disabled(form)
              : field.disabled;

          if (isDisabled) {
            return acc;
          }

          if (!isDisabled) {
            (acc[field.name as keyof TModel] as unknown) =
              this.getFieldOutputValue(field);
          }

          return acc;
        }, {} as TModel);
      }),
      rawValue: computed(() => {
        return fields.reduce((acc, field) => {
          (acc[field.name as keyof TModel] as unknown) = field.value();
          return acc;
        }, {} as TModel);
      }),
      getValue: () => form.value(),
      getRawValue: () => form.rawValue(),
      hasSaved: computed(() => {
        return (
          !form.anyTouched() &&
          !form.anyDirty() &&
          form.status() === FormStatus.Success
        );
      }),
      validateForm: this.validateForm(fields, form),
      reset: this.resetForm(fields, { ...args.model }),
      getErrors: this.getErrors(fields),
      config: args.config,
      patchValue: this.patchForm(fields),
      setValue: this.setFormValue(fields),
      save: this.runSaveHandler(fields, status, form, args.onSave),
    });

    return form;
  }

  private static anyTouched<TModel>(fields: SignalFormField<TModel>[]) {
    return computed(() => {
      return fields.some((field) => {
        if ('form' in field && field.form) {
          return (field.form as SignalFormContainer<TModel>).anyTouched();
        }

        const repeatableFields =
          field as unknown as RepeatableGroupSignalFormField<
            TModel,
            keyof TModel
          >;

        if (repeatableFields.touched()) {
          return field.touched();
        }

        if (
          'repeatableForms' in field &&
          Array.isArray(repeatableFields.repeatableForms?.())
        ) {
          return repeatableFields
            .repeatableForms()
            .some((form) => form.anyTouched());
        }

        return field.touched();
      });
    });
  }

  private static getFieldOutputValue<TModel>(
    field: SignalFormField<TModel>,
  ): unknown {
    if (
      field.type === FormFieldType.REPEATABLE_GROUP &&
      'repeatableForms' in field
    ) {
      return (
        field as unknown as RepeatableGroupSignalFormField<TModel, keyof TModel>
      )
        .repeatableForms()
        .map((form) => form.getValue());
    }

    if (field.type === FormFieldType.CHECKBOX_GROUP) {
      const val = field.value();
      const valueType =
        (
          field as unknown as CheckboxGroupSignalFormField<
            TModel,
            keyof TModel,
            FormFieldType.CHECKBOX_GROUP
          >
        ).valueType ?? 'array';

      if (valueType === 'map') {
        return val;
      }

      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        return Object.entries(val)
          .filter(([, checked]) => checked)
          .map(([key]) => key);
      }

      return val;
    }

    if ('form' in field && field.form) {
      return (
        field.form as SignalFormContainer<TModel[keyof TModel]>
      ).getValue();
    }

    return field.value();
  }

  private static anyDirty<TModel>(fields: SignalFormField<TModel>[]) {
    return computed(() => {
      return fields.some((field) => {
        if ('form' in field && field.form) {
          return (field.form as SignalFormContainer<TModel>).anyDirty();
        }

        const repeatableFields =
          field as unknown as RepeatableGroupSignalFormField<
            TModel,
            keyof TModel
          >;

        if (repeatableFields.dirty()) {
          return field.dirty();
        }

        if (
          'repeatableForms' in field &&
          Array.isArray(repeatableFields.repeatableForms?.())
        ) {
          return repeatableFields
            .repeatableForms()
            .some((form) => form.anyDirty());
        }

        return field.dirty();
      });
    });
  }

  private static buildField<TModel>(
    field: SignalFormFieldBuilderInput<TModel>,
    model: TModel,
  ): SignalFormField<TModel> {
    const rawValue = model[field.name as keyof TModel];
    const baseField: any = {
      ...field,
      error: signal<string | null>(null),
      touched: signal<boolean>(false),
      dirty: signal<boolean>(false),
      focus: signal<boolean>(false),
    };

    // 📦 Repeatable Group Handling
    if (
      (field as RepeatableGroupBuilderField<TModel, keyof TModel>).type ===
      FormFieldType.REPEATABLE_GROUP
    ) {
      const items = Array.isArray(rawValue) ? rawValue : [];

      const repeatableForms = signal(
        items.map((item) =>
          this.createForm({
            model: item,
            fields: (field as RepeatableGroupBuilderField<TModel, keyof TModel>)
              .fields,
            config: (field.config as
              | SignalFormConfig<ItemOf<TModel[keyof TModel]>>
              | undefined) ?? { view: 'row', layout: 'flex' },
          }),
        ),
      );

      baseField.repeatableForms = repeatableForms;

      baseField.addItem = (initial = {}) => {
        const newForm = this.createForm({
          model: initial as ItemOf<TModel[keyof TModel]>,
          fields: (field as RepeatableGroupBuilderField<TModel, keyof TModel>)
            .fields,
          config: (field.config as
            | SignalFormConfig<ItemOf<TModel[keyof TModel]>>
            | undefined) ?? { view: 'row', layout: 'flex' },
        });

        repeatableForms.update((forms) => [...forms, newForm]);
        baseField.dirty.set(true);
        baseField.touched.set(true);
      };

      baseField.removeItem = (index: number) => {
        repeatableForms.update((forms) => forms.filter((_, i) => i !== index));
        baseField.dirty.set(true);
        baseField.touched.set(true);
      };

      // 🔁 Compute current values of repeatable group
      baseField.value = computed(() =>
        repeatableForms().map((form) => form.getValue()),
      );
      return baseField;
    }

    const valueSignal = signal<TModel[keyof TModel]>(rawValue);
    baseField.value = valueSignal;

    // 🧠 Attach options as signal if present
    if ('options' in field && Array.isArray(field.options)) {
      baseField.options = isSignal(field.options)
        ? field.options
        : signal(field.options);
    }

    // 🧱 Nested Form Group
    if ('fields' in field && Array.isArray(field.fields)) {
      const nestedModel = rawValue;

      const nestedForm = this.createForm({
        model: nestedModel as ItemOf<TModel[keyof TModel]>,
        fields: field.fields as SignalFormFieldBuilderInput<
          ItemOf<TModel[keyof TModel]>
        >[],
        config: (field.config as SignalFormConfig<
          ItemOf<TModel[keyof TModel]>
        >) ?? { view: 'row', layout: 'flex' },
      });

      baseField.form = nestedForm;
      baseField.fields = nestedForm.fields;
    }

    return baseField;
  }

  private static getField<TModel>(fields: SignalFormField<TModel>[]) {
    return <K extends keyof TModel>(key: K): SignalFormFieldForKey<TModel, K> =>
      fields.find((f) => f.name === key) as unknown as SignalFormFieldForKey<
        TModel,
        K
      >;
  }

  private static getValue<TModel>(fields: SignalFormField<TModel>[]) {
    return (): TModel =>
      fields.reduce((acc, field) => {
        (acc[field.name as keyof TModel] as unknown) = field.value();
        return acc;
      }, {} as TModel);
  }

  private static validateForm<TModel>(
    fields: SignalFormField<TModel>[],
    form: SignalFormContainer<TModel>,
  ) {
    return (): boolean => {
      let valid = true;

      for (const field of fields) {
        if ('form' in field && field.form) {
          const nestedValid = (
            field.form as SignalFormContainer<TModel[keyof TModel]>
          ).validateForm();
          valid = valid && nestedValid;
          continue;
        }

        const repeatableField =
          field as unknown as RepeatableGroupSignalFormField<
            TModel,
            keyof TModel
          >;

        if (
          'repeatableForms' in field &&
          Array.isArray(repeatableField.repeatableForms?.())
        ) {
          const nestedForms = repeatableField.repeatableForms();
          const allValid = nestedForms.every((form) => form.validateForm());
          valid = valid && allValid;
          continue;
        }

        field.touched.set(true);
        const validators = field.validators ?? [];

        for (const validator of validators as SignalValidatorFn<
          unknown,
          TModel
        >[]) {
          const error = validator(field.value(), form);
          if (error) {
            field.error.set(error);
            valid = false;
            break;
          } else {
            field.error.set(null);
          }
        }
      }

      return valid;
    };
  }

  private static resetForm<TModel>(
    fields: SignalFormField<TModel>[],
    initialModel: TModel,
  ): () => void {
    return () => {
      for (const field of fields) {
        if ('form' in field && field.form) {
          (field.form as SignalFormContainer<TModel[keyof TModel]>).reset();
          continue;
        }

        const initialValue = initialModel[field.name as keyof TModel];
        (field.value as WritableSignal<unknown>).set(initialValue);

        field.touched.set(false);
        field.dirty.set(false);
        field.error.set(null);
        field.focus.set(false);
      }
    };
  }

  private static runSaveHandler<TModel>(
    fields: SignalFormField<TModel>[],
    status: WritableSignal<FormStatus>,
    form: SignalFormContainer<TModel>,
    onSave?: (value: TModel) => void,
  ): () => void {
    return () => {
      const isValid = this.validateForm(fields, form);

      if (!isValid()) {
        status.set(FormStatus.Error);
        return;
      }

      status.set(FormStatus.Submitting);

      try {
        const getValue = this.getValue(fields);
        onSave?.(getValue());
        status.set(FormStatus.Success);

        for (const field of fields) {
          if ('form' in field && field.form) {
            (field.form as SignalFormContainer<TModel[keyof TModel]>).save();
          } else {
            field.touched.set(false);
            field.dirty.set(false);

            // disable if needed
            if (form.config?.disableUponComplete) {
              field.disabled = () => true;
            }
          }
        }

        if (!form.config?.disableUponComplete) {
          setTimeout(() => status.set(FormStatus.Idle), 100);
        }
      } catch {
        status.set(FormStatus.Error);
      }
    };
  }

  private static getErrors<TModel>(fields: SignalFormField<TModel>[]) {
    return (): ErrorMessage<TModel>[] => {
      const errors: ErrorMessage<TModel>[] = [];

      for (const field of fields) {
        if ('form' in field && field.form) {
          const nestedErrors = (
            field.form as SignalFormContainer<TModel[keyof TModel]>
          ).getErrors() as ErrorMessage<TModel>[];
          errors.push(...nestedErrors);
          continue;
        }

        if (field.error()) {
          errors.push({
            name: field.name,
            message: field.error() ?? '',
          });
        }
      }

      return errors;
    };
  }

  private static setFormValue<TModel>(
    fields: SignalFormField<TModel>[],
  ): (value: TModel) => void {
    return (value: TModel) => {
      for (const field of fields) {
        const fieldName = field.name as keyof TModel;
        const newValue = value[fieldName];

        if ('form' in field && field.form && typeof newValue === 'object') {
          (field.form as SignalFormContainer<TModel[keyof TModel]>).setValue(
            newValue,
          );
        } else {
          field.value.set(newValue);
          field.dirty.set(true);
        }
      }
    };
  }

  private static patchForm<TModel>(
    fields: SignalFormField<TModel>[],
  ): (patch: DeepPartial<TModel>) => void {
    return (patch: DeepPartial<TModel>) => {
      for (const field of fields) {
        const fieldName = field.name as keyof TModel;
        const newValue = patch[fieldName] as DeepPartial<TModel[keyof TModel]>;

        if (newValue === undefined) continue;

        if ('form' in field && field.form && typeof newValue === 'object') {
          (field.form as SignalFormContainer<TModel[keyof TModel]>).patchValue(
            newValue,
          );
        } else {
          field.value.set(newValue);
          field.dirty.set(true);
        }
      }
    };
  }

  static createSteppedForm<TModel>(args: {
    model: TModel;
    steps: {
      fields: SignalFormFieldBuilderInput<TModel>[];
      config?: SignalFormConfig<TModel>;
      title?: string;
      description?: string;
    }[];
    onSave?: (value: TModel) => void;
    config?: SignalSteppedFormConfig<TModel>;
  }): SignalSteppedFormContainer<TModel> {
    const currentStep = signal(0);
    const status = signal<FormStatus>(FormStatus.Idle);

    const steps: SignalFormContainer<TModel>[] = args.steps.map((step) =>
      FormBuilder.createForm({
        model: args.model,
        fields: step.fields,
        config: step.config,
      }),
    );

    const value = computed(() =>
      steps.reduce(
        (acc, step) => ({ ...acc, ...step.getValue() }),
        {} as TModel,
      ),
    );

    const validateStep = () => steps[currentStep()].validateForm();
    const isValidStep = () =>
      steps[currentStep()].fields.every((f) => !f.error());
    const validateAll = () => steps.every((step) => step.validateForm());

    const getErrors = (): ErrorMessage<TModel>[] =>
      steps.flatMap((step) =>
        step.getErrors().map(({ name, message }: ErrorMessage<TModel>) => ({
          name,
          message,
        })),
      );

    const getField = <K extends keyof TModel>(
      key: K,
    ): SignalFormFieldForKey<TModel, K> => {
      const allFields = steps.flatMap((step) => step.fields);
      return allFields.find(
        (f) => f.name === key,
      ) as unknown as SignalFormFieldForKey<TModel, K>;
    };

    const reset = () => steps.forEach((step) => step.reset());

    const anyTouched = computed(() => steps.some((step) => step.anyTouched()));
    const anyDirty = computed(() => steps.some((step) => step.anyDirty()));
    const hasSaved = computed(
      () => !anyDirty() && !anyTouched() && status() === FormStatus.Success,
    );

    const allFields = steps.flatMap((s) => s.fields);
    const virtualForm = {
      ...steps[0],
      fields: allFields,
      getValue: () => value(),
      anyDirty: computed(() => steps.some((s) => s.anyDirty())),
      anyTouched: computed(() => steps.some((s) => s.anyTouched())),
      config: args.config,
    } as SignalFormContainer<TModel>;

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
      save: this.runSaveHandler(allFields, status, virtualForm, args.onSave),
      status,
      config: {
        ...args.config,
        canSkipIncompleteSteps: args.config?.canSkipIncompleteSteps ?? false,
      },
    };
  }
}
