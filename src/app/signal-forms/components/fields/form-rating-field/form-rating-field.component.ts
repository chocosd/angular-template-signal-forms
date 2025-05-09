import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { BaseInputDirective } from '@base/base-input/base-input.directive';
import { FormFieldType } from '@enums/form-field-type.enum';

@Component({
  selector: 'signal-form-rating-field',
  imports: [],
  templateUrl: './form-rating-field.component.html',
  styleUrl: './form-rating-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormRatingFieldComponent extends BaseInputDirective<
  FormFieldType.RATING,
  number,
  { max: number }
> {
  protected stars = computed(() =>
    Array.from({ length: this.config()?.max ?? 5 }, (_, i) => i + 1),
  );

  public setRating(star: number): void {
    this.setValue(star);
    this.touched.set(true);
  }
}
