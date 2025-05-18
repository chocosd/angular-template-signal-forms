import { SignalValidator } from '@models/signal-form.model';

export function isRequired<TVal, TModel>(field: {
  validators?: SignalValidator<TModel, keyof TModel>[];
}): boolean {
  return field.validators?.some((v) => (v as any).__meta?.required) ?? false;
}
