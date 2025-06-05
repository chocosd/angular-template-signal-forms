import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Optional,
  signal,
  viewChild,
  ViewContainerRef,
} from '@angular/core';

import { NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { from, isObservable } from 'rxjs';
import { BaseInputDirective } from '../../../components/base/base-input/base-input.directive';
import { SignalFormHostDirective } from '../../../components/base/host-directive/signal-form-host.directive';
import { SignalModelDirective } from '../../../directives/signal-model.directive';
import { type RuntimeAutocompleteSignalField } from '../../../models/signal-field-types.model';
import { type FormOption } from '../../../models/signal-form.model';
import { FormDropdownService } from '../../../services/form-dropdown.service';

@Component({
  selector: 'signal-form-autocomplete-field',
  standalone: true,
  imports: [NgClass, SignalModelDirective],
  templateUrl: './signal-form-autocomplete-field.component.html',
  styleUrl: './signal-form-autocomplete-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [SignalFormHostDirective],
})
export class SignalFormAutocompleteFieldComponent<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> extends BaseInputDirective<
  RuntimeAutocompleteSignalField<TModel, K>,
  TModel,
  K
> {
  public inputRef = viewChild<ElementRef<HTMLElement>>(
    'autocompleteInputWrapper',
  );

  protected search = signal('');
  protected loadedOptions = signal<FormOption[]>([]);
  protected showDropdown = signal(false);

  private lastQuery = signal('');
  private cachedOptions = signal<FormOption[]>([]);

  private readonly destroyRef = inject(DestroyRef);
  private readonly dropdownService = inject(FormDropdownService);

  constructor(
    @Optional()
    private readonly signalFormHostDirective: SignalFormHostDirective,
  ) {
    super();
    this.searchQueryChangeEffect();
    this.optionsOverlayEffect();
  }

  private get hostViewContainerRef(): ViewContainerRef | null {
    return this.signalFormHostDirective?.viewContainerRef ?? null;
  }

  private optionsOverlayEffect(): void {
    effect(
      () => {
        if (
          !this.showDropdown() ||
          !this.loadedOptions().length ||
          !this.inputRef()
        ) {
          return;
        }

        this.dropdownService.openDropdown<FormOption>({
          options: this.loadedOptions(),
          ariaListboxId: `${String(this.field().name)}-listbox`,
          reference: this.inputRef()!.nativeElement,
          viewContainerRef: this.hostViewContainerRef!,
          onSelect: (option) => {
            if (option) {
              this.updateValue(option);
            }
            this.field().touched.set(true);
            this.showDropdown.set(false);
            this.dropdownService.destroyDropdown();
          },
          onClose: () => {
            this.showDropdown.set(false);
          },
          multiselect: false,
        });
      },
      { injector: this.injector },
    );
  }

  private updateValue(val: FormOption | null): void {
    super.setValue(val as TModel[K]);
    this.field().dirty.set(true);
  }

  public onSelect(option: FormOption) {
    this.updateValue(option);
    this.showDropdown.set(false);
  }

  protected handleFocus(): void {
    const query = this.lastQuery();
    if (!!query && this.cachedOptions().length) {
      this.showDropdown.set(true);
      this.loadedOptions.set(this.cachedOptions());
    }
  }

  private searchQueryChangeEffect(): void {
    effect(
      () => {
        const query = this.search();
        this.lastQuery.set(query);

        if (
          this.field().config?.minChars &&
          query.length < (this.field().config?.minChars ?? 0)
        ) {
          this.loadedOptions.set([]);
          return;
        }

        const loader = this.field().loadOptions;
        if (!loader || !query) {
          this.loadedOptions.set([]);
          return;
        }

        const source = loader(query);
        const obs$ = isObservable(source) ? source : from(source);

        const debounced$ = obs$.pipe(takeUntilDestroyed(this.destroyRef));

        const timeout = setTimeout(() => {
          debounced$.subscribe((result) => {
            this.cachedOptions.set(result); // ✅ cache
            this.loadedOptions.set(result);
            this.showDropdown.set(true);
          });
        }, this.field().config?.debounceMs ?? 300);

        return () => clearTimeout(timeout);
      },
      { injector: this.injector },
    );
  }
}
