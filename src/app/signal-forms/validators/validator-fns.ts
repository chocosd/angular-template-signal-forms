import { Signal } from '@angular/core';
import {
  type SignalFormContainer,
  type SignalValidatorFn,
} from '@models/signal-form.model';

/**
 * Allows validation against a possibly missing signal (e.g. cross-step), with access to the full form context.
 */
export function withOptionalSignalValidation<TVal, TDep, TModel>(
  getDepSignal: () => Signal<TDep> | undefined,
  validate: (
    val: TVal,
    depValue: TDep | undefined,
    form: SignalFormContainer<TModel>,
  ) => string | null,
): SignalValidatorFn<TVal, TModel> {
  return (val, form) => {
    const depSignal = getDepSignal();
    const depValue = depSignal?.();
    return validate(val, depValue, form);
  };
}

/**
 * Variant for guaranteed signal access (same-step dependencies), with full access to the form context.
 */
export function withSignalValidation<TVal, TDep, TModel>(
  getDepSignal: () => Signal<TDep>,
  validate: (
    val: TVal,
    depValue: TDep | undefined,
    form: SignalFormContainer<TModel>,
  ) => string | null,
): SignalValidatorFn<TVal, TModel> {
  return (val, form) => {
    const depValue = getDepSignal()();
    return validate(val, depValue, form);
  };
}
