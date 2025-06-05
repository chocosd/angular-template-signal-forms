import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { DateTime } from 'luxon';
import { BaseInputDirective } from '../../../components/base/base-input/base-input.directive';
import { SignalModelDirective } from '../../../directives/signal-model.directive';
import { type RuntimeDateTimeSignalField } from '../../../models/signal-field-types.model';

@Component({
  selector: 'signal-form-datetime-field',
  standalone: true,
  imports: [SignalModelDirective],
  templateUrl: './signal-form-datetime-field.component.html',
  styleUrl: './signal-form-datetime-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalFormDatetimeFieldComponent<
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
