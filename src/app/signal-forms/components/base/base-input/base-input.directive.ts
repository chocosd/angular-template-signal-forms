import {
  Directive,
  effect,
  inject,
  Injector,
  input,
  model,
  signal,
} from '@angular/core';
import { FormFieldType } from '@enums/form-field-type.enum';
import {
  DynamicOptions,
  FormOption,
  type ElementTypeForField,
} from '@models/signal-form.model';

@Directive()
export abstract class BaseInputDirective<
  TFieldType extends FormFieldType,
  TValue,
  TFormConfig,
> {
  public hint = input<string>('');
  public disabled = input<boolean>(false);
  public config = input<TFormConfig | undefined>();
  public type = input<TFieldType>();
  public value = model.required<TValue | null>();
  public error = model<string | null>();
  public touched = model.required<boolean>();
  public dirty = model.required<boolean>();
  public name = input.required<string>();
  public options = input<FormOption[]>([]);
  public dynamicOptionsFn = input<DynamicOptions<object, keyof object>>();

  private initialValue = signal<TValue | null>(null);
  private hasCapturedInitial = signal(false);

  protected readonly injector = inject(Injector);

  constructor() {
    this.captureInitialValuesEffect();
  }

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
