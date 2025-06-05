import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { SignalModelDirective } from '../../../directives/signal-model.directive';
import { type RuntimeSelectSignalField } from '../../../models/signal-field-types.model';
import { type FormOption } from '../../../models/signal-form.model';
import { FormDropdownService } from '../../../services/form-dropdown.service';
import { BaseInputDirective } from '../../base/base-input/base-input.directive';
import { SignalFormHostDirective } from '../../base/host-directive/signal-form-host.directive';

@Component({
  selector: 'signal-form-select-field',
  standalone: true,
  imports: [CommonModule, SignalModelDirective],
  templateUrl: './signal-form-select-field.component.html',
  styleUrl: './signal-form-select-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [SignalFormHostDirective],
})
export class SignalFormSelectFieldComponent<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> extends BaseInputDirective<RuntimeSelectSignalField<TModel, K>, TModel, K> {
  public showDropdown = signal(false);
  protected displayText = computed(() => this.displayValue());

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
        const currentValue = this.field().value();
        const currentOption = this.findOptionByValue(currentValue);

        this.dropdownService.openDropdown<any>({
          options: this.field().options(),
          reference,
          viewContainerRef: this.host.viewContainerRef,
          ariaListboxId: `${String(this.field().name)}-listbox`,
          multiselect: false,
          initialSelection: currentOption,
          onSelect: (selected: FormOption<NonNullable<TModel[K]>>) => {
            this.setValue(selected);
            this.field().touched.set(true);
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

  private findOptionByValue(
    value: TModel[K] | FormOption<TModel[K]>,
  ): FormOption<TModel[K]> | undefined {
    if (!value) {
      return undefined;
    }

    const options = this.field().options();
    if (typeof value === 'object' && 'value' in value) {
      // If value is already a FormOption, find by value property
      return options.find((opt) => opt.value === value.value);
    }
    // Otherwise find by raw value
    return options.find((opt) => opt.value === value);
  }

  public displayValue(): string {
    const value = this.field().value();
    if (!value) {
      return this.field().config?.placeholder ?? '';
    }

    if (typeof value === 'object' && 'label' in value) {
      return value.label;
    }

    const option = this.findOptionByValue(value);
    return option?.label ?? this.field().config?.placeholder ?? '';
  }
}
