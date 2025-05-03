import { computed, signal, WritableSignal } from '@angular/core';
import { FormStatus } from '../enums/form-status.enum';
import {
  type ErrorMessage,
  type SignalFormContainer,
  type SignalFormField,
  type SignalFormFieldBuilderInput,
  type SignalFormFieldForKey,
  type ValidatorFn,
} from '../models/signal-form.model';

export class FormBuilder {
  // static createForm<TModel>(args: {
  //   model: TModel;
  //   title?: string;
  //   fields: SignalFormFieldBuilderInput<TModel>[];
  //   onSave?: (value: TModel) => void;
  // }): SignalFormContainer<TModel> {
  //   const status = signal<FormStatus>(FormStatus.Idle);
  //   const fields = args.fields.map((field) =>
  //     this.buildField(field, args.model),
  //   );

  //   const initialModel = { ...args.model };

  //   return {
  //     title: args.title,
  //     status,
  //     fields,

  //     getField: this.getField(fields),
  //     anyTouched: computed(() => fields.some((f) => f.touched())),
  //     getValue: this.getValue(fields),
  //     getRawValue: this.getValue(fields),
  //     validateForm: this.validateForm(fields),
  //     save: this.save(fields, status, args.onSave),
  //     reset: this.resetForm(fields, initialModel),
  //     getErrors: this.getErrors(fields),
  //     value: computed(() => {
  //       return fields.reduce((acc, field) => {
  //         const isDisabled =
  //           typeof field.disabled === 'function' ? field.disabled(this) : field.disabled;

  //         if (!isDisabled) {
  //           (acc[field.name as keyof TModel] as unknown) = field.value();
  //         }

  //         return acc;
  //       }, {} as TModel);
  //     }),
  //     rawValue: computed(() => {
  //       return fields.reduce((acc, field) => {
  //         (acc[field.name as keyof TModel] as unknown) = field.value();
  //         return acc;
  //       }, {} as TModel);
  //     }),

  //   };
  // }

  //
  // ---------- Helpers ----------
  //

  static createForm<TModel>(args: {
    model: TModel;
    title?: string;
    fields: SignalFormFieldBuilderInput<TModel>[];
    onSave?: (value: TModel) => void;
  }): SignalFormContainer<TModel> {
    const status = signal<FormStatus>(FormStatus.Idle);
    // Declare shell of form first
    const form = {} as SignalFormContainer<TModel>;

    const fields: SignalFormField<TModel>[] = args.fields.map((field) =>
      this.buildField(field, args.model, form),
    );

    // Build full form object
    Object.assign(form, {
      title: args.title,
      status,
      fields,
      getField: this.getField(fields),
      anyTouched: computed(() => fields.some((f) => f.touched())),
      anyDirty: computed(() => fields.some((f) => f.dirty())),
      value: computed(() => {
        return fields.reduce((acc, field) => {
          const isDisabled =
            typeof field.disabled === 'function'
              ? field.disabled(form)
              : field.disabled;

          if (!isDisabled) {
            (acc[field.name] as keyof TModel as unknown) = field.value();
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
      validateForm: this.validateForm(fields),
      reset: this.resetForm(fields, { ...args.model }),
      getErrors: this.getErrors(fields),
      save: this.save(fields, status, args.onSave),
    });

    // Now safely build fields using model
    // for (const field of args.fields) {
    //   fields.push(this.buildField(field, args.model));
    // }

    return form;
  }

  private static buildField<TModel>(
    field: SignalFormFieldBuilderInput<TModel>,
    model: TModel,
    form: SignalFormContainer<TModel>,
  ): SignalFormField<TModel> {
    return {
      ...field,
      value: signal(model[field.name as keyof TModel]),
      error: signal<string | null>(null),
      touched: signal<boolean>(false),
      dirty: signal<boolean>(false),
      focus: signal<boolean>(false),
    } as SignalFormField<TModel>;
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

  private static validateForm<TModel>(fields: SignalFormField<TModel>[]) {
    return (): boolean => {
      let valid = true;

      for (const field of fields) {
        field.touched.set(true);

        const validators = field.validators ?? [];
        for (const validator of validators as ValidatorFn<unknown>[]) {
          const error = validator(field.value());
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
    onSave?: (value: TModel) => void,
  ): () => void {
    return () => {
      const validate = this.validateForm(fields);
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
