import {
  ApplicationRef,
  ComponentRef,
  Injectable,
  Injector,
  ViewContainerRef,
} from '@angular/core';
import { type FormOption } from '@models/signal-form.model';
import { FormDropdownOverlayComponent } from '@ui/form-dropdown-overlay/form-dropdown-overlay.component';

type BaseDropdownConfig<
  TOption extends FormOption<TValue>,
  TValue = TOption['value'],
> = {
  options: TOption[];
  reference: HTMLElement;
  ariaListboxId: string;
  viewContainerRef: ViewContainerRef;
  onClose?: () => void;
};

type SingleSelectConfig<
  TOption extends FormOption<TValue>,
  TValue = TOption['value'],
> = BaseDropdownConfig<TOption, TValue> & {
  multiselect: false;
  initialSelection?: TOption | null;
  onSelect: (option: TOption) => void;
};

type MultiSelectConfig<
  TOption extends FormOption<TValue>,
  TValue = TOption['value'],
> = BaseDropdownConfig<TOption, TValue> & {
  multiselect: true;
  initialSelection?: TOption[] | null;
  onSelect: (options: TOption[]) => void;
};

type DropdownConfig<
  TOption extends FormOption<TValue>,
  TValue = TOption['value'],
> = SingleSelectConfig<TOption, TValue> | MultiSelectConfig<TOption, TValue>;

@Injectable({ providedIn: 'root' })
export class FormDropdownService {
  private dropdownRef?: ComponentRef<FormDropdownOverlayComponent>;

  constructor(
    private readonly appRef: ApplicationRef,
    private readonly injector: Injector,
  ) {}

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
