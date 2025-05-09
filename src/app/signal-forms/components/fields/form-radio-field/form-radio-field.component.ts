import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { type RadioFieldConfig } from '../../../models/signal-field-configs.model';
import { type FormOption } from '../../../models/signal-form.model';
import { BaseInputDirective } from '../../base/base-input/base-input.directive';

@Component({
  selector: 'signal-form-radio-field',
  imports: [],
  templateUrl: './form-radio-field.component.html',
  styleUrl: './form-radio-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormRadioFieldComponent extends BaseInputDirective<
  FormFieldType.RADIO,
  FormOption,
  RadioFieldConfig
> {
  public options = input.required<FormOption[]>();
}
