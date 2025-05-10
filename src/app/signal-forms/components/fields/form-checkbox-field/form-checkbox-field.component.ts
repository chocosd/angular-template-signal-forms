import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { BaseInputDirective } from '../../base/base-input/base-input.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'signal-form-checkbox-field',
  standalone: true,
  styleUrl: './form-checkbox-field.component.scss',
  templateUrl: './form-checkbox-field.component.html',
})
export class FormCheckboxFieldComponent extends BaseInputDirective<
  FormFieldType.CHECKBOX,
  boolean
> {
  public label = input<string>('');

  protected override extractValue(element: HTMLInputElement): boolean {
    return element.checked;
  }
}
