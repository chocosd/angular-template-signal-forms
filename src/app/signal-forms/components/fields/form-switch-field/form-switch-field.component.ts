import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { type SwitchFieldConfig } from '../../../models/signal-field-configs.model';
import { BaseInputDirective } from '../../base/base-input/base-input.directive';

@Component({
  selector: 'signal-form-switch-field',
  imports: [],
  templateUrl: './form-switch-field.component.html',
  styleUrl: './form-switch-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSwitchFieldComponent extends BaseInputDirective<
  FormFieldType.SWITCH,
  boolean,
  SwitchFieldConfig
> {}
