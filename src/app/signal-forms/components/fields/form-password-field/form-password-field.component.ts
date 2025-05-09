import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { type PasswordFieldConfig } from '../../../models/signal-field-configs.model';
import { BaseInputDirective } from '../../base/base-input/base-input.directive';

@Component({
  selector: 'signal-form-password-field',
  imports: [],
  templateUrl: './form-password-field.component.html',
  styleUrl: './form-password-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormPasswordFieldComponent extends BaseInputDirective<
  FormFieldType.PASSWORD,
  string,
  PasswordFieldConfig
> {}
