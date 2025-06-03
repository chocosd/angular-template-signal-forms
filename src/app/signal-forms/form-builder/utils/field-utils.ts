import { computed, WritableSignal } from '@angular/core';
import { FormStatus } from '@enums/form-status.enum';
import {
  type SignalFormContainer,
  type SignalFormField,
} from '@models/signal-form.model';

type FieldWithForm<TModel> = SignalFormField<TModel> & {
  form: SignalFormContainer<TModel[keyof TModel]>;
};

type RepeatableField<TModel> = SignalFormField<TModel> & {
  repeatableForms: WritableSignal<SignalFormContainer<any>[]>;
};

export class FieldUtils {
  static anyTouched<TModel>(fields: SignalFormField<TModel>[]) {
    return computed(() => {
      return fields.some((field) => {
        if (this.isFieldWithForm(field)) {
          return field.form.anyTouched();
        }

        if (this.isRepeatableField(field)) {
          if (field.touched()) {
            return true;
          }

          return field.repeatableForms().some((form) => form.anyTouched());
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
        if (this.isFieldWithForm(field)) {
          return field.form.anyDirty();
        }

        if (this.isRepeatableField(field)) {
          if (field.dirty()) {
            return true;
          }

          return field.repeatableForms().some((form) => form.anyDirty());
        }

        return field.dirty();
      });
    });
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
}
