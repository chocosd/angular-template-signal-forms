import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { DateTimeFieldConfig } from '../../../models/signal-form.model';
import { BaseInputDirective } from '../../base/base-input/base-input.directive';

@Component({
  selector: 'app-form-datetime-field',
  imports: [],
  templateUrl: './form-datetime-field.component.html',
  styleUrl: './form-datetime-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormDatetimeFieldComponent extends BaseInputDirective<
  FormFieldType.DATETIME,
  Date,
  DateTimeFieldConfig
> {}
