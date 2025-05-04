import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  Injector,
  input,
  signal,
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { from, isObservable } from 'rxjs';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import {
  AutocompleteFieldConfig,
  FormOption,
  LoadOptionsFn,
} from '../../../models/signal-form.model';
import { BaseInputDirective } from '../../base/base-input/base-input.directive';

@Component({
  selector: 'app-form-autocomplete-field',
  standalone: true,
  templateUrl: './form-autocomplete-field.component.html',
  styleUrl: './form-autocomplete-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormAutocompleteFieldComponent extends BaseInputDirective<
  FormFieldType.AUTOCOMPLETE,
  FormOption | null,
  AutocompleteFieldConfig
> {
  public loadOptions = input.required<LoadOptionsFn>();

  protected search = signal('');
  protected options = signal<FormOption[]>([]);
  protected showDropdown = signal(false);

  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);

  constructor() {
    super();
    this.searchQueryChangeEffect();
  }

  public onSelect(option: FormOption) {
    this.setValue(option);
    this.showDropdown.set(false);
  }

  private searchQueryChangeEffect(): void {
    effect(
      () => {
        const query = this.search();

        if (
          this.config()?.minChars &&
          query.length < (this.config()?.minChars ?? 0)
        ) {
          this.options.set([]);
          return;
        }

        const loader = this.loadOptions();
        if (!loader || !query) {
          this.options.set([]);
          return;
        }

        const source = loader(query);
        const obs$ = isObservable(source) ? source : from(source);

        const debounced$ = obs$.pipe(takeUntilDestroyed(this.destroyRef));

        const timeout = setTimeout(() => {
          debounced$.subscribe((result) => {
            this.options.set(result);
            this.showDropdown.set(true);
          });
        }, this.config()?.debounceMs ?? 300);

        return () => clearTimeout(timeout);
      },
      { injector: this.injector },
    );
  }
}
