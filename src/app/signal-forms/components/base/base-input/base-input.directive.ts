import {
  computed,
  Directive,
  effect,
  inject,
  Injector,
  input,
  model,
  signal,
} from '@angular/core';
import { FormFieldType } from '@enums/form-field-type.enum';
import { ConfigTypeForField } from '@models/signal-field-configs.model';
import {
  SignalValidator,
  type DynamicOptions,
  type ElementTypeForField,
  type FormOption,
} from '@models/signal-form.model';
import { MetaValidatorFn } from 'app/signal-forms/helpers/with-meta';

@Directive()
export abstract class BaseInputDirective<
  TFieldType extends FormFieldType,
  TValue,
  OptionsVal = TValue,
> {
  public hint = input<string>('');
  public disabled = input<boolean>(false);
  public config = input<ConfigTypeForField<TFieldType> | undefined>();
  public type = input<TFieldType>();
  public error = model<string | null>();
  public touched = model.required<boolean>();
  public value = model.required<TValue | null>();
  public dirty = model.required<boolean>();
  public name = input.required<string>();
  public options = input<FormOption<OptionsVal>[]>([]);
  public dynamicOptionsFn = input<DynamicOptions<object, keyof object>>();
  public validators = input([] as SignalValidator<object, keyof object>[]);

  private initialValue = signal<TValue | null>(null);
  private hasCapturedInitial = signal(false);

  protected readonly injector = inject(Injector);
  protected readonly listboxId = computed(
    () => `dropdown-listbox-${this.name()}`,
  );
  // protected readonly placeholder = computed(() => {
  //   this.config()?.placeholder ?? defaultPlaceholderMap.get()
  // });

  protected isRequired = computed(() =>
    (this.validators() ?? []).some(
      (validator) =>
        (validator as MetaValidatorFn<TValue, unknown>).__meta?.required,
    ),
  );

  constructor() {
    this.captureInitialValuesEffect();
  }

  protected ariaDescribedBy = computed(() =>
    [
      this.error() ? 'error-' + this.name() : null,
      this.config()?.hint ? 'hint-' + this.name() : null,
    ]
      .filter(Boolean)
      .join(' '),
  );

  private captureInitialValuesEffect(): void {
    effect(
      () => {
        if (!this.hasCapturedInitial() && this.value()) {
          this.initialValue.set(this.value());
          this.hasCapturedInitial.set(true);
        }
      },
      {
        injector: this.injector,
      },
    );
  }

  public setValue(val: TValue): void {
    this.value.set(val);
  }

  protected getInitialValue(): TValue {
    return undefined as unknown as TValue;
  }

  protected handleBlur() {
    this.touched.set(true);
  }

  protected handleInput(event: Event) {
    const target = event.target as ElementTypeForField<TFieldType>;
    const extractedValue = this.extractValue?.(target);
    this.setValue(extractedValue);

    const isDirty = !this.isEqual(extractedValue, this.initialValue()!);
    this.dirty.set(isDirty);
    this.touched.set(true);
  }

  protected extractValue(element: ElementTypeForField<TFieldType>): TValue {
    if (element instanceof HTMLInputElement) {
      if (this.isCheckboxFieldType()) {
        return element.checked as TValue;
      }
      return element.value as TValue;
    }

    throw new Error('Unsupported element type');
  }

  protected isCheckboxFieldType(): boolean {
    return this.type() === FormFieldType.CHECKBOX;
  }

  protected isEqual(a: TValue, b: TValue): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }
}
