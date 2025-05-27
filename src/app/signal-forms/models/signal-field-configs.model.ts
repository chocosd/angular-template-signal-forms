import { CurrencyType } from '../enums/currency-type.enum';
import { FormFieldType } from '../enums/form-field-type.enum';
import { DynamicOptions, FormOption } from './signal-form.model';

/**
 * this config is extended on every other config type
 */
export interface BaseFieldConfig<TModel, K extends keyof TModel> {
  placeholder?: string;
  hint?: string;
}

export interface TextFieldConfig<TModel, K extends keyof TModel>
  extends BaseFieldConfig<TModel, K> {
  prefix?: string;
  suffix?: string;
}
export interface NumberFieldConfig<TModel, K extends keyof TModel>
  extends BaseFieldConfig<TModel, K> {
  currency?: CurrencyType;
  prefix?: string;
  suffix?: string;
  precision?: number;
}
export interface CheckboxFieldConfig<TModel, K extends keyof TModel>
  extends BaseFieldConfig<TModel, K> {}
export interface CheckboxGroupFieldConfig<TModel, K extends keyof TModel>
  extends BaseFieldConfig<TModel, K> {
  layout?: 'inline' | 'stacked';
  valueType: 'map' | 'array';
}
export interface DateTimeFieldConfig<TModel, K extends keyof TModel>
  extends BaseFieldConfig<TModel, K> {
  format?: string;
}
export interface AutocompleteFieldConfig<TModel, K extends keyof TModel>
  extends BaseFieldConfig<TModel, K> {
  debounceMs?: number;
  minChars?: number;
}
export interface SelectFieldConfig<TModel, K extends keyof TModel>
  extends BaseFieldConfig<TModel, K> {
  multiselect?: boolean;
  valueType?: 'number' | 'boolean' | 'string';
}
export interface SliderFieldConfig<TModel, K extends keyof TModel>
  extends BaseFieldConfig<TModel, K> {
  min?: number;
  max?: number;
  step?: number;
}
export interface FileFieldConfig<TModel, K extends keyof TModel>
  extends BaseFieldConfig<TModel, K> {
  accept?: string[];
  maxSizeMb?: number;
  multiple?: boolean;
  uploadText?: string;
}
export interface RatingFieldConfig<TModel, K extends keyof TModel>
  extends BaseFieldConfig<TModel, K> {
  max?: number;
  allowHalf?: boolean;
}
export interface MaskedFieldConfig<TModel, K extends keyof TModel>
  extends BaseFieldConfig<TModel, K> {
  mask: string; // e.g., "(999) 999-9999"
  placeholderChar?: string; // e.g, "_"
  numericOnly?: boolean;
}

export interface TextAreaFieldConfig<TModel, K extends keyof TModel>
  extends BaseFieldConfig<TModel, K> {}
export interface PasswordFieldConfig<TModel, K extends keyof TModel>
  extends BaseFieldConfig<TModel, K> {}
export interface RadioFieldConfig<TModel, K extends keyof TModel>
  extends BaseFieldConfig<TModel, K> {
  valueType?: 'number' | 'boolean' | 'string';
  options: FormOption[];
  dynamicOptions?: DynamicOptions<TModel, K>;
}
export interface MultiSelectFieldConfig<TModel, K extends keyof TModel>
  extends BaseFieldConfig<TModel, K> {}
export interface ColorFieldConfig<TModel, K extends keyof TModel>
  extends BaseFieldConfig<TModel, K> {
  view: 'swatch' | 'pickerWithInput';
}
export interface SwitchFieldConfig<TModel, K extends keyof TModel>
  extends BaseFieldConfig<TModel, K> {}
export interface ChipListFieldConfig<TModel, K extends keyof TModel>
  extends BaseFieldConfig<TModel, K> {}
export interface RepeatableGroupFieldConfig<TModel, K extends keyof TModel>
  extends BaseFieldConfig<TModel, K> {
  view?: 'inline' | 'stacked';
}

//
// ========== Config Type Mapping ==========
//
export type ConfigTypeForField<
  T extends FormFieldType,
  TModel = any,
  K extends keyof TModel = keyof TModel,
> = T extends FormFieldType.TEXT
  ? TextFieldConfig<TModel, K>
  : T extends FormFieldType.PASSWORD
    ? PasswordFieldConfig<TModel, K>
    : T extends FormFieldType.TEXTAREA
      ? TextAreaFieldConfig<TModel, K>
      : T extends FormFieldType.SELECT
        ? SelectFieldConfig<TModel, K>
        : T extends FormFieldType.RADIO
          ? RadioFieldConfig<TModel, K>
          : T extends FormFieldType.AUTOCOMPLETE
            ? AutocompleteFieldConfig<TModel, K>
            : T extends FormFieldType.NUMBER
              ? NumberFieldConfig<TModel, K>
              : T extends FormFieldType.CHECKBOX
                ? CheckboxFieldConfig<TModel, K>
                : T extends FormFieldType.CHECKBOX_GROUP
                  ? CheckboxGroupFieldConfig<TModel, K>
                  : T extends FormFieldType.DATETIME
                    ? DateTimeFieldConfig<TModel, K>
                    : T extends FormFieldType.COLOR
                      ? ColorFieldConfig<TModel, K>
                      : T extends FormFieldType.SWITCH
                        ? SwitchFieldConfig<TModel, K>
                        : T extends FormFieldType.SLIDER
                          ? SliderFieldConfig<TModel, K>
                          : T extends FormFieldType.FILE
                            ? FileFieldConfig<TModel, K>
                            : T extends FormFieldType.RATING
                              ? RatingFieldConfig<TModel, K>
                              : T extends FormFieldType.MASKED
                                ? MaskedFieldConfig<TModel, K>
                                : T extends FormFieldType.MULTISELECT
                                  ? MultiSelectFieldConfig<TModel, K>
                                  : T extends FormFieldType.CHIPLIST
                                    ? ChipListFieldConfig<TModel, K>
                                    : T extends FormFieldType.REPEATABLE_GROUP
                                      ? RepeatableGroupFieldConfig<TModel, K>
                                      : never;
