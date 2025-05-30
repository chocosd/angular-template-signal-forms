import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { BaseInputDirective } from '@base/base-input/base-input.directive';
import { DateTime } from 'luxon';
import { SignalModelDirective } from '../../../directives/signal-model.directive';
import { RuntimeDateTimeSignalField } from '../../../models/signal-field-types.model';

@Component({
  selector: 'signal-form-datetime-field',
  standalone: true,
  imports: [SignalModelDirective],
  templateUrl: './form-datetime-field.component.html',
  styleUrl: './form-datetime-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormDatetimeFieldComponent<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> extends BaseInputDirective<RuntimeDateTimeSignalField<TModel, K>, TModel, K> {
  protected formattedValue = computed(() => {
    const date = this.field().value();
    const format = this.field().config?.format ?? "yyyy-LL-dd'T'HH:mm";
    return date && date instanceof Date
      ? DateTime.fromJSDate(date).toFormat(format)
      : '';
  });

  protected extractValue(el: HTMLInputElement): Date {
    return new Date(el.value);
  }
}
