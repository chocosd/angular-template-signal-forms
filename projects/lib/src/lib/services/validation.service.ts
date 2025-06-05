import { effect, inject, Injectable, Injector, signal } from '@angular/core';
import { firstValueFrom, from, timer } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  type SignalFormContainer,
  type SignalFormField,
  type ValidationConfig,
  type ValidationTrigger,
} from '../models/signal-form.model';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  private readonly injector = inject(Injector);

  private readonly validatedFields = new Map<
    string,
    {
      field: SignalFormField<any, any>;
      form: SignalFormContainer<any>;
      config: ValidationConfig;
    }
  >();

  // Blur refresh signal to track blur events
  private readonly blurRefresh = signal<string | null>(null);

  constructor() {
    this.setupSyncValidationEffect();
    this.setupBlurValidationEffect();
  }

  /**
   * Trigger blur validation for a specific field
   * This creates a refresh signal that triggers validation
   */
  public triggerBlurValidation(fieldPath: string): void {
    this.blurRefresh.set(fieldPath);
    // Reset after a short delay to allow for multiple triggers
    setTimeout(() => {
      if (this.blurRefresh() === fieldPath) {
        this.blurRefresh.set(null);
      }
    }, 50);
  }

  private setupSyncValidationEffect(): void {
    effect(
      () => {
        this.validatedFields.forEach(({ field, form, config }) => {
          const value = field.value();

          if (config.trigger === 'change') {
            this.runSyncValidation(field, value, form);
          }

          if (config.trigger === 'change' && field.asyncValidators?.length) {
            timer(config.debounceMs || 300).subscribe(() => {
              this.runAsyncValidation(field, value, form);
            });
          }
        });
      },
      { injector: this.injector },
    );
  }

  private setupBlurValidationEffect(): void {
    effect(
      () => {
        const blurredFieldPath = this.blurRefresh();

        if (!blurredFieldPath) {
          return;
        }

        const fieldData = this.validatedFields.get(blurredFieldPath);
        if (!fieldData) {
          return;
        }

        const { field, form, config } = fieldData;

        if (config.trigger === 'blur') {
          // Mark as touched since blur occurred
          field.touched.set(true);

          // Run validation
          this.runSyncValidation(field, field.value(), form);

          if (field.asyncValidators?.length) {
            this.runAsyncValidation(field, field.value(), form);
          }
        }
      },
      { injector: this.injector },
    );
  }

  /**
   * Register a field for validation
   */
  setupFieldValidation<TModel, K extends keyof TModel>(
    field: SignalFormField<TModel, K>,
    form: SignalFormContainer<TModel>,
  ): void {
    const fieldPath = field.path;
    const config = this.getValidationConfig(field);

    if (this.validatedFields.has(fieldPath)) {
      return;
    }

    this.validatedFields.set(fieldPath, { field, form, config });

    if (config.validateAsyncOnInit && field.asyncValidators?.length) {
      timer(0).subscribe(() => {
        this.runAsyncValidation(field, field.value(), form);
      });
    }
  }

  /**
   * Get the effective validation configuration for a field
   */
  private getValidationConfig<TModel, K extends keyof TModel>(
    field: SignalFormField<TModel, K>,
  ): ValidationConfig {
    const fieldConfig = field.validationConfig;
    const configFromFieldConfig = field.config?.validation;

    return {
      trigger:
        fieldConfig?.trigger || configFromFieldConfig?.trigger || 'change',
      debounceMs:
        fieldConfig?.debounceMs || configFromFieldConfig?.debounceMs || 300,
      validateAsyncOnInit:
        fieldConfig?.validateAsyncOnInit ||
        configFromFieldConfig?.validateAsyncOnInit ||
        false,
    };
  }

  /**
   * Run synchronous validation
   */
  private runSyncValidation<TModel, K extends keyof TModel>(
    field: SignalFormField<TModel, K>,
    value: TModel[K],
    form: SignalFormContainer<TModel>,
  ): void {
    const validators = field.validators ?? [];

    for (const validator of validators) {
      const error = validator(value, form);
      if (error) {
        field.error.set(error);
        return;
      }
    }

    field.error.set(null);
  }

  /**
   * Run asynchronous validation
   */
  private runAsyncValidation<TModel, K extends keyof TModel>(
    field: SignalFormField<TModel, K>,
    value: TModel[K],
    form: SignalFormContainer<TModel>,
  ): void {
    const asyncValidators = field.asyncValidators ?? [];

    if (asyncValidators.length === 0) {
      return;
    }

    field.validating.set(true);
    field.asyncError.set(null);

    // Run all async validators in parallel
    const validationPromises = asyncValidators.map((validator) => {
      const result = validator(value, form);
      return result instanceof Promise ? result : firstValueFrom(result);
    });

    from(Promise.all(validationPromises))
      .pipe(
        tap((results) => {
          // Find the first error
          const firstError = results.find((result) => result !== null);
          field.asyncError.set(firstError || null);
          field.validating.set(false);
        }),
      )
      .subscribe({
        error: (error) => {
          console.error('Async validation error:', error);
          field.asyncError.set('Validation failed');
          field.validating.set(false);
        },
      });
  }

  /**
   * Manually trigger validation for a field
   */
  triggerValidation<TModel, K extends keyof TModel>(
    field: SignalFormField<TModel, K>,
    trigger: ValidationTrigger = 'submit',
  ): void {
    const value = field.value();
    const fieldData = this.validatedFields.get(field.path);

    if (fieldData) {
      if (trigger === 'submit' || fieldData.config.trigger === 'change') {
        this.runSyncValidation(field, value, fieldData.form);
      }

      if (trigger === 'submit' && field.asyncValidators?.length) {
        this.runAsyncValidation(field, value, fieldData.form);
      }
    }
  }

  /**
   * Get the combined error for a field (sync + async)
   */
  getCombinedError<TModel, K extends keyof TModel>(
    field: SignalFormField<TModel, K>,
  ): string | null {
    const hasAsyncValidation = 'asyncError' in field && 'validating' in field;

    if (hasAsyncValidation && 'error' in field) {
      const syncError = (field as any).error();
      const asyncError = (field as any).asyncError();

      return syncError || asyncError;
    }

    if ('error' in field) {
      const error = (field as any).error();

      if (typeof error === 'boolean') {
        return error ? 'Field has errors' : null;
      }

      return error;
    }

    return null;
  }

  /**
   * Check if a field is currently validating or has any errors
   */
  isFieldInvalid<TModel, K extends keyof TModel>(
    field: SignalFormField<TModel, K>,
  ): boolean {
    // Check if field has async validation properties
    const hasAsyncValidation = 'asyncError' in field && 'validating' in field;

    if (hasAsyncValidation && 'error' in field) {
      const error = (field as any).error();
      const asyncError = (field as any).asyncError();
      const validating = (field as any).validating();

      return !!(error || asyncError || validating);
    }

    // For fields without async validation, just check sync error
    if ('error' in field) {
      const error = (field as any).error();

      // Handle both string | null and boolean error types
      if (typeof error === 'boolean') {
        return error;
      }

      return !!error;
    }

    return false;
  }

  /**
   * Validate all fields for submit trigger and return if form is valid
   */
  validateFormForSubmit<TModel>(
    fields: SignalFormField<TModel>[],
    form: SignalFormContainer<TModel>,
  ): boolean {
    let valid = true;

    for (const field of fields) {
      field.touched.set(true);

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

      const fieldData = this.validatedFields.get(field.path);
      if (fieldData) {
        this.runSyncValidation(field, field.value(), form);

        if (field.error()) {
          valid = false;
        }
      } else {
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
    }

    return valid;
  }

  private isFieldWithForm<TModel>(
    field: SignalFormField<TModel>,
  ): field is SignalFormField<TModel> & { form: SignalFormContainer<any> } {
    return 'form' in field && field.form !== undefined;
  }

  private isRepeatableField<TModel>(
    field: SignalFormField<TModel>,
  ): field is SignalFormField<TModel> & {
    repeatableForms: () => SignalFormContainer<any>[];
  } {
    return 'repeatableForms' in field && field.repeatableForms !== undefined;
  }
}
