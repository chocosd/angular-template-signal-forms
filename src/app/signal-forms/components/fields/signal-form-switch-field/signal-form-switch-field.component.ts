import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseInputDirective } from '@base/base-input/base-input.directive';
import { type RuntimeSwitchSignalField } from '@models/signal-field-types.model';
import { SignalModelDirective } from '../../../directives/signal-model.directive';

@Component({
  selector: 'signal-form-switch-field',
  standalone: true,
  imports: [SignalModelDirective],
  templateUrl: './signal-form-switch-field.component.html',
  styleUrl: './signal-form-switch-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalFormSwitchFieldComponent<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> extends BaseInputDirective<RuntimeSwitchSignalField<TModel, K>, TModel, K> {}
