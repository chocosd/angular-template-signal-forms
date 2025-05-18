import {
  ApplicationRef,
  ComponentRef,
  Injectable,
  Injector,
  ViewContainerRef,
} from '@angular/core';
import { type FormOption } from '@models/signal-form.model';
import { FormDropdownOverlayComponent } from '@ui/form-dropdown-overlay/form-dropdown-overlay.component';

@Injectable({ providedIn: 'root' })
export class FormDropdownService {
  private dropdownRef?: ComponentRef<FormDropdownOverlayComponent>;

  constructor(
    private readonly appRef: ApplicationRef,
    private readonly injector: Injector,
  ) {}

  public openDropdown<TVal>(config: {
    options: FormOption[];
    reference: HTMLElement;
    ariaListboxId: string;
    viewContainerRef: ViewContainerRef;
    onSelect: (option: TVal) => void;
    onClose?: () => void;
    initialSelection?: TVal | null;
    multiselect: boolean;
  }): void {
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
      config.onSelect(option as TVal);

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
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    });
  }

  public destroyDropdown(): void {
    this.dropdownRef?.destroy();
    this.dropdownRef = undefined;
  }
}
