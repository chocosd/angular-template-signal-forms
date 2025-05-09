import { CurrencyType } from '../enums/currency-type.enum';
import { FormFieldType } from '../enums/form-field-type.enum';

/**
 * this config is extended on every other config type
 */
export interface BaseFieldConfig {
  placeholder?: string;
  hint?: string;
}

export interface TextFieldConfig extends BaseFieldConfig {
  prefix?: string;
  suffix?: string;
}
export interface NumberFieldConfig extends BaseFieldConfig {
  currency?: CurrencyType;
  prefix?: string;
  suffix?: string;
  precision?: number;
}
export interface CheckboxFieldConfig extends BaseFieldConfig {
  layout?: 'inline' | 'stacked';
}
export interface DateTimeFieldConfig extends BaseFieldConfig {
  format?: string;
}
export interface AutocompleteFieldConfig extends BaseFieldConfig {
  debounceMs?: number;
  minChars?: number;
}
export interface SelectFieldConfig extends BaseFieldConfig {
  multiselect?: boolean;
}
export interface SliderFieldConfig extends BaseFieldConfig {
  min?: number;
  max?: number;
  step?: number;
}
export interface FileFieldConfig extends BaseFieldConfig {
  accept?: string;
  maxSizeMb?: number;
  multiple?: boolean;
}
export interface RatingFieldConfig extends BaseFieldConfig {
  max?: number;
  allowHalf?: boolean;
}
export interface MaskedFieldConfig extends BaseFieldConfig {
  mask: string; // e.g., "(999) 999-9999"
  placeholderChar?: string; // e.g, "_"
}

export interface TextAreaFieldConfig extends BaseFieldConfig {}
export interface PasswordFieldConfig extends BaseFieldConfig {}
export interface RadioFieldConfig extends BaseFieldConfig {}
export interface MultiSelectFieldConfig extends BaseFieldConfig {}
export interface ColorFieldConfig extends BaseFieldConfig {
  view: 'swatch' | 'pickerWithInput';
}
export interface SwitchFieldConfig extends BaseFieldConfig {}
export interface ChipListFieldConfig extends BaseFieldConfig {}

//
// ========== Config Type Mapping ==========
//
export type ConfigTypeForField<T extends FormFieldType> =
  T extends FormFieldType.TEXT
    ? TextFieldConfig
    : T extends FormFieldType.PASSWORD
      ? PasswordFieldConfig
      : T extends FormFieldType.TEXTAREA
        ? TextAreaFieldConfig
        : T extends FormFieldType.SELECT
          ? SelectFieldConfig
          : T extends FormFieldType.RADIO
            ? RadioFieldConfig
            : T extends FormFieldType.AUTOCOMPLETE
              ? AutocompleteFieldConfig
              : T extends FormFieldType.NUMBER
                ? NumberFieldConfig
                : T extends FormFieldType.CHECKBOX
                  ? CheckboxFieldConfig
                  : T extends FormFieldType.DATETIME
                    ? DateTimeFieldConfig
                    : T extends FormFieldType.COLOR
                      ? ColorFieldConfig
                      : T extends FormFieldType.SWITCH
                        ? SwitchFieldConfig
                        : T extends FormFieldType.SLIDER
                          ? SliderFieldConfig
                          : T extends FormFieldType.FILE
                            ? FileFieldConfig
                            : T extends FormFieldType.RATING
                              ? RatingFieldConfig
                              : T extends FormFieldType.MASKED
                                ? MaskedFieldConfig
                                : T extends FormFieldType.MULTISELECT
                                  ? MultiSelectFieldConfig
                                  : T extends FormFieldType.CHIPLIST
                                    ? ChipListFieldConfig
                                    : never;
