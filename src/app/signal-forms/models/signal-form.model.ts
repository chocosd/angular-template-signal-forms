import { Signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { FormFieldType } from '../enums/form-field-type.enum';
import { FormStatus } from '../enums/form-status.enum';

//
// ========== Config Types ==========
//

export interface BaseFieldConfig {
  placeholder?: string;
  hint?: string;
}

export interface TextFieldConfig extends BaseFieldConfig {
  prefix?: string;
  suffix?: string;
}

export enum CurrencyType {
  Cad = 'CAD',
  Usd = 'USD',
}

export interface NumberFieldConfig extends BaseFieldConfig {
  currency?: CurrencyType;
  prefix?: string;
  suffix?: string;
  precision?: number;
}

export interface CheckboxFieldConfig {
  layout?: 'inline' | 'stacked';
}

export interface DateTimeFieldConfig {
  format?: string;
}
export interface AutocompleteFieldConfig {
  debounceMs?: number;
  minChars?: number;
}
export interface SelectFieldConfig {
  multiselect?: boolean;
}
export interface FormOption {
  label: string;
  value: string | number | boolean;
}

export type ValidatorFn<T, TModel> = (
  value: T,
  form: SignalFormContainer<TModel>,
) => string | null;

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
  config?: ConfigTypeForField<TType>;
  validators?: ValidatorFn<TModel[TKey], TModel>[];
  computedValue?: (form: SignalFormContainer<TModel>) => TModel[TKey];
  hidden?: boolean | ((form: SignalFormContainer<TModel>) => boolean);
  disabled?: boolean | ((form: SignalFormContainer<TModel>) => boolean);
  type: TType;
  label: string;
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
> = TModel[K] extends object
  ? {
      name: K;
      heading: string;
      subheading: string;
      fields: SignalFormFieldBuilderInput<TModel[K]>[];
      hidden?: boolean | ((form: SignalFormContainer<TModel>) => boolean);
      disabled?: boolean | ((form: SignalFormContainer<TModel>) => boolean);
      config?: {
        view?: 'row' | 'stacked' | 'collapsable';
      };
    }
  : FieldBuilderByType<TModel, K>;

export type LoadOptionsFn = (
  search: string,
) => Observable<FormOption[]> | Promise<FormOption[]>;

type FieldBuilderByType<TModel, K extends keyof TModel> =
  | (BuilderField<TModel, K, FormFieldType.TEXT> & { type: FormFieldType.TEXT })
  | (BuilderField<TModel, K, FormFieldType.PASSWORD> & {
      type: FormFieldType.PASSWORD;
    })
  | (BuilderField<TModel, K, FormFieldType.TEXTAREA> & {
      type: FormFieldType.TEXTAREA;
    })
  | (BuilderField<TModel, K, FormFieldType.NUMBER> & {
      type: FormFieldType.NUMBER;
    })
  | (BuilderField<TModel, K, FormFieldType.CHECKBOX> & {
      type: FormFieldType.CHECKBOX;
      options: FormOption[];
    })
  | (BuilderField<TModel, K, FormFieldType.DATETIME> & {
      type: FormFieldType.DATETIME;
    })
  | (BuilderField<TModel, K, FormFieldType.SELECT> & {
      type: FormFieldType.SELECT;
      options: FormOption[];
    })
  | (BuilderField<TModel, K, FormFieldType.RADIO> & {
      type: FormFieldType.RADIO;
    })
  | (BuilderField<TModel, K, FormFieldType.AUTOCOMPLETE> & {
      type: FormFieldType.AUTOCOMPLETE;
      loadOptions: LoadOptionsFn;
    });

export type NestedSignalFormFields<TModel, K extends keyof TModel> = {
  name: K;
  label: string;
  fields: SignalFormFieldBuilderInput<TModel[K]>;
};

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
