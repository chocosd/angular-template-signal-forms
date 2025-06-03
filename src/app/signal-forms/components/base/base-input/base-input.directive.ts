// #region
import {
  computed,
  Directive,
  effect,
  inject,
  Injector,
  input,
  WritableSignal,
} from '@angular/core';
import { type RuntimeFields } from '@models/signal-field-types.model';
import {
  MetaValidatorFn,
  type SignalFormContainer,
} from '@models/signal-form.model';
// #endregion

/**
 * Base directive for form input components that provides common functionality
 * such as validation, computed values, and options filtering.
 *
 * This directive should be extended by all form field components to provide
 * consistent behavior across the form system.
 *
 * @template TField - The specific field type extending RuntimeFields
 * @template TModel - The form model type
 * @template K - The field key type
 *
 * @example
 * ```typescript
 * export class FormTextFieldComponent extends BaseInputDirective<
 *   RuntimeTextSignalField<TModel, K>,
 *   TModel,
 *   K
 * > {
 *   // Component implementation
 * }
 * ```
 */
@Directive()
export abstract class BaseInputDirective<
  TField extends RuntimeFields<TModel, K>,
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> {
  /**
   * The field configuration and state
   */
  public field = input.required<TField>();

  /**
   * Computed form reference obtained from the field
   */
  protected readonly form = computed<SignalFormContainer<TModel>>(() =>
    this.field().getForm(),
  );

  /**
   * Angular injector for effect management
   */
  protected readonly injector = inject(Injector);

  /**
   * Computed property indicating if the field is required based on validators
   */
  protected readonly isRequired = computed(() =>
    (this.field().validators ?? []).some(
      (validator) =>
        (validator as MetaValidatorFn<TModel[K], unknown>).__meta?.required,
    ),
  );

  /**
   * Computed property indicating if the field should be hidden
   */
  protected readonly isHidden = computed(() => {
    const { hidden } = this.field();
    return typeof hidden === 'function' ? hidden(this.form()) : !!hidden;
  });

  /**
   * Computed property indicating if the field should be disabled
   */
  protected readonly isDisabled = computed(() => {
    const { disabled } = this.field();
    return typeof disabled === 'function' ? disabled(this.form()) : !!disabled;
  });

  /**
   * Computed property that returns filtered options for fields that support options.
   * For fields without options, returns an empty array.
   *
   * Applies dynamic options filtering if a dynamicOptions function is provided.
   */
  protected readonly filteredOptions = computed(() => {
    const field = this.field();
    const form = this.form();

    // Check if field has options property
    if (!('options' in field) || typeof (field as any).options !== 'function') {
      return [];
    }

    const options = (field as any).options();
    const dynamicOptionsFn = (field as any).dynamicOptions;

    if (typeof dynamicOptionsFn !== 'function') {
      return options;
    }

    return dynamicOptionsFn(form, options, field.value());
  });

  /**
   * Initializes the directive by setting up reactive effects for
   * computed values and value watching
   */
  constructor() {
    this.initializeComputedValueEffect();
    this.watchComputedValueEffect();
  }

  /**
   * Sets up an effect to initialize computed values when the field is first loaded.
   * This only runs once to set the initial computed value.
   *
   * @private
   */
  private initializeComputedValueEffect(): void {
    effect(
      () => {
        const field = this.field();
        if (!field.computedValue) return;

        const initialValue = field.computedValue(this.form());
        this.setValue(initialValue, false);
      },
      { injector: this.injector },
    );
  }

  /**
   * Sets up an effect to watch for changes in computed values and update
   * the field value accordingly. This runs whenever dependencies change.
   *
   * @private
   */
  private watchComputedValueEffect(): void {
    effect(
      () => {
        const field = this.field();
        if (!field.computedValue) return;

        const newValue = field.computedValue(this.form());
        this.setValue(newValue, false);
      },
      { injector: this.injector },
    );
  }

  /**
   * Updates the field value and optionally marks it as touched and dirty.
   *
   * @param value - The new value to set
   * @param markTouched - Whether to mark the field as touched and dirty (default: true)
   *
   * @protected
   */
  protected setValue<T>(value: T, markTouched: boolean = true) {
    const field = this.field();
    if (markTouched) {
      field.touched.set(true);
      field.dirty.set(true);
    }
    (field.value as WritableSignal<T>).set(value);
  }
}
