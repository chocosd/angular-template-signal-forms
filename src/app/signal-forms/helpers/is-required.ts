import {
  MetaValidatorFn,
  type SignalValidator,
} from '@models/signal-form.model';

export function isRequired<TVal, TModel>(field: {
  validators?: SignalValidator<TModel, keyof TModel>[];
}): boolean {
  return (
    field.validators?.some(
      (v) =>
        (v as MetaValidatorFn<TModel[keyof TModel], TModel>).__meta?.required,
    ) ?? false
  );
}
