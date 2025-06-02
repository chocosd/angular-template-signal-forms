import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { BaseInputDirective } from '@base/base-input/base-input.directive';
import { RuntimeCheckboxGroupSignalField } from '../../../models/signal-field-types.model';
import { FormOption } from '../../../models/signal-form.model';

@Component({
  selector: 'signal-form-checkbox-group-field',
  standalone: true,
  imports: [NgClass],
  templateUrl: './form-checkbox-group-field.component.html',
  styleUrl: './form-checkbox-group-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormCheckboxGroupFieldComponent<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> extends BaseInputDirective<
  RuntimeCheckboxGroupSignalField<TModel, K>,
  TModel,
  K
> {
  protected layoutClass = computed(() =>
    this.field().config?.layout === 'inline'
      ? 'checkbox-group-inline'
      : 'checkbox-group-stacked',
  );

  protected isChecked = (option: FormOption<TModel[K]>) => {
    const val = this.field().value();
    const key = option.value as string;

    if (this.field().config?.valueType === 'map') {
      const record = val as Record<string, boolean>;
      return record ? record[key] : false;
    }
    return (val as string[])?.includes(key);
  };

  protected toggleOption(option: FormOption<TModel[K]>): void {
    const key = option.value as string;
    const valueType = this.field().config?.valueType ?? 'array';
    let val = this.field().value();

    // Normalize value
    if (!val) {
      val = valueType === 'map' ? {} : [];
    }

    if (valueType === 'map') {
      const current = (
        typeof val === 'object' && !Array.isArray(val) ? { ...val } : {}
      ) as Record<string, boolean>;

      // Flip the selected value
      current[key] = !current[key];

      // Normalize to include all options with explicit true/false
      const fullRecord: Record<string, boolean> = {};
      for (const opt of this.field().options()) {
        const optKey = opt.value as string;
        fullRecord[optKey] = !!current[optKey];
      }

      this.setValue(fullRecord);
    } else {
      const arr = Array.isArray(val) ? val : [];
      this.setValue(
        arr.includes(key) ? arr.filter((v) => v !== key) : [...arr, key],
      );
    }

    this.field().touched.set(true);
    this.field().dirty.set(true);
  }
}
