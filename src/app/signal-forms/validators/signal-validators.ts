import {
  type SignalFormContainer,
  type SignalValidatorFn,
} from '../models/signal-form.model';

export class SignalValidators {
  static required<TModel, K extends keyof TModel>(
    msg = 'This field is required.',
  ): SignalValidatorFn<K, TModel> {
    return (val) => (val == null || val === '' ? msg : null);
  }

  static min<T extends number, TModel>(
    min: number,
    msg?: string,
  ): SignalValidatorFn<T, TModel> {
    return (val) => (val < min ? (msg ?? `Must be at least ${min}`) : null);
  }

  static max<T extends number, TModel>(
    max: number,
    msg?: string,
  ): SignalValidatorFn<T, TModel> {
    return (val) => (val > max ? (msg ?? `Must be no more than ${max}`) : null);
  }

  static minLength<T extends string, TModel>(
    min: number,
    msg?: string,
  ): SignalValidatorFn<T, TModel> {
    return (val) =>
      val.length < min ? (msg ?? `Minimum ${min} characters`) : null;
  }

  static maxLength<T extends string, TModel>(
    max: number,
    msg?: string,
  ): SignalValidatorFn<T, TModel> {
    return (val) =>
      val.length > max ? (msg ?? `Maximum ${max} characters`) : null;
  }

  static isPositive<T extends number, TModel>(
    msg = 'Must be a positive number',
  ): SignalValidatorFn<T, TModel> {
    return (val) => (val <= 0 ? msg : null);
  }

  static hasValue<TModel, K extends keyof TModel>(
    fieldName: K,
  ): SignalValidatorFn<TModel[K], TModel> {
    return (_: TModel[K], form: SignalFormContainer<TModel>) =>
      form.getField(fieldName).value()
        ? null
        : `${String(fieldName)} is required`;
  }

  static matchField<TModel, TValue>(
    otherKey: keyof TModel,
    msg = 'Fields do not match',
  ): SignalValidatorFn<TValue, TModel> {
    return (val, form) =>
      val !== form.getField(otherKey)?.value?.() ? msg : null;
  }
}
