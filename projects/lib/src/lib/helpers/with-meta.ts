import {
  type MetaValidatorFn,
  type SignalValidatorFn,
  type ValidatorMeta,
} from '../models/signal-form.model';

export function withMeta<T extends keyof TModel, TModel>(
  fn: SignalValidatorFn<TModel[T], TModel>,
  meta: ValidatorMeta,
): MetaValidatorFn<TModel[T], TModel> {
  (
    fn as unknown as Omit<MetaValidatorFn<TModel[T], TModel>, '__meta'> & {
      __meta: ValidatorMeta;
    }
  ).__meta = meta;
  return fn as MetaValidatorFn<TModel[T], TModel>;
}
