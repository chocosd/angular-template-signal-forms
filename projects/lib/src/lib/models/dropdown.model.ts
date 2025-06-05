import { ViewContainerRef } from '@angular/core';
import { type FormOption } from './signal-form.model';

export type BaseDropdownConfig<
  TOption extends FormOption<TValue>,
  TValue = TOption['value'],
> = {
  options: TOption[];
  reference: HTMLElement;
  ariaListboxId: string;
  viewContainerRef: ViewContainerRef;
  onClose?: () => void;
};

export type SingleSelectConfig<
  TOption extends FormOption<TValue>,
  TValue = TOption['value'],
> = BaseDropdownConfig<TOption, TValue> & {
  multiselect: false;
  initialSelection?: TOption;
  onSelect: (option: TOption) => void;
};

export type MultiSelectConfig<
  TOption extends FormOption<TValue>,
  TValue = TOption['value'],
> = BaseDropdownConfig<TOption, TValue> & {
  multiselect: true;
  initialSelection?: TOption[];
  onSelect: (options: TOption[]) => void;
};

export type DropdownConfig<
  TOption extends FormOption<TValue>,
  TValue = TOption['value'],
> = SingleSelectConfig<TOption, TValue> | MultiSelectConfig<TOption, TValue>;
