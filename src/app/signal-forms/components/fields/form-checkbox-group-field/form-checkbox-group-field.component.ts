import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { FormOption } from '../../../models/signal-form.model';
import { BaseInputDirective } from '../../base/base-input/base-input.directive';

@Component({
  selector: 'signal-form-checkbox-group-field',
  standalone: true,
  imports: [NgClass],
  templateUrl: './form-checkbox-group-field.component.html',
  styleUrl: './form-checkbox-group-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormCheckboxGroupFieldComponent extends BaseInputDirective<
  FormFieldType.CHECKBOX_GROUP,
  string[] | Record<string, boolean>,
  string
> {
  public valueType = input<'array' | 'map'>('array');

  protected layoutClass = computed(() =>
    this.config()?.layout === 'inline'
      ? 'checkbox-group-inline'
      : 'checkbox-group-stacked',
  );

  protected isChecked = (option: FormOption) => {
    const val = this.value();
    const key = option.value as string;

    return this.valueType() === 'map'
      ? !!(val as Record<string, boolean>)?.[key]
      : (val as string[])?.includes(key);
  };

  protected toggleOption(option: FormOption): void {
    const key = option.value as string;
    const valueType = this.valueType();
    let val = this.value();

    // Normalize value
    if (!val) {
      val = valueType === 'map' ? {} : [];
    }

    if (valueType === 'map') {
      const current =
        typeof val === 'object' && !Array.isArray(val) ? { ...val } : {};

      // Flip the selected value
      current[key] = !current[key];

      // Normalize to include all options with explicit true/false
      const fullRecord: Record<string, boolean> = {};
      for (const opt of this.options()) {
        const optKey = opt.value;
        fullRecord[optKey] = !!current[optKey];
      }

      this.setValue(fullRecord);
    } else {
      const arr = Array.isArray(val) ? val : [];
      this.setValue(
        arr.includes(key) ? arr.filter((v) => v !== key) : [...arr, key],
      );
    }

    this.touched.set(true);
    this.dirty.set(true);
  }
}
