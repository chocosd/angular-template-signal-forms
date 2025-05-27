// form-engine.ts
import { computed, WritableSignal } from '@angular/core';
import { FormFieldType } from '@enums/form-field-type.enum';
import { FormStatus } from '@enums/form-status.enum';
import {
  CheckboxGroupSignalFormField,
  DeepPartial,
  ErrorMessage,
  RepeatableGroupSignalFormField,
  SignalFormContainer,
  SignalFormField,
  SignalFormFieldForKey,
  SignalValidatorFn,
} from '@models/signal-form.model';

export class FormEngine {
  static validateForm<TModel>(
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

  static resetForm<TModel>(
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

  static patchForm<TModel>(
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

  static setFormValue<TModel>(
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

  static getErrors<TModel>(fields: SignalFormField<TModel>[]) {
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

  static getValueFromFields<TModel>(
    fields: SignalFormField<TModel>[],
    form: SignalFormContainer<TModel>,
  ): TModel {
    return fields.reduce((acc, field) => {
      const name = field.name as keyof TModel;
      const disabled =
        typeof field.disabled === 'function'
          ? field.disabled(form)
          : field.disabled;

      if (!disabled) {
        (acc[name] as unknown) = FormEngine.getFieldOutputValue(field);
      }

      return acc;
    }, {} as TModel);
  }

  static getFieldOutputValue<TModel>(field: SignalFormField<TModel>): unknown {
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

  static getValue<TModel>(fields: SignalFormField<TModel>[]) {
    return (): TModel =>
      fields.reduce((acc, field) => {
        (acc[field.name as keyof TModel] as unknown) = field.value();
        return acc;
      }, {} as TModel);
  }

  static getField<TModel>(fields: SignalFormField<TModel>[]) {
    return <K extends keyof TModel>(key: K): SignalFormFieldForKey<TModel, K> =>
      fields.find((f) => f.name === key) as unknown as SignalFormFieldForKey<
        TModel,
        K
      >;
  }

  static getRawValue<TModel>(fields: SignalFormField<TModel>[]) {
    return computed(() => {
      return fields.reduce((acc, field) => {
        (acc[field.name as keyof TModel] as unknown) = field.value();
        return acc;
      }, {} as TModel);
    });
  }

  static runSaveHandler<TModel>(
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
}
