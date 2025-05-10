import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  HostBinding,
  Injector,
  input,
  Optional,
  Renderer2,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormColorFieldComponent } from '@fields/form-color-field/form-color-field.component';
import { FormFileFieldComponent } from '@fields/form-file-field/form-file-field.component';
import { FormMaskedFieldComponent } from '@fields/form-masked-field/form-masked-field.component';
import { FormRatingFieldComponent } from '@fields/form-rating-field/form-rating-field.component';
import { FormSliderFieldComponent } from '@fields/form-slider-field/form-slider-field.component';
import { FormSwitchFieldComponent } from '@fields/form-switch-field/form-switch-field.component';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import {
  type SignalFormContainer,
  type SignalFormField,
} from '../../../models/signal-form.model';
import { SignalFormHostDirective } from '../../base/host-directive/signal-form-host.directive';
import { FormAutocompleteFieldComponent } from '../../fields/form-autocomplete-field/form-autocomplete-field.component';
import { FormCheckboxFieldComponent } from '../../fields/form-checkbox-field/form-checkbox-field.component';
import { FormDatetimeFieldComponent } from '../../fields/form-datetime-field/form-datetime-field.component';
import { FormMultiselectFieldComponent } from '../../fields/form-multiselect-field/form-multiselect-field.component';
import { FormNumberFieldComponent } from '../../fields/form-number-field/form-number-field.component';
import { FormPasswordFieldComponent } from '../../fields/form-password-field/form-password-field.component';
import { FormRadioFieldComponent } from '../../fields/form-radio-field/form-radio-field.component';
import { FormSelectFieldComponent } from '../../fields/form-select-field/form-select-field.component';
import { FormTextFieldComponent } from '../../fields/form-text-field/form-text-field.component';
import { FormTextareaFieldComponent } from '../../fields/form-textarea-field/form-textarea-field.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'signal-form-input-item',
  imports: [
    FormAutocompleteFieldComponent,
    FormCheckboxFieldComponent,
    FormDatetimeFieldComponent,
    FormFileFieldComponent,
    FormMultiselectFieldComponent,
    FormNumberFieldComponent,
    FormPasswordFieldComponent,
    FormRadioFieldComponent,
    FormSelectFieldComponent,
    FormTextFieldComponent,
    FormTextareaFieldComponent,
    FormColorFieldComponent,
    FormMaskedFieldComponent,
    FormRatingFieldComponent,
    FormSliderFieldComponent,
    FormSwitchFieldComponent,
  ],
  hostDirectives: [SignalFormHostDirective],
  templateUrl: './signal-form-input-item.component.html',
  styleUrl: './signal-form-input-item.component.scss',
})
export class SignalFormInputItemComponent<TModel> {
  public field = input.required<SignalFormField<TModel>>();
  public form = input.required<SignalFormContainer<TModel>>();

  protected readonly FormFieldType = FormFieldType;

  protected filteredOptions = computed(() => {
    const field = this.field();
    const form = this.form();

    if (!('options' in field)) {
      return [];
    }

    const options = (field as any).options();
    const dynamicOptionsFn = (field as any).dynamicOptions;

    if (typeof dynamicOptionsFn !== 'function') {
      return options;
    }

    return dynamicOptionsFn(form, options, field.value());
  });

  private initialized = signal(false);

  @HostBinding('style.gridArea')
  get gridArea(): string | null {
    return this.field()?.name?.toString() ?? null;
  }

  constructor(
    private readonly renderer: Renderer2,
    private readonly host: ElementRef,
    private readonly injector: Injector,
    @Optional()
    private readonly signalFormHostDirective: SignalFormHostDirective,
  ) {
    this.initializeComputedValueEffect();
    this.initializeFormOptionsEffect();
    this.watchComputedValueEffect();
    this.validationEffect();
    this.focusEffect();
  }

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

  private validationEffect(): void {
    effect(
      () => {
        const field = this.field();
        const value = field.value() as TModel[keyof TModel];

        const validators = field.validators ?? [];
        for (const validator of validators) {
          const error = validator(value, this.form());
          if (error) {
            field.error.set(error);
            return;
          }
        }

        field.error.set(null);
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
        input.focus?.();

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
