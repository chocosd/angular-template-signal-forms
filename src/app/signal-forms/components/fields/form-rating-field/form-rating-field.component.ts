import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { BaseInputDirective } from '@base/base-input/base-input.directive';
import { SignalModelDirective } from '../../../directives/signal-model.directive';
import { RuntimeRatingSignalField } from '../../../models/signal-field-types.model';

@Component({
  selector: 'signal-form-rating-field',
  standalone: true,
  imports: [SignalModelDirective],
  templateUrl: './form-rating-field.component.html',
  styleUrl: './form-rating-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormRatingFieldComponent<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> extends BaseInputDirective<RuntimeRatingSignalField<TModel, K>, TModel, K> {
  protected minValue = computed(() => this.field().config?.min ?? 1);
  protected maxValue = computed(() => this.field().config?.max ?? 5);

  protected stars = computed(() => {
    const min = this.minValue();
    const max = this.maxValue();
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  });

  public setRating(star: number): void {
    this.setValue(star as TModel[K]);
    this.field().touched.set(true);
  }
}
