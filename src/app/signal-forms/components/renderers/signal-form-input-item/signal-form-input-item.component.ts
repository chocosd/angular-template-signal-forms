import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  HostBinding,
  inject,
  Injector,
  input,
  Renderer2,
  signal,
  WritableSignal,
} from '@angular/core';
import { SignalFormHostDirective } from '@base/host-directive/signal-form-host.directive';
import { FormFieldType } from '@enums/form-field-type.enum';
import { SignalFormAutocompleteFieldComponent } from '@fields/signal-form-autocomplete-field/signal-form-autocomplete-field.component';
import { SignalFormCheckboxFieldComponent } from '@fields/signal-form-checkbox-field/signal-form-checkbox-field.component';
import { SignalFormCheckboxGroupFieldComponent } from '@fields/signal-form-checkbox-group-field/signal-form-checkbox-group-field.component';
import { SignalFormChipListFieldComponent } from '@fields/signal-form-chip-list-field/signal-form-chip-list-field.component';
import { SignalFormColorFieldComponent } from '@fields/signal-form-color-field/signal-form-color-field.component';
import { SignalFormDatetimeFieldComponent } from '@fields/signal-form-datetime-field/signal-form-datetime-field.component';
import { SignalFormFileFieldComponent } from '@fields/signal-form-file-field/signal-form-file-field.component';
import { SignalFormMultiselectFieldComponent } from '@fields/signal-form-multiselect-field/signal-form-multiselect-field.component';
import { SignalFormNumberFieldComponent } from '@fields/signal-form-number-field/signal-form-number-field.component';
import { SignalFormPasswordFieldComponent } from '@fields/signal-form-password-field/signal-form-password-field.component';
import { SignalFormRadioFieldComponent } from '@fields/signal-form-radio-field/signal-form-radio-field.component';
import { SignalFormRatingFieldComponent } from '@fields/signal-form-rating-field/signal-form-rating-field.component';
import { SignalFormSelectFieldComponent } from '@fields/signal-form-select-field/signal-form-select-field.component';
import { SignalFormSliderFieldComponent } from '@fields/signal-form-slider-field/signal-form-slider-field.component';
import { SignalFormSwitchFieldComponent } from '@fields/signal-form-switch-field/signal-form-switch-field.component';
import { SignalFormTextFieldComponent } from '@fields/signal-form-text-field/signal-form-text-field.component';
import { SignalFormTextareaFieldComponent } from '@fields/signal-form-textarea-field/signal-form-textarea-field.component';
import {
  type SignalFormContainer,
  type SignalFormField,
} from '@models/signal-form.model';
import { ValidationService } from '@services/validation.service';
import { FormFieldSkeletonMapperComponent } from '@ui/skeletons/form-field-skeleton-mapper.component';
import { isRequired } from '../../../helpers/is-required';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'signal-form-input-item',
  imports: [
    CommonModule,
    SignalFormAutocompleteFieldComponent,
    SignalFormTextFieldComponent,
    SignalFormPasswordFieldComponent,
    SignalFormTextareaFieldComponent,
    SignalFormNumberFieldComponent,
    SignalFormSelectFieldComponent,
    SignalFormRadioFieldComponent,
    SignalFormCheckboxFieldComponent,
    SignalFormCheckboxGroupFieldComponent,
    SignalFormDatetimeFieldComponent,
    SignalFormColorFieldComponent,
    SignalFormSwitchFieldComponent,
    SignalFormSliderFieldComponent,
    SignalFormFileFieldComponent,
    SignalFormRatingFieldComponent,
    SignalFormMultiselectFieldComponent,
    SignalFormChipListFieldComponent,
    FormFieldSkeletonMapperComponent,
  ],
  hostDirectives: [SignalFormHostDirective],
  templateUrl: './signal-form-input-item.component.html',
  styleUrl: './signal-form-input-item.component.scss',
})
export class SignalFormInputItemComponent<TModel> {
  public field = input.required<SignalFormField<TModel>>();
  public form = input.required<SignalFormContainer<TModel>>();
  public index = input<number | null>();

  protected readonly FormFieldType = FormFieldType;

  private initialized = signal(false);
  private validationService = inject(ValidationService);

  protected name = computed(() => {
    if (typeof this.index() === 'number') {
      return `${String(this.field().name)}-${this.index()}`;
    }

    return `${String(this.field().name)}`;
  });

  @HostBinding('style.gridArea')
  get gridArea(): string | null {
    return this.field()?.name?.toString() ?? null;
  }

  constructor(
    private readonly renderer: Renderer2,
    private readonly host: ElementRef,
    private readonly injector: Injector,
  ) {
    this.initializeComputedValueEffect();
    this.initializeFormOptionsEffect();
    this.watchComputedValueEffect();
    this.setupValidation();
    this.focusEffect();
  }

  protected isRequired(): boolean {
    return isRequired({ validators: this.field().validators });
  }

  protected hasError = computed(() => {
    const field = this.field();
    return this.validationService.getCombinedError(field);
  });

  protected isValidating = computed(() => {
    const field = this.field();

    // Check if field has validating property (not all field types have async validation)
    if (
      'validating' in field &&
      typeof (field as any).validating === 'function'
    ) {
      return (field as any).validating();
    }

    // For fields without async validation, they're never validating
    return false;
  });

  private initializeFormOptionsEffect(): void {}

  private initializeComputedValueEffect(): void {
    effect(
      () => {
        const field = this.field();
        if (!field.computedValue || this.initialized()) return;

        const initialValue = field.computedValue(this.form());
        this.setValue(initialValue, false);
        this.initialized.set(true);
      },
      { injector: this.injector },
    );
  }

  private watchComputedValueEffect(): void {
    effect(
      () => {
        const field = this.field();
        if (!field.computedValue || !this.initialized()) return;

        const newValue = field.computedValue(this.form());
        this.setValue(newValue, false);
      },
      { injector: this.injector },
    );
  }

  private setupValidation(): void {
    effect(
      () => {
        const field = this.field();
        const form = this.form();

        // Set up validation for this field
        this.validationService.setupFieldValidation(field, form);
      },
      { injector: this.injector },
    );
  }

  private focusEffect(): void {
    effect(
      () => {
        const field = this.field();

        if (!field.focus()) {
          return;
        }

        const el = this.host.nativeElement;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = el.querySelector('input');
        input?.focus?.();

        this.renderer.addClass(el, 'form-error-highlight');

        setTimeout(() => {
          this.renderer.removeClass(el, 'form-error-highlight');
          this.field().focus.set(false);
        }, 1000);
      },
      { injector: this.injector },
    );
  }

  protected isHidden = computed<boolean>(() => {
    const { hidden } = this.field();

    return typeof hidden === 'function' ? hidden(this.form()) : !!hidden;
  });

  protected isDisabled = computed<boolean>(() => {
    const { disabled } = this.field();

    return typeof disabled === 'function' ? disabled(this.form()) : !!disabled;
  });

  private setValue(value: TModel[keyof TModel], markTouched: boolean = true) {
    if (markTouched) {
      this.field().touched.set(true);
      this.field().dirty.set(true);
    }

    if (typeof value === 'number') {
      (this.field().value as unknown as WritableSignal<number>).set(value);
      return;
    }
    if (typeof value === 'boolean') {
      (this.field().value as unknown as WritableSignal<boolean>).set(value);
      return;
    }
    if (value instanceof Date) {
      (this.field().value as unknown as WritableSignal<Date>).set(value);
      return;
    }
    if (typeof value === 'object' && !!value) {
      (this.field().value as unknown as WritableSignal<object>).set(value);
      return;
    }

    const val = value as string;
    (this.field().value as unknown as WritableSignal<string>).set(val);
  }
}
