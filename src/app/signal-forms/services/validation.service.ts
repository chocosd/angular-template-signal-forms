import {
  DestroyRef,
  effect,
  inject,
  Injectable,
  Injector,
} from '@angular/core';
import { BehaviorSubject, firstValueFrom, from, timer } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  SignalFormContainer,
  SignalFormField,
  ValidationConfig,
  ValidationTrigger,
} from '../models/signal-form.model';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  // Track which fields are set up for validation
  private readonly validatedFields = new Map<
    string,
    {
      field: SignalFormField<any, any>;
      form: SignalFormContainer<any>;
      config: ValidationConfig;
    }
  >();

  // Track trigger subjects separately to avoid type issues
  private readonly triggerSubjects = new Map<string, BehaviorSubject<any>>();

  constructor() {
    this.setupSyncValidationEffect();
    this.setupBlurValidationEffect();
  }

  private setupSyncValidationEffect(): void {
    effect(
      () => {
        // Process all registered fields for sync validation and change-based async validation
        this.validatedFields.forEach(({ field, form, config }) => {
          const value = field.value();

          // Always run sync validation immediately
          this.runSyncValidation(field, value, form);

          // Run async validation for change trigger with debouncing
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
        // Process fields that should validate on blur
        this.validatedFields.forEach(({ field, form, config }) => {
          if (
            config.trigger === 'blur' &&
            field.touched() &&
            field.asyncValidators?.length
          ) {
            this.runAsyncValidation(field, field.value(), form);
          }
        });
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

    // Don't re-register if already exists
    if (this.validatedFields.has(fieldPath)) {
      return;
    }

    // Register the field
    this.validatedFields.set(fieldPath, { field, form, config });

    // Initial async validation if configured
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
      // Always run sync validation
      this.runSyncValidation(field, value, fieldData.form);

      // Run async validation for submit trigger or if field has async validators
      if (trigger === 'submit' || field.asyncValidators?.length) {
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
}
