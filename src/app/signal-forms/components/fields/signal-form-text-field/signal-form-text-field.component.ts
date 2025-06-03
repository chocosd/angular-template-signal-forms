import { ChangeDetectionStrategy, Component } from '@angular/core';
import { type RuntimeTextSignalField } from '@models/signal-field-types.model';
import { SignalModelDirective } from '../../../directives/signal-model.directive';
import { BaseInputDirective } from '../../base/base-input/base-input.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'signal-form-text-field',
  standalone: true,
  imports: [SignalModelDirective],
  templateUrl: 'signal-form-text-field.component.html',
})
export class SignalFormTextFieldComponent<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> extends BaseInputDirective<RuntimeTextSignalField<TModel, K>, TModel, K> {}
