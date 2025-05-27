import { computed } from '@angular/core';
import { FormStatus } from '@enums/form-status.enum';
import {
  RepeatableGroupSignalFormField,
  SignalFormContainer,
  SignalFormField,
} from '@models/signal-form.model';

export class FieldUtils {
  static anyTouched<TModel>(fields: SignalFormField<TModel>[]) {
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

  static hasSaved<TModel>(form: SignalFormContainer<TModel>) {
    return computed((): boolean => {
      return (
        !form.anyTouched() &&
        !form.anyDirty() &&
        form.status() === FormStatus.Success
      );
    });
  }

  static anyDirty<TModel>(fields: SignalFormField<TModel>[]) {
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
}
