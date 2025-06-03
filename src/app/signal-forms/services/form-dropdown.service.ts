import {
  ApplicationRef,
  ComponentRef,
  inject,
  Injectable,
  Injector,
} from '@angular/core';
import { type DropdownConfig } from '@models/dropdown.model';
import { type FormOption } from '@models/signal-form.model';
import { FormDropdownOverlayComponent } from '@ui/form-dropdown-overlay/form-dropdown-overlay.component';

@Injectable({ providedIn: 'root' })
export class FormDropdownService {
  private dropdownRef?: ComponentRef<FormDropdownOverlayComponent>;

  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(Injector);

  public openDropdown<
    TOption extends FormOption<TValue>,
    TValue = TOption['value'],
  >(config: DropdownConfig<TOption, TValue>): void {
    this.destroyDropdown();

    this.dropdownRef = config.viewContainerRef.createComponent(
      FormDropdownOverlayComponent,
      {
        environmentInjector: this.appRef.injector,
        injector: this.injector,
      },
    );

    const instance = this.dropdownRef.instance;

    this.dropdownRef.setInput('options', config.options);
    this.dropdownRef.setInput('triggerElement', config.reference);
    this.dropdownRef.setInput('multiselect', config.multiselect);
    this.dropdownRef.setInput('ariaListboxId', config.ariaListboxId);
    this.dropdownRef.setInput('initialSelection', config.initialSelection);

    instance.select.subscribe((option) => {
      config.onSelect(option as any);

      if (!config.multiselect) {
        this.destroyDropdown();
      }
    });

    instance.close.subscribe(() => {
      config.onClose?.();
      this.destroyDropdown();
    });

    requestAnimationFrame(() => {
      const rect = config.reference.getBoundingClientRect();

      instance.setPosition({
        top: rect.height,
        left: 0,
        width: rect.width,
      });
    });
  }

  public destroyDropdown(): void {
    this.dropdownRef?.destroy();
    this.dropdownRef = undefined;
  }
}
