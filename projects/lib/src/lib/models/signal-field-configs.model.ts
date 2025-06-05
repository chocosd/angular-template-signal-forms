import { FormFieldType } from '../enums/form-field-type.enum';
import { NumberInputType } from '../enums/number-input-type.enum';
import { type ValidationConfig } from './signal-form.model';
import {
  type UnitConversionConfig,
  type UnitParser,
} from './unit-conversion.model';

/**
 * this config is extended on every other config type
 */
export interface BaseFieldConfig<TModel, K extends keyof TModel> {
  placeholder?: string;
  hint?: string;
  validation?: ValidationConfig;
  /** Enable word count display for text-based inputs */
  wordCount?: boolean;
}

export interface TextFieldConfig<TModel, K extends keyof TModel>
  extends BaseFieldConfig<TModel, K> {
  prefix?: string;
  suffix?: string;
}

export interface NumberFieldConfig<TModel, K extends keyof TModel>
  extends BaseFieldConfig<TModel, K> {
  prefix?: string;
  suffix?: string;
  precision?: number;

  /** Type of number input for specialized formatting */
  inputType?: NumberInputType;

  /** Custom parser function for number display formatting */
  parser?: UnitParser;

  /** Locale for Intl.NumberFormat (defaults to 'en-US') */
  locale?: string;

  /** Currency code when inputType is CURRENCY (e.g., 'USD', 'EUR') */
  currencyCode?: string;

  /** Number of decimal places for DECIMAL type */
  decimalPlaces?: number;

  /** Unit conversion configuration for UNIT_CONVERSION type */
  unitConversions?: UnitConversionConfig;

  /** Minimum value */
  min?: number;

  /** Maximum value */
  max?: number;

  /** Step increment for number input */
  step?: number;
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
  min?: number;
  max?: number;
  allowHalf?: boolean;
}
export interface TextAreaFieldConfig<TModel, K extends keyof TModel>
  extends BaseFieldConfig<TModel, K> {
  /** Maximum number of rows for auto-resize */
  maxRows?: number;
  /** Minimum number of rows */
  minRows?: number;
}
export interface PasswordFieldConfig<TModel, K extends keyof TModel>
  extends BaseFieldConfig<TModel, K> {
  /** Show/hide password toggle */
  showToggle?: boolean;
}
export interface RadioFieldConfig<TModel, K extends keyof TModel>
  extends BaseFieldConfig<TModel, K> {
  valueType?: 'number' | 'boolean' | 'string';
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
                              : T extends FormFieldType.MULTISELECT
                                ? MultiSelectFieldConfig<TModel, K>
                                : T extends FormFieldType.CHIPLIST
                                  ? ChipListFieldConfig<TModel, K>
                                  : T extends FormFieldType.REPEATABLE_GROUP
                                    ? RepeatableGroupFieldConfig<TModel, K>
                                    : never;
