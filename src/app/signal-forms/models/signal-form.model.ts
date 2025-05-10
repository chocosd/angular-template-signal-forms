import { Signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { FormFieldType } from '../enums/form-field-type.enum';
import { FormStatus } from '../enums/form-status.enum';
import { ConfigTypeForField } from './signal-field-configs.model';
export interface FormOption<TResult = string | number | boolean | object> {
  label: string;
  value: TResult;
}

export type SignalValidatorFn<T, TModel> = (
  value: T,
  form: SignalFormContainer<TModel>,
) => string | null;

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
  validators?: SignalValidatorFn<TModel[TKey], TModel>[];
  computedValue?: (form: SignalFormContainer<TModel>) => TModel[TKey];
  hidden?: boolean | ((form: SignalFormContainer<TModel>) => boolean);
  disabled?: boolean | ((form: SignalFormContainer<TModel>) => boolean);
  type: TType;
  label: string;
};

//
// ========== BuilderInput Inference ==========
//

export type DynamicOptions<TModel, K extends keyof TModel> = (
  form: SignalFormContainer<TModel>,
  options: FormOption[],
  currentValue: TModel[K],
) => FormOption[];

type IsPlainObject<T> = T extends object
  ? T extends Date | unknown[] | Function
    ? false
    : T extends FormOption
      ? false
      : true
  : false;

export type SignalFormFieldBuilderInput<TModel> = {
  [K in keyof TModel]: SignalFormFieldBuilderForKey<TModel, K>;
}[keyof TModel];

type SignalFormFieldBuilderForKey<TModel, K extends keyof TModel> =
  IsPlainObject<TModel[K]> extends true
    ? {
        name: K;
        heading: string;
        subheading: string;
        fields: SignalFormFieldBuilderInput<TModel[K]>[];
        hidden?: boolean | ((form: SignalFormContainer<TModel>) => boolean);
        disabled?: boolean | ((form: SignalFormContainer<TModel>) => boolean);
        config?: SignalFormConfig<TModel[K]>;
      }
    : FieldBuilderByType<TModel, K>;

export type SignalFormConfig<TModel> =
  | GridSignalFormConfig<TModel>
  | FlexSignalFormConfig;

export type BaseSignalFormConfig = {
  view?: 'row' | 'stacked' | 'collapsable';
  layout: 'flex' | 'grid-area';
};

export interface GridSignalFormConfig<TModel> extends BaseSignalFormConfig {
  layout: 'grid-area';
  gridArea: Array<keyof TModel | '.'>[];
}

export interface FlexSignalFormConfig extends BaseSignalFormConfig {
  layout: 'flex';
}

export type LoadOptionsFn = (
  search: string,
) => Observable<FormOption[]> | Promise<FormOption[]>;

export type PreloadOptionsFn<TVal> = (
  value: TVal,
) => Observable<FormOption[]> | Promise<FormOption[]>;

export type FieldBuilderByType<TModel, K extends keyof TModel> =
  | TextSignalFormField<TModel, K, FormFieldType.TEXT>
  | PasswordSignalFormField<TModel, K, FormFieldType.PASSWORD>
  | TextareaSignalFormField<TModel, K, FormFieldType.TEXTAREA>
  | NumberSignalFormField<TModel, K, FormFieldType.NUMBER>
  | CheckboxSignalFormField<TModel, K, FormFieldType.CHECKBOX>
  | DateTimeSignalFormField<TModel, K, FormFieldType.DATETIME>
  | SelectSignalFormField<TModel, K, FormFieldType.SELECT>
  | RadioSignalFormField<TModel, K, FormFieldType.RADIO>
  | AutocompleteSignalFormField<TModel, K, FormFieldType.AUTOCOMPLETE>
  | ColorSignalFormField<TModel, K, FormFieldType.COLOR>
  | SwitchSignalFormField<TModel, K, FormFieldType.SWITCH>
  | SliderSignalFormField<TModel, K, FormFieldType.SLIDER>
  | FileSignalFormField<TModel, K, FormFieldType.FILE>
  | RatingSignalFormField<TModel, K, FormFieldType.RATING>
  | MaskedSignalFormField<TModel, K, FormFieldType.MASKED>
  | MultiSelectSignalFormField<TModel, K, FormFieldType.MULTISELECT>
  | ChipListSignalFormField<TModel, K, FormFieldType.CHIPLIST>;

export type SelectSignalFormField<
  TModel,
  K extends keyof TModel,
  TType extends FormFieldType.SELECT,
> = BuilderField<TModel, K, TType> & {
  type: TType;
  options: FormOption[];
  dynamicOptions?: DynamicOptions<TModel, K>;
  computedOptions?: (form: SignalFormContainer<TModel>) => FormOption[];
};

export type RadioSignalFormField<
  TModel,
  K extends keyof TModel,
  TType extends FormFieldType.RADIO,
> = BuilderField<TModel, K, TType> & {
  type: TType;
  options: FormOption[];
  dynamicOptions?: DynamicOptions<TModel, K>;
};

export type AutocompleteSignalFormField<
  TModel,
  K extends keyof TModel,
  TType extends FormFieldType.AUTOCOMPLETE,
> = BuilderField<TModel, K, TType> & {
  type: TType;
  loadOptions: LoadOptionsFn;
};

export interface ColorSignalFormField<
  TModel,
  K extends keyof TModel,
  TType extends FormFieldType.COLOR,
> extends BuilderField<TModel, K, TType> {
  type: TType;
}
export interface SwitchSignalFormField<
  TModel,
  K extends keyof TModel,
  TType extends FormFieldType.SWITCH,
> extends BuilderField<TModel, K, TType> {
  type: TType;
}
export interface SliderSignalFormField<
  TModel,
  K extends keyof TModel,
  TType extends FormFieldType.SLIDER,
> extends BuilderField<TModel, K, TType> {
  type: TType;
}
export interface FileSignalFormField<
  TModel,
  K extends keyof TModel,
  TType extends FormFieldType.FILE,
> extends BuilderField<TModel, K, TType> {
  type: TType;
}
export interface RatingSignalFormField<
  TModel,
  K extends keyof TModel,
  TType extends FormFieldType.RATING,
> extends BuilderField<TModel, K, TType> {
  type: TType;
}
export interface MaskedSignalFormField<
  TModel,
  K extends keyof TModel,
  TType extends FormFieldType.MASKED,
> extends BuilderField<TModel, K, TType> {
  type: TType;
}
export interface TextSignalFormField<
  TModel,
  K extends keyof TModel,
  TType extends FormFieldType.TEXT,
> extends BuilderField<TModel, K, TType> {
  type: TType;
}
export interface PasswordSignalFormField<
  TModel,
  K extends keyof TModel,
  TType extends FormFieldType.PASSWORD,
> extends BuilderField<TModel, K, TType> {
  type: TType;
}
export interface TextareaSignalFormField<
  TModel,
  K extends keyof TModel,
  TType extends FormFieldType.TEXTAREA,
> extends BuilderField<TModel, K, TType> {
  type: TType;
}
export interface NumberSignalFormField<
  TModel,
  K extends keyof TModel,
  TType extends FormFieldType.NUMBER,
> extends BuilderField<TModel, K, TType> {
  type: TType;
}
export interface CheckboxSignalFormField<
  TModel,
  K extends keyof TModel,
  TType extends FormFieldType.CHECKBOX,
> extends BuilderField<TModel, K, TType> {
  type: TType;
  options: FormOption[];
  dynamicOptions?: DynamicOptions<TModel, K>;
}
export interface DateTimeSignalFormField<
  TModel,
  K extends keyof TModel,
  TType extends FormFieldType.DATETIME,
> extends BuilderField<TModel, K, TType> {
  type: TType;
}
export interface MultiSelectSignalFormField<
  TModel,
  K extends keyof TModel,
  TType extends FormFieldType.MULTISELECT,
> extends BuilderField<TModel, K, TType> {
  type: TType;
  options: FormOption[];
  dynamicOptions?: DynamicOptions<TModel, K>;
}

export interface ChipListSignalFormField<
  TModel,
  K extends keyof TModel,
  TType extends FormFieldType.CHIPLIST,
> extends BuilderField<TModel, K, TType> {
  type: TType;
  options: FormOption[];
  dynamicOptions?: DynamicOptions<TModel, K>;
}

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

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Array<infer U>
      ? Array<DeepPartial<U>>
      : DeepPartial<T[K]>
    : T[K];
};

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
  config: SignalFormConfig<TModel>;
  patchValue: (partialModel: DeepPartial<TModel>) => void;
  setValue: (model: TModel) => void;
}

export type ElementTypeForField<T extends FormFieldType> = T extends
  | FormFieldType.TEXT
  | FormFieldType.PASSWORD
  | FormFieldType.NUMBER
  ? HTMLInputElement
  : T extends FormFieldType.TEXTAREA
    ? HTMLTextAreaElement
    : T extends FormFieldType.CHECKBOX | FormFieldType.RADIO
      ? HTMLInputElement
      : T extends FormFieldType.SELECT
        ? HTMLSelectElement
        : never;
