import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { SignalModelDirective } from '../../../directives';
import {
  type FormOption,
  type RuntimeMultiSelectSignalField,
} from '../../../models';
import { FormDropdownService } from '../../../services';
import { BaseInputDirective } from '../../base';
import { SignalFormHostDirective } from '../../base/host-directive/signal-form-host.directive';

@Component({
  selector: 'signal-form-multiselect-field',
  standalone: true,
  imports: [SignalModelDirective],
  templateUrl: './signal-form-multiselect-field.component.html',
  styleUrl: './signal-form-multiselect-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [SignalFormHostDirective],
})
export class SignalFormMultiselectFieldComponent<
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
          onSelect: (selected: FormOption<TModel[K]>[]) => {
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
