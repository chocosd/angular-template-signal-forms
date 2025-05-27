import {
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  Injector,
  OnInit,
  Renderer2,
  Signal,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  RadioFieldConfig,
  SelectFieldConfig,
} from '@models/signal-field-configs.model';
import { FormFieldType } from '../enums/form-field-type.enum';
import {
  ElementTypeForField,
  FormOption,
  SignalFormContainer,
  SignalFormField,
} from '../models/signal-form.model';
import { FieldRoleAttributesService } from '../services/field-role-attributes.service';

@Directive({
  selector: '[signalModel]',
  standalone: true,
})
export class SignalModelDirective<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
  TFieldType extends FormFieldType = FormFieldType,
> implements OnInit
{
  private readonly elementRef = inject(
    ElementRef<ElementTypeForField<TFieldType>>,
  );
  private readonly renderer = inject(Renderer2);
  private readonly injector = inject(Injector);
  private readonly roleService = inject(FieldRoleAttributesService);

  private initialValue = signal<TModel[K] | null>(null);
  private hasCapturedInitial = signal(false);

  public signalModel = input.required<SignalFormField<TModel, K>>();
  public form = input.required<SignalFormContainer<TModel>>();

  private roleAttributes = computed(() => {
    const attrs = this.roleService.getAttributesForField(this.signalModel());
    console.log('Role attributes in directive:', {
      field: this.signalModel(),
      attrs,
    });
    return attrs;
  });

  @HostBinding('attr.role') get role() {
    return this.roleAttributes().role;
  }

  @HostBinding('attr.aria-invalid')
  get ariaInvalid(): boolean {
    return !!this.signalModel().error();
  }

  @HostBinding('attr.aria-describedby')
  get ariaDescribedBy(): string | null {
    const errId = this.signalModel().error()
      ? `error-${String(this.signalModel().name)}`
      : null;
    const hintId = this.signalModel().config?.hint
      ? `hint-${String(this.signalModel().name)}`
      : null;
    return [errId, hintId].filter(Boolean).join(' ') || null;
  }

  @HostBinding('attr.aria-required')
  get ariaRequired(): boolean {
    return (
      this.signalModel().validators?.some(
        (validator) => (validator as any).__meta?.required,
      ) ?? false
    );
  }

  @HostBinding('required')
  get required(): boolean {
    return this.ariaRequired;
  }

  @HostBinding('disabled')
  get isDisabled(): boolean {
    return this.signalModel().isDisabled() ?? false;
  }

  @HostBinding('attr.id')
  get fieldId(): string {
    return String(this.signalModel().name);
  }

  @HostBinding('attr.name')
  get fieldName(): string {
    return String(this.signalModel().name);
  }

  @HostBinding('value')
  get fieldValue(): string {
    const val = this.signalModel().value();
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && 'value' in val) return String(val.value);
    return String(val);
  }

  constructor() {
    this.captureInitialValue();
    this.watchFocus();
  }

  ngOnInit(): void {
    // Set initial value
    const element = this.elementRef.nativeElement;
    this.setElementValue(element, this.signalModel().value());

    // Apply initial role attributes
    const attrs = this.roleService.getAttributesForField(this.signalModel());

    // Apply role
    if (attrs.role) {
      this.renderer.setAttribute(element, 'role', attrs.role);
    }

    // Apply all aria attributes
    Object.entries(attrs.ariaAttributes).forEach(([key, value]) => {
      if (value !== null) {
        this.renderer.setAttribute(element, key, String(value));
      }
    });

    // Apply all input attributes
    Object.entries(attrs.inputAttributes).forEach(([key, value]) => {
      if (value !== null) {
        this.renderer.setAttribute(element, key, String(value));
      }
    });

    // Subscribe to value changes
    effect(
      () => {
        const value = this.signalModel().value();
        this.setElementValue(this.elementRef.nativeElement, value);
      },
      {
        injector: this.injector,
      },
    );

    // Watch for changes in dynamic attributes
    this.watchDynamicAttributes();
  }

  private captureInitialValue(): void {
    effect(
      () => {
        if (!this.hasCapturedInitial() && this.signalModel().value()) {
          this.initialValue.set(this.signalModel().value());
          this.hasCapturedInitial.set(true);
        }
      },
      {
        injector: this.injector,
      },
    );
  }

  private watchFocus(): void {
    effect(
      () => {
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
      },
      {
        injector: this.injector,
      },
    );
  }

  @HostListener('blur')
  onBlur(): void {
    this.signalModel().touched.set(true);
  }

  @HostListener('focus')
  onFocus(): void {
    this.signalModel().focus.set(true);
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const target = event.target as ElementTypeForField<TFieldType>;
    const raw = this.extractValue(target);
    const parsed = this.signalModel().parser?.(raw) ?? raw;

    this.signalModel().value.set(parsed);

    const dirty =
      JSON.stringify(parsed) !== JSON.stringify(this.initialValue());
    this.signalModel().dirty.set(dirty);
    this.signalModel().touched.set(true);
  }

  private extractValue(target: ElementTypeForField<TFieldType>): any {
    if (target instanceof HTMLInputElement) {
      const raw = target.value;

      switch (target.type) {
        case 'checkbox':
          return target.checked;
        case 'number':
          const parsed = parseFloat(raw);
          return isNaN(parsed) ? 0 : parsed;
        case 'date':
          return target.valueAsDate;
        case 'radio':
          // For radio buttons, we might need to parse the value if it's meant to be a number/boolean
          if (this.signalModel().type === FormFieldType.RADIO) {
            const config = this.signalModel().config as RadioFieldConfig<
              TModel,
              keyof TModel
            >;
            if (config?.valueType === 'number') {
              return parseFloat(raw);
            }
            if (config?.valueType === 'boolean') {
              return raw === 'true';
            }
          }
          return raw;
        default:
          // For masked inputs, use the parser if available
          if (
            this.signalModel().type === FormFieldType.MASKED &&
            this.signalModel().parser
          ) {
            return this.signalModel().parser!(raw);
          }
          return raw;
      }
    }

    if (target instanceof HTMLSelectElement) {
      const raw = target.value;
      const field = this.signalModel();

      if (field.type === FormFieldType.SELECT && 'options' in field) {
        const foundOption = (
          field.options as unknown as Signal<FormOption[]>
        )().find((opt: FormOption) => String(opt.value) === raw);
        if (foundOption) {
          return foundOption.value;
        }
      }

      // For select fields, we might need to parse the value
      if (this.signalModel().type === FormFieldType.SELECT) {
        const config = this.signalModel().config as SelectFieldConfig<
          TModel,
          keyof TModel
        >;
        if (config?.valueType === 'number') {
          return parseFloat(raw);
        }
        if (config?.valueType === 'boolean') {
          return raw === 'true';
        }
      }
      return raw;
    }

    if (target instanceof HTMLTextAreaElement) {
      return target.value;
    }

    return null;
  }

  private setElementValue(
    element: ElementTypeForField<TFieldType>,
    value: any,
  ): void {
    if (element instanceof HTMLInputElement) {
      if (element.type === 'checkbox') {
        element.checked = value;
      } else if (element.type === 'date' && value instanceof Date) {
        element.valueAsDate = value;
      } else if (element.type === 'number' && typeof value === 'number') {
        element.valueAsNumber = value;
      } else {
        element.value = value?.toString() ?? '';
      }
    } else if (
      element instanceof HTMLSelectElement ||
      element instanceof HTMLTextAreaElement
    ) {
      element.value = value?.toString() ?? '';
    }
  }

  private watchDynamicAttributes(): void {
    effect(
      () => {
        const attrs = this.roleAttributes();
        const el = this.elementRef.nativeElement;

        // Only update dynamic attributes that can change
        const dynamicAttrs = {
          'aria-invalid': attrs.ariaAttributes['aria-invalid'],
          'aria-describedby': attrs.ariaAttributes['aria-describedby'],
          'aria-required': this.ariaRequired ? 'true' : null,
          disabled: attrs.inputAttributes['disabled'],
          value: this.fieldValue,
        };

        Object.entries(dynamicAttrs).forEach(([key, value]) => {
          if (value !== null) {
            this.renderer.setAttribute(el, key, String(value));
          } else {
            this.renderer.removeAttribute(el, key);
          }
        });
      },
      {
        injector: this.injector,
      },
    );
  }
}
