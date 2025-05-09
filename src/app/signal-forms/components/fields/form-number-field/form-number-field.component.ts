import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { type NumberFieldConfig } from '../../../models/signal-field-configs.model';
import { BaseInputDirective } from '../../base/base-input/base-input.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'signal-form-number-field',
  standalone: true,
  templateUrl: './form-number-field.component.html',
})
export class FormNumberFieldComponent extends BaseInputDirective<
  FormFieldType.NUMBER,
  number,
  NumberFieldConfig
> {
  protected override extractValue(element: HTMLInputElement): number {
    const rawValue = element.value;
    const parsed = parseFloat(rawValue);
    return isNaN(parsed) ? 0 : parsed;
  }
}
