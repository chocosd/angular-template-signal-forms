import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseInputDirective } from '@base/base-input/base-input.directive';
import { FormFieldType } from '@enums/form-field-type.enum';
import { type PasswordFieldConfig } from '@models/signal-field-configs.model';

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
