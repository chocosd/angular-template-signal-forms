import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
} from '@angular/core';
import { BaseInputDirective } from '../../../components/base/base-input/base-input.directive';
import { SignalModelDirective } from '../../../directives/signal-model.directive';
import { type RuntimeColorSignalField } from '../../../models/signal-field-types.model';

@Component({
  selector: 'signal-form-color-field',
  standalone: true,
  imports: [SignalModelDirective],
  templateUrl: './signal-form-color-field.component.html',
  styleUrl: './signal-form-color-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalFormColorFieldComponent<
  TModel extends object,
  K extends keyof TModel,
> extends BaseInputDirective<RuntimeColorSignalField<TModel, K>, TModel, K> {
  private fallbackColor = '#000000';

  protected currentColor = computed(
    () => this.field().value() ?? this.fallbackColor,
  );
  protected isSwatchOnly = computed(() => {
    return this.field().config?.view === 'swatch';
  });

  protected inputValue = computed(
    () => this.field().value() ?? this.fallbackColor,
  );

  constructor() {
    super();

    effect(() => {
      if (!CSS.supports('color', this.inputValue())) {
        this.field().error.set('unsupported Color value!');
      }
    });
  }

  protected onTextInputChange(val: string): void {
    this.setValue<string>(val);
  }

  protected onColorInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.setValue<string>(value);
  }
}
