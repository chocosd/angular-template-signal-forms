import { Signal } from '@angular/core';
import {
  type AutocompleteSignalField,
  type BaseFieldState,
  type CheckboxGroupSignalField,
  type CheckboxSignalField,
  type ChipListSignalField,
  type ColorSignalField,
  type DateTimeSignalField,
  type FileSignalField,
  type FormOption,
  type MultiSelectSignalField,
  type NumberSignalField,
  type PasswordSignalField,
  type RadioSignalField,
  type RatingSignalField,
  type SelectSignalField,
  type SliderSignalField,
  type SwitchSignalField,
  type TextareaSignalField,
  type TextSignalField,
} from './signal-form.model';

export type RuntimeTextSignalField<
  TModel extends object,
  K extends keyof TModel,
> = TextSignalField<TModel, K> & BaseFieldState<TModel, string>;

export type RuntimeNumberSignalField<
  TModel extends object,
  K extends keyof TModel,
> = NumberSignalField<TModel, K> & BaseFieldState<TModel, number>;

export type RuntimeSelectSignalField<
  TModel extends object,
  K extends keyof TModel,
> = Omit<SelectSignalField<TModel, K>, 'options'> &
  BaseFieldState<TModel, FormOption<TModel[K]>> & {
    options: Signal<FormOption<TModel[K]>[]>;
  };

export type RuntimeRadioSignalField<
  TModel extends object,
  K extends keyof TModel,
> = Omit<RadioSignalField<TModel, K>, 'options'> &
  BaseFieldState<TModel, TModel[K]> & {
    options: Signal<FormOption<TModel[K]>[]>;
  };

export type RuntimeCheckboxSignalField<
  TModel extends object,
  K extends keyof TModel,
> = Omit<CheckboxSignalField<TModel, K>, 'options'> &
  BaseFieldState<TModel, boolean> & {
    options: Signal<FormOption<TModel[K]>[]>;
  };

export type RuntimeCheckboxGroupSignalField<
  TModel extends object,
  K extends keyof TModel,
> = Omit<CheckboxGroupSignalField<TModel, K>, 'options'> &
  BaseFieldState<TModel, Record<string, boolean> | string[]> & {
    options: Signal<FormOption<TModel[K]>[]>;
  };

export type RuntimeDateTimeSignalField<
  TModel extends object,
  K extends keyof TModel,
> = DateTimeSignalField<TModel, K> & BaseFieldState<TModel, Date>;

export type RuntimeAutocompleteSignalField<
  TModel extends object,
  K extends keyof TModel,
> = AutocompleteSignalField<TModel, K> &
  BaseFieldState<TModel, FormOption<TModel[K]>>;

export type RuntimeTextAreaSignalField<
  TModel extends object,
  K extends keyof TModel,
> = TextareaSignalField<TModel, K> & BaseFieldState<TModel, string>;

export type RuntimePasswordSignalField<
  TModel extends object,
  K extends keyof TModel,
> = PasswordSignalField<TModel, K> & BaseFieldState<TModel, string>;

export type RuntimeColorSignalField<
  TModel extends object,
  K extends keyof TModel,
> = ColorSignalField<TModel, K> & BaseFieldState<TModel, string>;

export type RuntimeSwitchSignalField<
  TModel extends object,
  K extends keyof TModel,
> = SwitchSignalField<TModel, K> & BaseFieldState<TModel, boolean>;

export type RuntimeSliderSignalField<
  TModel extends object,
  K extends keyof TModel,
> = SliderSignalField<TModel, K> & BaseFieldState<TModel, number>;

export type RuntimeFileSignalField<
  TModel extends object,
  K extends keyof TModel,
> = FileSignalField<TModel, K> & BaseFieldState<TModel, File>;

export type RuntimeRatingSignalField<
  TModel extends object,
  K extends keyof TModel,
> = RatingSignalField<TModel, K> & BaseFieldState<TModel, number>;

export type RuntimeMultiSelectSignalField<
  TModel extends object,
  K extends keyof TModel,
> = Omit<MultiSelectSignalField<TModel, K>, 'options'> &
  BaseFieldState<TModel, FormOption<TModel[K]>[]> & {
    options: Signal<FormOption<TModel[K]>[]>;
  };

export type RuntimeChipListSignalField<
  TModel extends object,
  K extends keyof TModel,
> = Omit<ChipListSignalField<TModel, K>, 'options'> &
  BaseFieldState<TModel, FormOption<TModel[K]>[]> & {
    options: Signal<FormOption<TModel[K]>[]>;
  };

export type RuntimeFields<TModel extends object, K extends keyof TModel> =
  | RuntimeAutocompleteSignalField<TModel, K>
  | RuntimeTextSignalField<TModel, K>
  | RuntimeTextAreaSignalField<TModel, K>
  | RuntimeNumberSignalField<TModel, K>
  | RuntimeSelectSignalField<TModel, K>
  | RuntimeCheckboxSignalField<TModel, K>
  | RuntimeCheckboxGroupSignalField<TModel, K>
  | RuntimeDateTimeSignalField<TModel, K>
  | RuntimeRadioSignalField<TModel, K>
  | RuntimePasswordSignalField<TModel, K>
  | RuntimeColorSignalField<TModel, K>
  | RuntimeSwitchSignalField<TModel, K>
  | RuntimeSliderSignalField<TModel, K>
  | RuntimeFileSignalField<TModel, K>
  | RuntimeRatingSignalField<TModel, K>
  | RuntimeMultiSelectSignalField<TModel, K>
  | RuntimeChipListSignalField<TModel, K>;
