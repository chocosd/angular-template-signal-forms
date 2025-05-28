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
  protected stars = computed(() =>
    Array.from({ length: this.field().config?.max ?? 5 }, (_, i) => i + 1),
  );

  public setRating(star: number): void {
    this.setValue(star as TModel[K]);
    this.field().touched.set(true);
  }
}
