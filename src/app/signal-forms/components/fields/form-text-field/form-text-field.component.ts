import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { BaseInputDirective } from '../../base/base-input/base-input.directive';

export interface TextFieldConfig {
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'signal-form-text-field',
  standalone: true,
  templateUrl: 'form-text-field.component.html',
})
export class FormTextFieldComponent extends BaseInputDirective<
  FormFieldType.TEXT,
  string
> {}
