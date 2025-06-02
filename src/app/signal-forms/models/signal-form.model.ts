import { Signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { FormFieldType } from '../enums/form-field-type.enum';
import { FormStatus } from '../enums/form-status.enum';
import { MetaValidatorFn } from '../helpers/with-meta';
import { ConfigTypeForField } from './signal-field-configs.model';

export interface FormOption<TResult = string | number | boolean | object> {
  label: string;
  value: NonNullable<TResult>;
}

export type SignalValidatorFn<T, TModel> = (
  value: T,
  form: SignalFormContainer<TModel>,
) => string | null;

export type SignalAsyncValidatorFn<T, TModel> = (
  value: T,
  form: SignalFormContainer<TModel>,
) => Observable<string | null> | Promise<string | null>;

export type SignalValidator<TModel, TKey extends keyof TModel> =
  | MetaValidatorFn<TModel[TKey], TModel>
  | SignalValidatorFn<TModel[TKey], TModel>;

export type SignalAsyncValidator<
  TModel,
  TKey extends keyof TModel,
> = SignalAsyncValidatorFn<TModel[TKey], TModel>;

export type ValidationTrigger = 'change' | 'blur' | 'submit';

export interface ValidationConfig {
  trigger?: ValidationTrigger;
  debounceMs?: number;
  validateAsyncOnInit?: boolean;
}

export type ComputedOptions<TModel> = {
  source: (form: SignalFormContainer<TModel>) => any;
  filterFn: (
    sourceValue: any,
    options: FormOption[],
    currentValue: any,
  ) => FormOption[];
};

type IsPlainObject<T> = T extends object
  ? T extends (...args: any[]) => any
    ? false
    : T extends any[]
      ? false
      : T extends Date
        ? false
        : T extends FormOption
          ? false
          : true
  : false;

type IsArrayOfPlainObjects<T> =
  T extends Array<infer U> ? IsPlainObject<U> : false;

// ========== Field Config Types ==========
export type BaseFieldConfig<TModel, K extends keyof TModel> = {
  name: K;
  label: string;
  validators?: SignalValidator<TModel, K>[];
  asyncValidators?: SignalAsyncValidator<TModel, K>[];
  validationConfig?: ValidationConfig;
  computedValue?: (form: SignalFormContainer<TModel>) => TModel[K];
  hidden?: boolean | ((form: SignalFormContainer<TModel>) => boolean);
  disabled?: boolean | ((form: SignalFormContainer<TModel>) => boolean);
  parser?: (value: string) => TModel[K];
};

export type TextSignalField<TModel, K extends keyof TModel> = BaseFieldConfig<
  TModel,
  K
> & {
  type: FormFieldType.TEXT;
  config?: ConfigTypeForField<FormFieldType.TEXT>;
};

export type PasswordSignalField<
  TModel,
  K extends keyof TModel,
> = BaseFieldConfig<TModel, K> & {
  type: FormFieldType.PASSWORD;
  config?: ConfigTypeForField<FormFieldType.PASSWORD>;
};

export type TextareaSignalField<
  TModel,
  K extends keyof TModel,
> = BaseFieldConfig<TModel, K> & {
  type: FormFieldType.TEXTAREA;
  config?: ConfigTypeForField<FormFieldType.TEXTAREA>;
};

export type NumberSignalField<TModel, K extends keyof TModel> = BaseFieldConfig<
  TModel,
  K
> & {
  type: FormFieldType.NUMBER;
  config?: ConfigTypeForField<FormFieldType.NUMBER>;
};

export type SelectSignalField<TModel, K extends keyof TModel> = BaseFieldConfig<
  TModel,
  K
> & {
  type: FormFieldType.SELECT;
  config?: ConfigTypeForField<FormFieldType.SELECT>;
  options: FormOption[];
  computedOptions?: ComputedOptions<TModel>;
};

export type CheckboxSignalField<
  TModel,
  K extends keyof TModel,
> = BaseFieldConfig<TModel, K> & {
  type: FormFieldType.CHECKBOX;
  config?: ConfigTypeForField<FormFieldType.CHECKBOX>;
  options: FormOption[];
  computedOptions?: ComputedOptions<TModel>;
};

export type CheckboxGroupSignalField<
  TModel,
  K extends keyof TModel,
> = BaseFieldConfig<TModel, K> & {
  type: FormFieldType.CHECKBOX_GROUP;
  config?: ConfigTypeForField<FormFieldType.CHECKBOX_GROUP>;
  options: FormOption[];
  computedOptions?: ComputedOptions<TModel>;
  valueType?: 'array' | 'map';
};

export type DateTimeSignalField<
  TModel,
  K extends keyof TModel,
> = BaseFieldConfig<TModel, K> & {
  type: FormFieldType.DATETIME;
  config?: ConfigTypeForField<FormFieldType.DATETIME>;
};

export type RadioSignalField<TModel, K extends keyof TModel> = BaseFieldConfig<
  TModel,
  K
> & {
  type: FormFieldType.RADIO;
  config?: ConfigTypeForField<FormFieldType.RADIO>;
  options: FormOption[];
  computedOptions?: ComputedOptions<TModel>;
};

export type LoadOptionsFn = (
  search: string,
) => Observable<FormOption[]> | Promise<FormOption[]>;

export type AutocompleteSignalField<
  TModel,
  K extends keyof TModel,
> = BaseFieldConfig<TModel, K> & {
  type: FormFieldType.AUTOCOMPLETE;
  config?: ConfigTypeForField<FormFieldType.AUTOCOMPLETE>;
  loadOptions: LoadOptionsFn;
};

export type ColorSignalField<TModel, K extends keyof TModel> = BaseFieldConfig<
  TModel,
  K
> & {
  type: FormFieldType.COLOR;
  config?: ConfigTypeForField<FormFieldType.COLOR>;
};

export type SwitchSignalField<TModel, K extends keyof TModel> = BaseFieldConfig<
  TModel,
  K
> & {
  type: FormFieldType.SWITCH;
  config?: ConfigTypeForField<FormFieldType.SWITCH>;
};

export type SliderSignalField<TModel, K extends keyof TModel> = BaseFieldConfig<
  TModel,
  K
> & {
  type: FormFieldType.SLIDER;
  config?: ConfigTypeForField<FormFieldType.SLIDER>;
};

export type FileSignalField<TModel, K extends keyof TModel> = BaseFieldConfig<
  TModel,
  K
> & {
  type: FormFieldType.FILE;
  config?: ConfigTypeForField<FormFieldType.FILE>;
};

export type RatingSignalField<TModel, K extends keyof TModel> = BaseFieldConfig<
  TModel,
  K
> & {
  type: FormFieldType.RATING;
  config?: ConfigTypeForField<FormFieldType.RATING>;
};

export type MultiSelectSignalField<
  TModel,
  K extends keyof TModel,
> = BaseFieldConfig<TModel, K> & {
  type: FormFieldType.MULTISELECT;
  config?: ConfigTypeForField<FormFieldType.MULTISELECT>;
  options: FormOption[];
  computedOptions?: ComputedOptions<TModel>;
};

export type ChipListSignalField<
  TModel,
  K extends keyof TModel,
> = BaseFieldConfig<TModel, K> & {
  type: FormFieldType.CHIPLIST;
  config?: ConfigTypeForField<FormFieldType.CHIPLIST>;
  options: FormOption[];
  computedOptions?: ComputedOptions<TModel>;
};

// Update the FieldConfig union type to include all field types
export type SignalField<TModel, K extends keyof TModel> =
  | TextSignalField<TModel, K>
  | PasswordSignalField<TModel, K>
  | TextareaSignalField<TModel, K>
  | NumberSignalField<TModel, K>
  | SelectSignalField<TModel, K>
  | CheckboxSignalField<TModel, K>
  | CheckboxGroupSignalField<TModel, K>
  | DateTimeSignalField<TModel, K>
  | RadioSignalField<TModel, K>
  | AutocompleteSignalField<TModel, K>
  | ColorSignalField<TModel, K>
  | SwitchSignalField<TModel, K>
  | SliderSignalField<TModel, K>
  | FileSignalField<TModel, K>
  | RatingSignalField<TModel, K>
  | MultiSelectSignalField<TModel, K>
  | ChipListSignalField<TModel, K>;

// ========== Runtime Field State ==========
export type BaseFieldState<TModel, TValue> = {
  error: WritableSignal<string | null>;
  asyncError: WritableSignal<string | null>;
  validating: WritableSignal<boolean>;
  touched: WritableSignal<boolean>;
  dirty: WritableSignal<boolean>;
  focus: WritableSignal<boolean>;
  value: WritableSignal<TValue>;
  getForm: () => SignalFormContainer<TModel>;
  isDisabled: Signal<boolean>;
  isHidden: Signal<boolean>;
  readonly path: string;
};

// ========== Combined Field Types ==========
export type SignalFormField<
  TModel,
  K extends keyof TModel = keyof TModel,
> = SignalField<TModel, K> & BaseFieldState<TModel, TModel[K]>;

// ========== Builder Input Types ==========
export type SignalFormFieldBuilderInput<TModel> = {
  [K in keyof TModel]: IsArrayOfPlainObjects<TModel[K]> extends true
    ? RepeatableGroupBuilderField<TModel, K>
    : IsPlainObject<TModel[K]> extends true
      ? NestedGroupBuilderField<TModel, K>
      : SignalField<TModel, K>;
}[keyof TModel];

// ========== Group Types ==========
export type NestedGroupBuilderField<TModel, K extends keyof TModel> = {
  name: K;
  heading: string;
  subheading: string;
  fields: SignalFormFieldBuilderInput<TModel[K]>[];
  hidden?: boolean | ((form: SignalFormContainer<TModel>) => boolean);
  disabled?: boolean | ((form: SignalFormContainer<TModel>) => boolean);
  config?: SignalFormConfig<TModel[K]>;
};

export type RepeatableGroupBuilderField<TModel, K extends keyof TModel> = {
  name: K;
  heading: string;
  subheading?: string;
  type: FormFieldType.REPEATABLE_GROUP;
  fields: SignalFormFieldBuilderInput<ItemOf<TModel[K]>>[];
  hidden?: boolean | ((form: SignalFormContainer<TModel>) => boolean);
  disabled?: boolean | ((form: SignalFormContainer<TModel>) => boolean);
  config?: SignalFormConfig<ItemOf<TModel[K]>>;
  minItems?: number;
  maxItems?: number;
};

export type RepeatableGroupSignalFormField<
  TModel,
  K extends keyof TModel,
> = RepeatableGroupBuilderField<TModel, K> & {
  repeatableForms: WritableSignal<SignalFormContainer<ItemOf<TModel[K]>>[]>;
  addItem: (initial?: ItemOf<TModel[K]>) => void;
  removeItem: (index: number) => void;
  error: WritableSignal<boolean>;
  touched: WritableSignal<boolean>;
  dirty: WritableSignal<boolean>;
  value: Signal<ItemOf<TModel[keyof TModel]>[]>;
  parentForm?: Signal<SignalFormContainer<TModel>>;
};

// ========== Form Configuration Types ==========
export type SignalFormConfig<TModel> =
  | GridSignalFormConfig<TModel>
  | FlexSignalFormConfig;

export interface SignalSteppedFormConfig<TModel> {
  form?: SignalFormConfig<TModel>;
  canSkipIncompleteSteps?: boolean;
  disableUponComplete?: boolean;
}

export type BaseSignalFormConfig = {
  view?: 'row' | 'stacked' | 'collapsable';
  layout: 'flex' | 'grid-area';
  disableUponComplete?: boolean;
};

export interface GridSignalFormConfig<TModel> extends BaseSignalFormConfig {
  layout: 'grid-area';
  gridArea: Array<keyof TModel | '.'>[];
}

export interface FlexSignalFormConfig extends BaseSignalFormConfig {
  layout: 'flex';
}

// ========== Form Container Types ==========
export type ErrorMessage<TModel> = {
  name: keyof TModel;
  message: string;
  path: string;
};

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Array<infer U>
      ? Array<DeepPartial<U>>
      : DeepPartial<T[K]>
    : T[K];
};

export type ItemOf<T> = T extends Array<infer U> ? U : never;

export type InferFieldType<TModel, K extends keyof TModel> =
  TModel[K] extends Array<infer U>
    ? RepeatableGroupSignalFormField<TModel, K> & {
        repeatableForms: WritableSignal<SignalFormContainer<U>[]>;
        form: SignalFormContainer<U>;
        fields: SignalFormField<U>[];
      }
    : TModel[K] extends object
      ? SignalFormField<TModel, K> & {
          form: SignalFormContainer<TModel[K]>;
          fields: SignalFormField<TModel[K]>[];
        }
      : SignalFormField<TModel, K>;

export interface SignalFormContainer<TModel, TParentModel = unknown> {
  title?: string;
  status: WritableSignal<FormStatus>;
  fields: SignalFormField<TModel>[];
  getField<K extends keyof TModel>(key: K): InferFieldType<TModel, K>;
  getParent?(): SignalFormContainer<any, any> | undefined;
  parentForm: Signal<SignalFormContainer<any, any> | undefined>;
  anyTouched: Signal<boolean>;
  anyDirty: Signal<boolean>;
  hasSaved(): Signal<boolean>;
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

export interface SignalSteppedFormContainer<TModel> {
  currentStep: WritableSignal<number>;
  steps: SignalFormContainer<TModel>[];
  value: Signal<TModel>;
  hasSaved: Signal<boolean>;
  getValue(): TModel;
  getErrors(): ErrorMessage<TModel>[];
  getField<K extends keyof TModel>(key: K): SignalFormField<TModel, K>;
  validateStep(): boolean;
  validateAll(): boolean;
  isValidStep: () => boolean;
  reset(): void;
  save(): void;
  anyDirty: Signal<boolean>;
  anyTouched: Signal<boolean>;
  status: WritableSignal<FormStatus>;
  config?: SignalSteppedFormConfig<TModel>;
}

export type ElementTypeForField<T extends FormFieldType> =
  T extends FormFieldType.CHECKBOX
    ? HTMLInputElement
    : T extends FormFieldType.CHECKBOX_GROUP
      ? HTMLInputElement
      : T extends FormFieldType.RADIO
        ? HTMLInputElement
        : T extends FormFieldType.NUMBER
          ? HTMLInputElement
          : T extends FormFieldType.TEXT
            ? HTMLInputElement
            : T extends FormFieldType.PASSWORD
              ? HTMLInputElement
              : T extends FormFieldType.TEXTAREA
                ? HTMLTextAreaElement
                : T extends FormFieldType.SELECT
                  ? HTMLSelectElement
                  : T extends FormFieldType.DATETIME
                    ? HTMLInputElement
                    : T extends FormFieldType.COLOR
                      ? HTMLInputElement
                      : T extends FormFieldType.SWITCH
                        ? HTMLInputElement
                        : T extends FormFieldType.SLIDER
                          ? HTMLInputElement
                          : T extends FormFieldType.FILE
                            ? HTMLInputElement
                            : T extends FormFieldType.RATING
                              ? HTMLInputElement
                              : T extends FormFieldType.MULTISELECT
                                ? HTMLSelectElement
                                : T extends FormFieldType.CHIPLIST
                                  ? HTMLInputElement
                                  : T extends FormFieldType.AUTOCOMPLETE
                                    ? HTMLInputElement
                                    : never;
