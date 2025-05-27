import {
  computed,
  Directive,
  effect,
  ElementRef,
  HostBinding,
  HostListener,
  inject,
  input,
  Renderer2,
  signal,
} from '@angular/core';
import {
  type SignalFormContainer,
  type SignalFormField,
} from '@models/signal-form.model';
import { MetaValidatorFn } from 'app/signal-forms/helpers/with-meta';

@Directive({
  selector: '[signalModel]',
  standalone: true,
})
export class SignalModelDirective<T = any, U = any> {
  private elementRef = inject(ElementRef<HTMLInputElement>);
  private renderer = inject(Renderer2);

  public signalModel = input<SignalFormField<U>>({} as SignalFormField<U>);
  public form = input.required<SignalFormContainer<T>>();

  private initialValue = signal<U | null>(null);
  private hasCapturedInitial = signal(false);

  @HostBinding('attr.name') get name() {
    return this.signalModel().name;
  }

  @HostBinding('id') get id() {
    return this.signalModel().name;
  }

  @HostBinding('attr.aria-describedby') get ariaDescribedBy() {
    const errId = this.signalModel().error()
      ? `error-${this.signalModel.name}`
      : null;
    const hintId = this.signalModel().config?.hint
      ? `hint-${this.signalModel.name}`
      : null;
    return [errId, hintId].filter(Boolean).join(' ') || null;
  }

  @HostBinding('attr.aria-invalid') get ariaInvalid() {
    return this.signalModel().error() ? 'true' : null;
  }

  @HostBinding('attr.aria-required') get ariaRequired() {
    return this.isRequired() ? 'true' : null;
  }

  @HostBinding('required') get required() {
    return this.isRequired();
  }

  @HostBinding('value') get boundValue() {
    const val = this.signalModel().value();
    return typeof val === 'string' ? val : JSON.stringify(val);
  }

  constructor() {
    this.captureInitialValue();
    this.watchFocus();
  }

  private isRequired = computed(() =>
    (this.signalModel().validators ?? []).some(
      (validator) => (validator as MetaValidatorFn<U, U>).__meta?.required,
    ),
  );

  private captureInitialValue(): void {
    effect(() => {
      if (!this.hasCapturedInitial() && this.signalModel().value()) {
        this.initialValue.set(this.signalModel().value() as U);
        this.hasCapturedInitial.set(true);
      }
    });
  }

  private watchFocus(): void {
    effect(() => {
      if (!this.signalModel().focus()) {
        return;
      }

      const native = this.elementRef.nativeElement;
      native.focus?.();
      this.renderer.addClass(native, 'form-error-highlight');

      setTimeout(() => {
        this.renderer.removeClass(native, 'form-error-highlight');
        this.signalModel().focus.set(false);
      }, 800);
    });
  }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const el = event.target as HTMLInputElement | HTMLTextAreaElement;
    const raw = el.value;
    const parsed = this.signalModel().parser?.(raw) ?? raw;

    this.signalModel().value.set(parsed as T);

    const dirty =
      JSON.stringify(parsed) !== JSON.stringify(this.initialValue());
    this.signalModel().dirty.set(dirty);
    this.signalModel().touched.set(true);
  }

  @HostListener('blur')
  onBlur() {
    this.signalModel().touched.set(true);
  }
}
