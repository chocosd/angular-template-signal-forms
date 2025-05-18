import { SignalValidatorFn } from '@models/signal-form.model';

export interface ValidatorMeta {
  required?: boolean;
  type?: string;
}

export type MetaValidatorFn<TVal, TModel> = SignalValidatorFn<TVal, TModel> & {
  readonly __meta?: ValidatorMeta;
};

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
