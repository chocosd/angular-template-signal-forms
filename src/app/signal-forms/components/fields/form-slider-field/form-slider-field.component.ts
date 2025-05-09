import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { type SliderFieldConfig } from '../../../models/signal-field-configs.model';
import { BaseInputDirective } from '../../base/base-input/base-input.directive';

@Component({
  selector: 'signal-form-slider-field',
  imports: [],
  templateUrl: './form-slider-field.component.html',
  styleUrl: './form-slider-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSliderFieldComponent extends BaseInputDirective<
  FormFieldType.SLIDER,
  number,
  SliderFieldConfig
> {}
