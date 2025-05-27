import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { BaseInputDirective } from '@base/base-input/base-input.directive';
import { SignalFormHostDirective } from '@base/host-directive/signal-form-host.directive';
import { SignalModelDirective } from '@directives/signal-model.directive';
import { FormDropdownService } from '@services/form-dropdown.service';
import { RuntimeMultiSelectSignalField } from '../../../models/signal-field-types.model';
import { FormOption } from '../../../models/signal-form.model';

@Component({
  selector: 'signal-form-multiselect-field',
  standalone: true,
  imports: [SignalModelDirective],
  templateUrl: './form-multiselect-field.component.html',
  styleUrl: './form-multiselect-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [SignalFormHostDirective],
})
export class FormMultiselectFieldComponent<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> extends BaseInputDirective<
  RuntimeMultiSelectSignalField<TModel, K>,
  TModel,
  K
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

        this.dropdownService.openDropdown<any>({
          options: this.field().options(),
          reference,
          viewContainerRef: this.host.viewContainerRef,
          multiselect: true,
          ariaListboxId: `${String(this.field().name)}-listbox`,
          initialSelection: this.field().value(),
          onSelect: (selected) => {
            this.setValue(selected);
            this.field().touched.set(true);
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

  public removeChip(option: FormOption<TModel[K]>): void {
    this.field().value.update((vals) =>
      (vals ?? []).filter((o) => o.value !== option.value),
    );
    this.field().touched.set(true);
  }

  public toggleDropdown(): void {
    this.showDropdown.update((show) => !show);
  }
}
