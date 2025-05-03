import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { CheckboxFieldConfig } from '../../../models/signal-form.model';
import { BaseInputDirective } from '../../base/base-input/base-input.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-form-checkbox-field',
  standalone: true,
  templateUrl: './form-checkbox-field.component.html',
})
export class FormCheckboxFieldComponent extends BaseInputDirective<
  FormFieldType.CHECKBOX,
  boolean,
  CheckboxFieldConfig
> {
  protected override extractValue(element: HTMLInputElement): boolean {
    return element.checked;
  }
}
