import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Type } from '@angular/core';
import { BaseInputDirective } from '@base/base-input/base-input.directive';
import { type RuntimeRadioSignalField } from '@models/signal-field-types.model';
import { type LucideIconData, LucideAngularModule } from 'lucide-angular';
import { SignalModelDirective } from '../../../directives/signal-model.directive';

@Component({
  selector: 'signal-form-radio-field',
  standalone: true,
  imports: [SignalModelDirective, NgComponentOutlet, LucideAngularModule],
  templateUrl: './signal-form-radio-field.component.html',
  styleUrl: './signal-form-radio-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalFormRadioFieldComponent<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> extends BaseInputDirective<RuntimeRadioSignalField<TModel, K>, TModel, K> {
  /**
   * Convert option value to string for radio input value attribute
   */
  valueToString(value: TModel[K]): string {
    return String(value);
  }

  /**
   * Check if any options have icons to determine layout style
   */
  hasIcons(): boolean {
    return this.field()
      .options()
      .some((option) => option.icon);
  }

  /**
   * Check if an option is currently selected
   */
  isOptionSelected(optionValue: TModel[K]): boolean {
    return this.field().value() === optionValue;
  }

  /**
   * Check if icon is a Lucide icon data (prioritized check)
   */
  isLucideIcon(
    icon: string | Type<unknown> | LucideIconData,
  ): icon is LucideIconData {
    return Array.isArray(icon) && icon.length > 0;
  }

  /**
   * Check if icon is a string (emoji/unicode)
   */
  isStringIcon(icon: string | Type<unknown> | LucideIconData): icon is string {
    return typeof icon === 'string';
  }

  /**
   * Check if icon is a component type (fallback)
   */
  isComponentIcon(
    icon: string | Type<unknown> | LucideIconData,
  ): icon is Type<unknown> {
    return typeof icon === 'function' && !this.isLucideIcon(icon);
  }
}
