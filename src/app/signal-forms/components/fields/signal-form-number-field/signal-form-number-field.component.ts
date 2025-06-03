import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseInputDirective } from '@base/base-input/base-input.directive';
import { type RuntimeNumberSignalField } from '@models/signal-field-types.model';
import { SignalModelDirective } from '../../../directives/signal-model.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'signal-form-number-field',
  standalone: true,
  imports: [SignalModelDirective],
  templateUrl: './signal-form-number-field.component.html',
})
export class SignalFormNumberFieldComponent<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> extends BaseInputDirective<RuntimeNumberSignalField<TModel, K>, TModel, K> {}
