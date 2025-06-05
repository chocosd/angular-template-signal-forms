import { Signal } from '@angular/core';
import {
  type SignalFormContainer,
  type SignalValidatorFn,
} from '../models/signal-form.model';

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
