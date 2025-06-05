import { computed } from '@angular/core';
import { FormStatus } from '../../enums/form-status.enum';
import {
  type FieldWithForm,
  type RepeatableField,
  type SignalFormConfig,
  type SignalFormContainer,
  type SignalFormField,
} from '../../models/signal-form.model';

export class FieldUtils {
  /**
   * Creates default form configuration with theme settings
   * @param config - Optional user configuration to merge with defaults
   * @returns Complete configuration with defaults applied
   */
  static createDefaultConfig<TModel>(
    config?: SignalFormConfig<TModel>,
  ): SignalFormConfig<TModel> {
    const defaults = {
      layout: 'flex' as const,
      theme: 'light' as const,
      allowDarkMode: false,
    };

    if (!config) {
      return defaults;
    }

    // Apply theme defaults based on allowDarkMode setting
    const themeDefaults = {
      theme: config.allowDarkMode ? ('auto' as const) : ('light' as const),
      allowDarkMode: config.allowDarkMode ?? defaults.allowDarkMode,
    };

    return {
      ...defaults,
      ...config,
      ...themeDefaults,
    };
  }

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
