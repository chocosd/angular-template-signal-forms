import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  Injector,
  input,
  Renderer2,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import {
  SignalFormContainer,
  SignalFormField,
} from '../../../models/signal-form.model';
import { FormCheckboxFieldComponent } from '../../fields/form-checkbox-field/form-checkbox-field.component';
import { FormNumberFieldComponent } from '../../fields/form-number-field/form-number-field.component';
import { FormTextFieldComponent } from '../../fields/form-text-field/form-text-field.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'signal-form-input-item',
  imports: [
    FormNumberFieldComponent,
    FormCheckboxFieldComponent,
    FormTextFieldComponent,
  ],
  templateUrl: './signal-form-input-item.component.html',
  styleUrl: './signal-form-input-item.component.scss',
})
export class SignalFormInputItemComponent<TModel> {
  public field = input.required<SignalFormField<TModel>>();
  public form = input.required<SignalFormContainer<TModel>>();

  protected readonly FormFieldType = FormFieldType;

  private initialized = signal(false);

  constructor(
    private renderer: Renderer2,
    private host: ElementRef,
    private injector: Injector,
  ) {
    this.initializeComputedValueEffect();
    this.watchComputedValueEffect();
    this.validationEffect();
    this.focusEffect();
  }

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
          const error = validator(value);
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
        console.log(el);

        setTimeout(() => {
          this.renderer.removeClass(el, 'form-error-highlight');
          this.field().focus.set(false);
        }, 1000);
      },
      { injector: this.injector },
    );
  }

  protected isHidden = computed<boolean>(() => {
    const { hide } = this.field();

    return typeof hide === 'function' ? hide(this.form()) : !!hide;
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
