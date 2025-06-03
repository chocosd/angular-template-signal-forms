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
import { FormFieldType } from '@enums/form-field-type.enum';
import {
  type RadioFieldConfig,
  type SelectFieldConfig,
} from '@models/signal-field-configs.model';
import {
  type ElementTypeForField,
  type FormOption,
  type SignalFormContainer,
  type SignalFormField,
} from '@models/signal-form.model';
import { FieldRoleAttributesService } from '@services/field-role-attributes.service';
import { ValueHelper } from '../helpers/value.helper';

/**
 * Signal-based form field directive that handles two-way data binding, validation,
 * and accessibility attributes for form elements
 *
 * @template TModel - The form model type
 * @template K - The field key type
 * @template TFieldType - The form field type enum
 */
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
  public signalModel = input.required<SignalFormField<TModel, K>>();

  private initialValue = signal<TModel[K] | null>(null);
  private hasCapturedInitial = signal(false);
  private roleAttributes = computed(() =>
    this.roleService.getAttributesForField(this.signalModel()),
  );

  private readonly elementRef = inject(
    ElementRef<ElementTypeForField<TFieldType>>,
  );
  private readonly renderer = inject(Renderer2);
  private readonly injector = inject(Injector);
  private readonly roleService = inject(FieldRoleAttributesService);

  private form = computed<SignalFormContainer<TModel> | null>(() =>
    this.signalModel().getForm(),
  );

  /**
   * Binds the field name as the element's name attribute
   * @returns The field name as a string
   */
  @HostBinding('attr.name')
  public get name(): string {
    return String(this.signalModel().name);
  }

  /**
   * Binds the field name as the element's id attribute
   * @returns The field name as a string
   */
  @HostBinding('attr.id')
  public get id(): string {
    const baseName = String(this.signalModel().name);

    // For radio buttons, we need unique IDs within the group
    if (this.elementRef.nativeElement.type === 'radio') {
      return this.generateUniqueRadioId(baseName);
    }

    return baseName;
  }

  /**
   * Generates a unique ID for radio buttons by checking existing IDs in the DOM
   */
  private generateUniqueRadioId(baseName: string): string {
    // Check if any other radio with the same name already exists
    const existingRadios = document.querySelectorAll(
      `input[name="${baseName}"]`,
    );
    const existingIds = Array.from(existingRadios).map((radio) => radio.id);

    // Generate ID with index
    let index = 0;
    let candidateId = `${baseName}_${index}`;

    while (existingIds.includes(candidateId)) {
      index++;
      candidateId = `${baseName}_${index}`;
    }

    return candidateId;
  }

  /**
   * Initializes the directive by setting up all reactive effects
   */
  constructor() {
    this.setupInitialValueEffect();
    this.setupFocusEffect();
    this.setupValueSyncEffect();
    this.setupAttributesEffect();
  }

  /**
   * Angular lifecycle hook that sets the initial element value
   */
  ngOnInit(): void {
    this.setInitialValue();
  }

  /**
   * Sets up effect to capture the initial field value for dirty state tracking
   */
  private setupInitialValueEffect(): void {
    effect(
      () => {
        if (!this.hasCapturedInitial() && this.signalModel().value()) {
          this.initialValue.set(this.signalModel().value());
          this.hasCapturedInitial.set(true);
        }
      },
      { injector: this.injector },
    );
  }

  /**
   * Sets up effect to handle focus highlighting behavior and auto-focus
   */
  private setupFocusEffect(): void {
    effect(
      () => {
        if (!this.signalModel().focus()) return;

        const native = this.elementRef.nativeElement;
        native.focus?.();
        this.renderer.addClass(native, 'form-error-highlight');

        setTimeout(() => {
          this.renderer.removeClass(native, 'form-error-highlight');
          this.signalModel().focus.set(false);
        }, 800);
      },
      { injector: this.injector },
    );
  }

  /**
   * Sets up effect to sync element value with model value changes
   */
  private setupValueSyncEffect(): void {
    effect(
      () => {
        const value = this.signalModel().value();
        this.setElementValue(this.elementRef.nativeElement, value);
      },
      { injector: this.injector },
    );
  }

  /**
   * Sets up effect to dynamically apply all field attributes (role, aria, input)
   */
  private setupAttributesEffect(): void {
    effect(
      () => {
        const attrs = this.roleAttributes();
        const el = this.elementRef.nativeElement;

        if (attrs.role) {
          this.renderer.setAttribute(el, 'role', attrs.role);
        }

        Object.entries(attrs.ariaAttributes).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            this.renderer.setAttribute(el, key, String(value));
            return;
          }

          this.renderer.removeAttribute(el, key);
        });

        Object.entries(attrs.inputAttributes).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            this.renderer.setAttribute(el, key, String(value));
            return;
          }

          this.renderer.removeAttribute(el, key);
        });

        const fieldValue = this.getFieldValue();

        if (fieldValue !== null) {
          this.renderer.setAttribute(el, 'value', fieldValue);
        }
      },
      { injector: this.injector },
    );
  }

  /**
   * Sets the initial element value from the field model
   */
  private setInitialValue(): void {
    this.setElementValue(
      this.elementRef.nativeElement,
      this.signalModel().value(),
    );
  }

  /**
   * Extracts the field value as a display string
   * @returns The field value formatted as a string, or null if no value
   */
  private getFieldValue(): string | null {
    const value = this.signalModel().value();
    return ValueHelper.extractValueString(value);
  }

  /**
   * Handles blur events by marking the field as touched
   */
  @HostListener('blur')
  onBlur(): void {
    this.signalModel().touched.set(true);
  }

  /**
   * Handles focus events by setting the focus state
   */
  @HostListener('focus')
  onFocus(): void {
    this.signalModel().focus.set(true);
  }

  /**
   * Handles input events by extracting, parsing and updating the field value
   * @param event - The input event from the form element
   */
  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const target = event.target as ElementTypeForField<TFieldType>;
    const raw = this.extractValue(target);
    const parsed = this.signalModel().parser?.(raw as string) ?? raw;

    this.signalModel().value.set(parsed as TModel[K]);

    const dirty =
      JSON.stringify(parsed) !== JSON.stringify(this.initialValue());
    this.signalModel().dirty.set(dirty);
    this.signalModel().touched.set(true);
  }

  /**
   * Extracts the raw value from different types of form elements
   * @param target - The form element to extract value from
   * @returns The extracted value based on element type
   */
  private extractValue(target: ElementTypeForField<TFieldType>): unknown {
    if (target instanceof HTMLInputElement) {
      const raw = target.value;

      switch (target.type) {
        case 'checkbox':
          return target.checked;
        case 'number':
        case 'range':
          const parsed = parseFloat(raw);
          return isNaN(parsed) ? 0 : parsed;
        case 'date':
          return target.valueAsDate;
        case 'radio':
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
          return raw;
      }
    }

    if (target instanceof HTMLSelectElement) {
      const raw = target.value;
      const field = this.signalModel();

      if (field.type === FormFieldType.SELECT) {
        if ('options' in field) {
          const foundOption = (
            field.options as unknown as Signal<FormOption[]>
          )().find((opt: FormOption) => String(opt.label) === raw);
          if (foundOption) {
            return foundOption.label;
          }
        }

        const config = field.config as SelectFieldConfig<TModel, keyof TModel>;
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

  /**
   * Sets the element value using appropriate method based on element type
   * @param element - The form element to set value on
   * @param value - The value to set
   */
  private setElementValue(
    element: ElementTypeForField<TFieldType>,
    value: unknown,
  ): void {
    if (ValueHelper.isCheckboxInput(element)) {
      this.setCheckboxValue(element, value as boolean);
      return;
    }

    if (ValueHelper.isDateInput(element) && ValueHelper.isDate(value)) {
      this.setDateValue(element, value);
      return;
    }

    if (ValueHelper.isNumberInput(element) && ValueHelper.isNumber(value)) {
      this.setNumberValue(element, value);
      return;
    }

    if (ValueHelper.isFormElement(element)) {
      this.setStandardValue(element, value);
      return;
    }

    if (ValueHelper.isComboboxDiv(element)) {
      this.setComboboxValue(element, value);
      return;
    }
  }

  /**
   * Sets the checked state of a checkbox input
   * @param element - The checkbox input element
   * @param value - The boolean value to set
   */
  private setCheckboxValue(element: HTMLInputElement, value: boolean): void {
    element.checked = value;
  }

  /**
   * Sets the date value of a date input
   * @param element - The date input element
   * @param value - The Date object to set
   */
  private setDateValue(element: HTMLInputElement, value: Date): void {
    element.valueAsDate = value;
  }

  /**
   * Sets the numeric value of a number input
   * @param element - The number input element
   * @param value - The number value to set
   */
  private setNumberValue(element: HTMLInputElement, value: number): void {
    element.valueAsNumber = value;
  }

  /**
   * Sets the string value of standard form elements
   * @param element - The form element (input, select, textarea)
   * @param value - The value to convert to string and set
   */
  private setStandardValue(
    element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
    value: unknown,
  ): void {
    element.value = ValueHelper.extractValueString(value);
  }

  /**
   * Sets accessibility attributes for custom combobox elements
   * @param element - The div element with combobox role
   * @param value - The value to set as aria-valuenow
   */
  private setComboboxValue(element: HTMLDivElement, value: unknown): void {
    const valueString = ValueHelper.extractValueString(value);

    if (valueString) {
      this.renderer.setAttribute(element, 'aria-valuenow', valueString);
      return;
    }

    this.renderer.removeAttribute(element, 'aria-valuenow');
  }
}
