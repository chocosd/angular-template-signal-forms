import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseInputDirective } from '../../../components/base/base-input/base-input.directive';
import { SignalModelDirective } from '../../../directives/signal-model.directive';
import { type RuntimeSliderSignalField } from '../../../models/signal-field-types.model';

@Component({
  selector: 'signal-form-slider-field',
  standalone: true,
  imports: [SignalModelDirective],
  templateUrl: './signal-form-slider-field.component.html',
  styleUrl: './signal-form-slider-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalFormSliderFieldComponent<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> extends BaseInputDirective<RuntimeSliderSignalField<TModel, K>, TModel, K> {}
