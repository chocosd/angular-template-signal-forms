import { Component, computed } from '@angular/core';
import { BaseInputDirective } from '../../../components/base/base-input/base-input.directive';
import { SignalModelDirective } from '../../../directives/signal-model.directive';
import { type RuntimeChipListSignalField } from '../../../models/signal-field-types.model';
import { type FormOption } from '../../../models/signal-form.model';

@Component({
  selector: 'signal-form-chip-list-field',
  standalone: true,
  imports: [SignalModelDirective],
  templateUrl: './signal-form-chip-list-field.component.html',
  styleUrl: './signal-form-chip-list-field.component.scss',
})
export class SignalFormChipListFieldComponent<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> extends BaseInputDirective<RuntimeChipListSignalField<TModel, K>, TModel, K> {
  public selectedValues = computed(() => this.field().value() ?? []);

  public isSelected = (option: FormOption<TModel[K]>): boolean =>
    !!this.selectedValues().find(
      (val: FormOption<TModel[K]>) => val.value === option.value,
    );

  public toggleOption(option: FormOption<TModel[K]>): void {
    const current = this.selectedValues();
    const updated = this.isSelected(option)
      ? current.filter(
          (val: FormOption<TModel[K]>) => val.value !== option.value,
        )
      : [...current, option];

    this.setValue(updated);
    this.field().touched.set(true);
    this.field().dirty.set(true);
  }
}
