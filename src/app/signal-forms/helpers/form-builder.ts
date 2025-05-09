import { computed, signal, WritableSignal } from '@angular/core';
import { FormStatus } from '@enums/form-status.enum';
import {
  type ErrorMessage,
  type SignalFormConfig,
  type SignalFormContainer,
  type SignalFormField,
  type SignalFormFieldBuilderInput,
  type SignalFormFieldForKey,
  type SignalValidatorFn,
} from '@models/signal-form.model';

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
      validateForm: this.validateForm(fields, form),
      reset: this.resetForm(fields, { ...args.model }),
      getErrors: this.getErrors(fields),
      config: args.config,
      save: this.save(fields, status, form, args.onSave),
    });

    return form;
  }

  private static anyTouched<TModel>(fields: SignalFormField<TModel>[]) {
    return computed(() => {
      return fields.some((field) =>
        'form' in field && field.form
          ? (field.form as SignalFormContainer<TModel>).anyTouched()
          : field.touched(),
      );
    });
  }

  private static getFieldOutputValue<TModel>(
    field: SignalFormField<TModel>,
  ): unknown {
    if ('form' in field && field.form) {
      return (
        field.form as SignalFormContainer<TModel[keyof TModel]>
      ).getValue();
    }

    //TODO: Tighten typing here for autocomplete
    return field.value();
  }

  private static anyDirty<TModel>(fields: SignalFormField<TModel>[]) {
    return computed(() => {
      return fields.some((field) =>
        'form' in field && field.form
          ? (field.form as SignalFormContainer<TModel>).anyDirty()
          : field.dirty(),
      );
    });
  }

  private static buildField<TModel>(
    field: SignalFormFieldBuilderInput<TModel>,
    model: TModel,
  ): SignalFormField<TModel> {
    const rawValue = model[field.name as keyof TModel];

    const valueSignal = signal<TModel[keyof TModel]>(rawValue);

    const baseField: any = {
      ...field,
      value: valueSignal,
      error: signal<string | null>(null),
      touched: signal<boolean>(false),
      dirty: signal<boolean>(false),
      focus: signal<boolean>(false),
    };

    if ('fields' in field && Array.isArray(field.fields)) {
      const nestedModel = model[field.name as keyof TModel];

      const nestedForm = this.createForm({
        model: nestedModel,
        fields: field.fields,
        config: field.config ?? { view: 'row', layout: 'flex' },
      });

      console.log(nestedForm);

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
        const initialValue = initialModel[field.name as keyof TModel];
        (field.value as WritableSignal<unknown>).set(initialValue);
        field.touched.set(false);
        field.dirty.set(false);
        field.error.set(null);
        field.focus.set(false);
      }
    };
  }

  private static save<TModel>(
    fields: SignalFormField<TModel>[],
    status: WritableSignal<FormStatus>,
    form: SignalFormContainer<TModel>,
    onSave?: (value: TModel) => void,
  ): () => void {
    return () => {
      const validate = this.validateForm(fields, form);
      if (!validate()) {
        status.set(FormStatus.Error);
        return;
      }

      status.set(FormStatus.Submitting);

      try {
        const getValue = this.getValue(fields);
        onSave?.(getValue());
        status.set(FormStatus.Success);

        for (const field of fields) {
          field.touched.set(false);
          field.dirty.set(false);
        }
      } catch {
        status.set(FormStatus.Error);
      }
    };
  }

  private static getErrors<TModel>(fields: SignalFormField<TModel>[]) {
    return (): ErrorMessage<TModel>[] =>
      fields
        .filter((field) => field.error())
        .map((field) => ({
          name: field.name,
          message: field.error() ?? '',
        }));
  }
}
