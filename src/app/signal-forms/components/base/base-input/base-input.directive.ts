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
import { SignalFormContainer } from '@models/signal-form.model';
import { MetaValidatorFn } from 'app/signal-forms/helpers/with-meta';
// #endregion

@Directive()
export abstract class BaseInputDirective<
  TField extends RuntimeFields<TModel, K>,
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> {
  public field = input.required<TField>();
  public form = input.required<SignalFormContainer<TModel>>();

  protected readonly injector = inject(Injector);

  protected readonly isRequired = computed(() =>
    (this.field().validators ?? []).some(
      (validator) =>
        (validator as MetaValidatorFn<TModel[K], unknown>).__meta?.required,
    ),
  );

  protected readonly isHidden = computed(() => {
    const { hidden } = this.field();
    return typeof hidden === 'function' ? hidden(this.form()) : !!hidden;
  });

  protected readonly isDisabled = computed(() => {
    const { disabled } = this.field();
    return typeof disabled === 'function' ? disabled(this.form()) : !!disabled;
  });

  protected readonly filteredOptions = computed(() => {
    const field = this.field();
    const form = this.form();

    if (!('options' in field)) {
      return [];
    }

    const options = (field as any).options();
    const dynamicOptionsFn = (field as any).dynamicOptions;

    if (typeof dynamicOptionsFn !== 'function') {
      return options;
    }

    return dynamicOptionsFn(form, options, field.value());
  });

  constructor() {
    this.initializeComputedValueEffect();
    this.watchComputedValueEffect();
    this.validationEffect();
  }

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

  private validationEffect(): void {
    effect(
      () => {
        const field = this.field();
        const value = field.value();

        const validators = field.validators ?? [];
        for (const validator of validators) {
          const error = validator(value as TModel[K], this.form());
          if (error) {
            field.error.set(error);
            return;
          }
        }

        field.error.set(null);
      },
      { injector: this.injector },
    );
  }

  protected setValue<T>(value: T, markTouched: boolean = true) {
    const field = this.field();
    if (markTouched) {
      field.touched.set(true);
      field.dirty.set(true);
    }
    (field.value as WritableSignal<T>).set(value);
  }
}
