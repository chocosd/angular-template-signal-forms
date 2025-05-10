import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { MultiSelectFieldConfig } from 'app/signal-forms/models/signal-field-configs.model';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { FormOption } from '../../../models/signal-form.model';
import { FormDropdownService } from '../../../services/form-dropdown.service';
import { BaseInputDirective } from '../../base/base-input/base-input.directive';
import { SignalFormHostDirective } from '../../base/host-directive/signal-form-host.directive';

@Component({
  selector: 'signal-form-multiselect-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-multiselect-field.component.html',
  styleUrl: './form-multiselect-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [SignalFormHostDirective],
})
export class FormMultiselectFieldComponent extends BaseInputDirective<
  FormFieldType.MULTISELECT,
  FormOption[],
  MultiSelectFieldConfig
> {
  protected showDropdown = signal(false);

  private readonly dropdownService = inject(FormDropdownService);
  private readonly host = inject(SignalFormHostDirective);

  constructor() {
    super();
    this.dropdownOverlayEffect();
  }

  private dropdownOverlayEffect(): void {
    effect(
      () => {
        if (!this.showDropdown()) {
          return;
        }

        const reference = this.host.viewContainerRef.element.nativeElement;

        this.dropdownService.openDropdown<FormOption[]>({
          options: this.options(),
          reference,
          viewContainerRef: this.host.viewContainerRef,
          multiselect: true,
          ariaListboxId: this.listboxId(),
          initialSelection: this.value(),
          onSelect: (selected) => {
            if (Array.isArray(selected)) {
              this.setValue(selected);
              this.touched.set(true);
            }
          },
          onClose: () => {
            this.showDropdown.set(false);
          },
        });
      },
      {
        injector: this.injector,
      },
    );
  }

  public removeChip(option: FormOption): void {
    this.value.update((vals) =>
      (vals ?? []).filter((o) => o.value !== option.value),
    );
    this.touched.set(true);
  }

  public toggleDropdown(): void {
    this.showDropdown.update((show) => !show);
  }
}
