import { computed, WritableSignal } from '@angular/core';
import { FormFieldType } from '@enums/form-field-type.enum';
import { FormStatus } from '@enums/form-status.enum';
import {
  type DeepPartial,
  type ErrorMessage,
  type InferFieldType,
  type SignalFormContainer,
  type SignalFormField,
} from '@models/signal-form.model';

type FieldWithForm<TModel> = SignalFormField<TModel> & {
  form: SignalFormContainer<TModel[keyof TModel]>;
};

type RepeatableField<TModel> = SignalFormField<TModel> & {
  repeatableForms: WritableSignal<SignalFormContainer<any>[]>;
};

type CheckboxGroupField<TModel> = SignalFormField<TModel> & {
  type: FormFieldType.CHECKBOX_GROUP;
  valueType?: 'array' | 'map';
};

export class FormEngine {
  static validateForm<TModel>(
    fields: SignalFormField<TModel>[],
    form: SignalFormContainer<TModel>,
    validationService?: any,
  ) {
    return (): boolean => {
      if (
        validationService &&
        typeof validationService.validateFormForSubmit === 'function'
      ) {
        let valid = true;

        for (const field of fields) {
          if (this.isFieldWithForm(field)) {
            const nestedValid = field.form.validateForm();
            valid = valid && nestedValid;
            continue;
          }

          if (this.isRepeatableField(field)) {
            const nestedForms = field.repeatableForms();
            const allValid = nestedForms.every((form) => form.validateForm());
            valid = valid && allValid;
            continue;
          }
        }

        const fieldsValid = validationService.validateFormForSubmit(
          fields,
          form,
        );
        return valid && fieldsValid;
      }

      let valid = true;

      for (const field of fields) {
        if (this.isFieldWithForm(field)) {
          const nestedValid = field.form.validateForm();
          valid = valid && nestedValid;
          continue;
        }

        if (this.isRepeatableField(field)) {
          const nestedForms = field.repeatableForms();
          const allValid = nestedForms.every((form) => form.validateForm());
          valid = valid && allValid;
          continue;
        }

        field.touched.set(true);
        const validators = field.validators ?? [];

        for (const validator of validators) {
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
        if (this.isFieldWithForm(field)) {
          field.form.reset();
          continue;
        }

        const initialValue = initialModel[field.name];
        field.value.set(initialValue);
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
        const fieldName = field.name;
        const newValue = patch[fieldName];

        if (newValue === undefined) continue;

        if (this.isFieldWithForm(field) && typeof newValue === 'object') {
          field.form.patchValue(newValue as DeepPartial<TModel[keyof TModel]>);
        } else {
          field.value.set(newValue as TModel[keyof TModel]);
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
        const fieldName = field.name;
        const newValue = value[fieldName];

        if (this.isFieldWithForm(field) && typeof newValue === 'object') {
          field.form.setValue(newValue as TModel[keyof TModel]);
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
        if (this.isFieldWithForm(field)) {
          const nestedErrors = field.form.getErrors() as ErrorMessage<TModel>[];
          const updatedNestedErrors = nestedErrors.map((err) => ({
            ...err,
            path: `${field.path}.${err.path}`,
          }));
          errors.push(...updatedNestedErrors);
          continue;
        }

        if (this.isRepeatableField(field)) {
          const nestedForms = field.repeatableForms();
          nestedForms.forEach((form) => {
            const nestedErrors = form.getErrors();
            const updatedNestedErrors = nestedErrors.map((err) => ({
              name: err.name as keyof TModel,
              message: err.message,
              path: err.path,
              field: err.field,
              focusField: err.focusField,
            }));
            errors.push(...updatedNestedErrors);
          });
          continue;
        }

        if (field.error()) {
          errors.push({
            name: field.name,
            message: field.error() ?? '',
            path: field.path,
            field: field as SignalFormField<unknown>,
            focusField: () => {
              if (field.focus) {
                field.focus.set(true);
              }
            },
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
      const name = field.name;
      const disabled =
        typeof field.disabled === 'function'
          ? field.disabled(form)
          : field.disabled;

      if (!disabled) {
        acc[name] = this.getFieldOutputValue(field) as TModel[keyof TModel];
      }

      return acc;
    }, {} as TModel);
  }

  static getFieldOutputValue<TModel>(field: SignalFormField<TModel>): unknown {
    if (this.isRepeatableField(field)) {
      return field.repeatableForms().map((form) => form.getValue());
    }

    if (this.isCheckboxGroupField(field)) {
      const val = field.value();
      const valueType = field.valueType ?? 'array';

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

    if (this.isFieldWithForm(field)) {
      return field.form.getValue();
    }

    return field.value();
  }

  static getValue<TModel>(fields: SignalFormField<TModel>[]) {
    return (): TModel =>
      fields.reduce((acc, field) => {
        acc[field.name] = field.value() as TModel[keyof TModel];
        return acc;
      }, {} as TModel);
  }

  static getField<TModel>(fields: SignalFormField<TModel>[]) {
    return <K extends keyof TModel>(key: K): InferFieldType<TModel, K> => {
      const field = fields.find((f) => f.name === key);
      if (!field) {
        throw new Error(`Field ${String(key)} not found`);
      }

      // Handle repeatable fields
      if (this.isRepeatableField(field)) {
        return field as InferFieldType<TModel, K>;
      }

      // Handle nested form fields
      if (this.isFieldWithForm(field)) {
        return field as InferFieldType<TModel, K>;
      }

      // Handle regular fields
      return field as InferFieldType<TModel, K>;
    };
  }

  static getRawValue<TModel>(fields: SignalFormField<TModel>[]) {
    return computed(() => {
      return fields.reduce((acc, field) => {
        acc[field.name] = field.value() as TModel[keyof TModel];
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
          if (this.isFieldWithForm(field)) {
            field.form.save();
          } else {
            field.touched.set(false);
            field.dirty.set(false);
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

  private static isFieldWithForm<TModel>(
    field: SignalFormField<TModel>,
  ): field is FieldWithForm<TModel> {
    return 'form' in field && field.form !== undefined;
  }

  private static isRepeatableField<TModel>(
    field: SignalFormField<TModel>,
  ): field is RepeatableField<TModel> {
    return 'repeatableForms' in field && field.repeatableForms !== undefined;
  }

  private static isCheckboxGroupField<TModel>(
    field: SignalFormField<TModel>,
  ): field is CheckboxGroupField<TModel> {
    return field.type === FormFieldType.CHECKBOX_GROUP;
  }
}
