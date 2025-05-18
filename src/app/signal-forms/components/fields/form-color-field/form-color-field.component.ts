import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
} from '@angular/core';
import { BaseInputDirective } from '@base/base-input/base-input.directive';
import { FormFieldType } from '@enums/form-field-type.enum';
import { type ColorFieldConfig } from '@models/signal-field-configs.model';

@Component({
  selector: 'signal-form-color-field',
  standalone: true,
  templateUrl: './form-color-field.component.html',
  styleUrl: './form-color-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormColorFieldComponent extends BaseInputDirective<
  FormFieldType.COLOR,
  string,
  ColorFieldConfig
> {
  private fallbackColor = '#000000';

  protected currentColor = computed(() => this.value() ?? this.fallbackColor);
  protected isSwatchOnly = computed(() => {
    return this.config()?.view === 'swatch';
  });

  protected inputValue = computed(() => this.value() ?? this.fallbackColor);

  constructor() {
    super();

    effect(() => {
      if (!CSS.supports('color', this.inputValue())) {
        this.error.set('unsupported Color value!');
      }
    });
  }

  protected onTextInputChange(val: string): void {
    this.setValue(val);
  }

  protected onColorInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.setValue(value);
  }
}
