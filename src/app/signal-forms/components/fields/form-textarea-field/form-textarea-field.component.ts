import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { BaseInputDirective } from '../../base/base-input/base-input.directive';
import { TextFieldConfig } from '../form-text-field/form-text-field.component';

@Component({
  selector: 'signal-form-textarea-field',
  imports: [],
  templateUrl: './form-textarea-field.component.html',
  styleUrl: './form-textarea-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormTextareaFieldComponent extends BaseInputDirective<
  FormFieldType.TEXTAREA,
  string,
  TextFieldConfig
> {}
