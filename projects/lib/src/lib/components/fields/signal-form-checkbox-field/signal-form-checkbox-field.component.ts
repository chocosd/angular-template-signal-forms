import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SignalModelDirective } from '../../../directives/signal-model.directive';
import { type RuntimeCheckboxSignalField } from '../../../models/signal-field-types.model';
import { BaseInputDirective } from '../../base/base-input/base-input.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'signal-form-checkbox-field',
  standalone: true,
  imports: [SignalModelDirective],
  styleUrl: './signal-form-checkbox-field.component.scss',
  templateUrl: './signal-form-checkbox-field.component.html',
})
export class SignalFormCheckboxFieldComponent<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> extends BaseInputDirective<RuntimeCheckboxSignalField<TModel, K>, TModel, K> {
  public label = input<string>('');

  protected extractValue(element: HTMLInputElement): boolean {
    return element.checked;
  }
}
