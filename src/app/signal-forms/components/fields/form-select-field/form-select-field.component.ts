import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { BaseInputDirective } from '@base/base-input/base-input.directive';
import { SignalFormHostDirective } from '@base/host-directive/signal-form-host.directive';
import { FormFieldType } from '@enums/form-field-type.enum';
import { type SelectFieldConfig } from '@models/signal-field-configs.model';
import { type FormOption } from '@models/signal-form.model';
import { FormDropdownService } from '@services/form-dropdown.service';

@Component({
  selector: 'signal-form-select-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-select-field.component.html',
  styleUrl: './form-select-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [SignalFormHostDirective],
})
export class FormSelectFieldComponent extends BaseInputDirective<
  FormFieldType.SELECT,
  FormOption | null,
  SelectFieldConfig
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

        this.dropdownService.openDropdown<FormOption>({
          options: this.options(),
          reference,
          viewContainerRef: this.host.viewContainerRef,
          ariaListboxId: this.listboxId(),
          multiselect: false,
          initialSelection: this.value(),
          onSelect: (selected) => {
            this.setValue(selected);
            this.touched.set(true);
            this.showDropdown.set(false);
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

  public toggleDropdown(): void {
    this.showDropdown.update((show) => !show);
  }

  public displayValue(): string {
    return this.value()?.label ?? '';
  }
}
