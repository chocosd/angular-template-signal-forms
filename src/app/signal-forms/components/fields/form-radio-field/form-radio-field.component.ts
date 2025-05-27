import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseInputDirective } from '@base/base-input/base-input.directive';
import { SignalModelDirective } from '@directives/signal-model.directive';
import { type RuntimeRadioSignalField } from '@models/signal-field-types.model';

@Component({
  selector: 'signal-form-radio-field',
  standalone: true,
  imports: [SignalModelDirective],
  templateUrl: './form-radio-field.component.html',
  styleUrl: './form-radio-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormRadioFieldComponent<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> extends BaseInputDirective<RuntimeRadioSignalField<TModel, K>, TModel, K> {}
