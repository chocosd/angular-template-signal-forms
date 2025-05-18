import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { BaseInputDirective } from '@base/base-input/base-input.directive';
import { FormFieldType } from '@enums/form-field-type.enum';
import { DateTimeFieldConfig } from '@models/signal-field-configs.model';
import { DateTime } from 'luxon';

@Component({
  selector: 'signal-form-datetime-field',
  standalone: true,
  imports: [],
  templateUrl: './form-datetime-field.component.html',
  styleUrl: './form-datetime-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormDatetimeFieldComponent extends BaseInputDirective<
  FormFieldType.DATETIME,
  Date,
  DateTimeFieldConfig
> {
  protected formattedValue = computed(() => {
    const date = this.value();
    const format = this.config()?.format ?? "yyyy-LL-dd'T'HH:mm";
    return date ? DateTime.fromJSDate(date).toFormat(format) : '';
  });

  override extractValue(el: HTMLInputElement): Date {
    return new Date(el.value);
  }
}
