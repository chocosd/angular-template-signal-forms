import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseInputDirective } from '@base/base-input/base-input.directive';
import { SignalModelDirective } from '../../../directives/signal-model.directive';
import { RuntimeSliderSignalField } from '../../../models/signal-field-types.model';

@Component({
  selector: 'signal-form-slider-field',
  standalone: true,
  imports: [SignalModelDirective],
  templateUrl: './form-slider-field.component.html',
  styleUrl: './form-slider-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSliderFieldComponent<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> extends BaseInputDirective<RuntimeSliderSignalField<TModel, K>, TModel, K> {}
