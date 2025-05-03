import { Signal, WritableSignal } from '@angular/core';
import { FormFieldType } from '../enums/form-field-type.enum';
import { FormStatus } from '../enums/form-status.enum';

//
// ========== Shared Types ==========
//

export interface BaseFieldConfig {
  placeholder?: string;
  hint?: string;
}

export interface TextFieldConfig extends BaseFieldConfig {
  minLength?: number;
  maxLength?: number;
}

export interface NumberFieldConfig extends BaseFieldConfig {
  min?: number;
  max?: number;
}

export interface CheckboxFieldConfig {
  label?: string;
}

export interface DateTimeFieldConfig {
  format?: string;
}

export interface SelectFieldConfig {
  options: { label: string; value: string | number }[];
}

export interface AutocompleteFieldConfig {
  loadOptions: (search: string) => Promise<FormOption[]>;
}

export interface FormOption {
  label: string;
  value: string | number | boolean;
}

export type ValidatorFn<T> = (value: T) => string | null;

//
// ========== Config Type Mapping ==========
//

export type ConfigTypeForField<TType extends FormFieldType> = TType extends
  | FormFieldType.TEXT
  | FormFieldType.PASSWORD
  | FormFieldType.TEXTAREA
  ? TextFieldConfig
  : TType extends FormFieldType.NUMBER
    ? NumberFieldConfig
    : TType extends FormFieldType.CHECKBOX
      ? CheckboxFieldConfig
      : TType extends FormFieldType.DATETIME
        ? DateTimeFieldConfig
        : TType extends FormFieldType.SELECT | FormFieldType.RADIO
          ? SelectFieldConfig
          : TType extends FormFieldType.AUTOCOMPLETE
            ? AutocompleteFieldConfig
            : never;

//
// ========== BuilderField Type ==========
//

export type BuilderField<
  TModel,
  TKey extends keyof TModel,
  TType extends FormFieldType,
> = {
  name: TKey;
  label: string;
  type: TType;
  config?: ConfigTypeForField<TType>;
  validators?: ValidatorFn<TModel[TKey]>[];
  computedValue?: (form: SignalFormContainer<TModel>) => TModel[TKey];
  hide?: boolean | ((form: SignalFormContainer<TModel>) => boolean);
  disabled?: boolean | ((form: SignalFormContainer<TModel>) => boolean);
  loadOptions?: TType extends FormFieldType.AUTOCOMPLETE
    ? (search: string) => Promise<FormOption[]>
    : never;
  options?: TType extends FormFieldType.CHECKBOX ? FormOption[] : never;
};

//
// ========== BuilderInput Inference ==========
//

export type SignalFormFieldBuilderInput<TModel> = {
  [K in keyof TModel]: SignalFormFieldBuilderForKey<TModel, K>;
}[keyof TModel];

type SignalFormFieldBuilderForKey<
  TModel,
  K extends keyof TModel,
> = TModel[K] extends string
  ? BuilderField<
      TModel,
      K,
      FormFieldType.TEXT | FormFieldType.PASSWORD | FormFieldType.TEXTAREA
    >
  : TModel[K] extends number
    ? BuilderField<TModel, K, FormFieldType.NUMBER>
    : TModel[K] extends boolean
      ? BuilderField<TModel, K, FormFieldType.CHECKBOX>
      : TModel[K] extends Date
        ? BuilderField<TModel, K, FormFieldType.DATETIME>
        : TModel[K] extends string | number
          ? BuilderField<
              TModel,
              K,
              | FormFieldType.SELECT
              | FormFieldType.RADIO
              | FormFieldType.AUTOCOMPLETE
            >
          : never;

//
// ========== Runtime Signal Fields ==========
//

export interface BaseSignalFormField<TValue> {
  error: WritableSignal<string | null>;
  touched: WritableSignal<boolean>;
  dirty: WritableSignal<boolean>;
  focus: WritableSignal<boolean>;
  value: WritableSignal<TValue>;
}

export type SignalFormField<TModel> = {
  [K in keyof TModel]: SignalFormFieldForKey<TModel, K>;
}[keyof TModel];

export type SignalFormFieldForKey<
  TModel,
  K extends keyof TModel,
> = TModel[K] extends infer TVal
  ? BaseSignalFormField<TVal> &
      BuilderField<TModel, K, FormFieldType> & { name: K }
  : never;

//
// ========== Form Container ==========
//

export type ErrorMessage<TModel> = { name: keyof TModel; message: string };

export interface SignalFormContainer<TModel> {
  title?: string;
  status: WritableSignal<FormStatus>;
  fields: SignalFormField<TModel>[];

  getField<K extends keyof TModel>(key: K): SignalFormFieldForKey<TModel, K>;

  anyTouched: Signal<boolean>;
  anyDirty: Signal<boolean>;
  getValue(): TModel;
  getRawValue(): TModel;
  getErrors(): ErrorMessage<TModel>[];
  validateForm(): boolean;
  reset(): void;
  save(): void;
  value: Signal<TModel>;
  rawValue: Signal<TModel>;
}

export type ElementTypeForField<T extends FormFieldType> = T extends
  | FormFieldType.TEXT
  | FormFieldType.PASSWORD
  | FormFieldType.NUMBER
  ? HTMLInputElement
  : T extends FormFieldType.TEXTAREA
    ? HTMLTextAreaElement
    : T extends FormFieldType.CHECKBOX
      ? HTMLInputElement
      : T extends FormFieldType.SELECT | FormFieldType.RADIO
        ? HTMLSelectElement
        : never;
