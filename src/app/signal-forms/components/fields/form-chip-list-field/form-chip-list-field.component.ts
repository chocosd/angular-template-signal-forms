import { Component, computed } from '@angular/core';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { ChipListFieldConfig } from '../../../models/signal-field-configs.model';
import { FormOption } from '../../../models/signal-form.model';
import { BaseInputDirective } from '../../base/base-input/base-input.directive';

@Component({
  selector: 'signal-form-chip-list-field',
  imports: [],
  templateUrl: './form-chip-list-field.component.html',
  styleUrl: './form-chip-list-field.component.scss',
})
export class FormChipListFieldComponent extends BaseInputDirective<
  FormFieldType.CHIPLIST,
  FormOption[],
  ChipListFieldConfig
> {
  public selectedValues = computed(() => this.value() ?? []);

  public isSelected = (option: FormOption): boolean =>
    !!this.selectedValues().find((val) => val.value === option.value);

  public toggleOption(option: FormOption): void {
    const current = this.selectedValues();
    const updated = this.isSelected(option)
      ? current.filter((val) => val.value !== option.value)
      : [...current, option];

    this.setValue(updated);
    this.touched.set(true);
    this.dirty.set(true);
  }
}
