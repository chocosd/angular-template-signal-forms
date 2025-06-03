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
  ViewEncapsulation,
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

/**
 * Signal Form Input Item Component
 *
 * Renders individual form fields with support for custom styling, validation,
 * and various field types. This component handles the wrapper, label, input,
 * error messages, and hint text for each field.
 *
 * Features:
 * - Custom styling via modifierClass, stylesFn, and inlineStylesFn
 * - Dynamic validation state styling
 * - Part-specific styling (wrapper, label, input, error, hint)
 * - Reactive computed values
 * - Focus management and error highlighting
 * - ViewEncapsulation.None for external styling support
 *
 * @template TModel - The type of the form model this field belongs to
 */
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
  encapsulation: ViewEncapsulation.None,
})
export class SignalFormInputItemComponent<TModel> {
  /** The field configuration and state for this input item */
  public field = input.required<SignalFormField<TModel>>();

  /** The parent form container that this field belongs to */
  public form = input.required<SignalFormContainer<TModel>>();

  /** Optional index for repeatable fields (used in field naming) */
  public index = input<number | null>();

  /** Form field type constants for template use */
  protected readonly FormFieldType = FormFieldType;

  /** Tracks whether the component has been initialized with computed values */
  private initialized = signal(false);

  /** Service for handling field validation */
  private validationService = inject(ValidationService);

  /**
   * Computed name for the field, including index if applicable
   * Used for HTML id, for attributes, and accessibility
   */
  protected name = computed(() => {
    if (typeof this.index() === 'number') {
      return `${String(this.field().name)}-${this.index()}`;
    }
    return `${String(this.field().name)}`;
  });

  /**
   * Grid area binding for CSS Grid layouts
   * Uses the field name as the grid area identifier
   */
  @HostBinding('style.gridArea')
  get gridArea(): string | null {
    return this.field()?.name?.toString() ?? null;
  }

  /**
   * Host class binding that applies wrapper-level styling
   * Combines static modifier classes and dynamic styling functions
   */
  @HostBinding('class')
  get hostClasses(): string {
    return this.computeWrapperClasses();
  }

  /**
   * Host style binding that applies wrapper-level inline styles
   * Uses the inlineStylesFn to generate dynamic styles
   */
  @HostBinding('style')
  get hostStyles(): { [key: string]: string } {
    return this.computeWrapperStyles();
  }

  /**
   * Computes CSS classes for the field wrapper element
   * Handles static modifierClass and dynamic stylesFn results
   *
   * @returns Space-separated string of CSS classes
   * @private
   */
  private computeWrapperClasses(): string {
    const classes: string[] = [];
    const field = this.field();
    const styling = field.styling;

    if (!styling) {
      return '';
    }

    if (styling.modifierClass) {
      classes.push(...styling.modifierClass);
    }

    if (!styling.stylesFn) {
      return classes.join(' ');
    }

    const result = styling.stylesFn(field, this.form());

    if (typeof result === 'string') {
      classes.push(result);
      return classes.join(' ');
    }

    if (Array.isArray(result)) {
      classes.push(...result);
      return classes.join(' ');
    }

    if (result && typeof result === 'object') {
      const wrapperClasses = result.wrapper;
      if (typeof wrapperClasses === 'string') {
        classes.push(wrapperClasses);
      } else if (Array.isArray(wrapperClasses)) {
        classes.push(...wrapperClasses);
      }
    }

    return classes.join(' ');
  }

  /**
   * Computes inline styles for the field wrapper element
   *
   * @returns Object containing CSS property-value pairs
   * @private
   */
  private computeWrapperStyles(): { [key: string]: string } {
    const field = this.field();
    const styling = field.styling;

    if (!styling?.inlineStylesFn) {
      return {};
    }

    const result = styling.inlineStylesFn(field, this.form());
    return result.wrapper || {};
  }

  /**
   * Extracts CSS classes for specific field parts (label, input, error, hint)
   *
   * @param part - The field part to get classes for
   * @returns Space-separated string of CSS classes for the specified part
   * @private
   */
  private getPartClasses(part: 'label' | 'input' | 'error' | 'hint'): string {
    const styling = this.field().styling;

    if (!styling?.stylesFn) {
      return '';
    }

    const result = styling.stylesFn(this.field(), this.form());

    if (!result || typeof result !== 'object' || Array.isArray(result)) {
      return '';
    }

    const partClasses = result[part];

    if (typeof partClasses === 'string') {
      return partClasses;
    }

    if (Array.isArray(partClasses)) {
      return partClasses.join(' ');
    }

    return '';
  }

  /**
   * Extracts inline styles for specific field parts (label, input, error, hint)
   *
   * @param part - The field part to get styles for
   * @returns Object containing CSS property-value pairs for the specified part
   * @private
   */
  private getPartStyles(part: 'label' | 'input' | 'error' | 'hint'): {
    [key: string]: string;
  } {
    const styling = this.field().styling;

    if (!styling?.inlineStylesFn) {
      return {};
    }

    const result = styling.inlineStylesFn(this.field(), this.form());
    return result[part] || {};
  }

  /** Computed CSS classes for the field label */
  protected labelClasses = computed(() => this.getPartClasses('label'));

  /** Computed CSS classes for the field input wrapper */
  protected inputClasses = computed(() => this.getPartClasses('input'));

  /** Computed CSS classes for the field error message */
  protected errorClasses = computed(() => this.getPartClasses('error'));

  /** Computed CSS classes for the field hint text */
  protected hintClasses = computed(() => this.getPartClasses('hint'));

  /** Computed inline styles for the field label */
  protected labelStyles = computed(() => this.getPartStyles('label'));

  /** Computed inline styles for the field input wrapper */
  protected inputStyles = computed(() => this.getPartStyles('input'));

  /** Computed inline styles for the field error message */
  protected errorStyles = computed(() => this.getPartStyles('error'));

  /** Computed inline styles for the field hint text */
  protected hintStyles = computed(() => this.getPartStyles('hint'));

  /**
   * Component constructor
   * Initializes all reactive effects for computed values, validation, and focus management
   *
   * @param renderer - Angular Renderer2 for DOM manipulation
   * @param host - Reference to the component's host element
   * @param injector - Angular injector for effect contexts
   */
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

  /**
   * Determines if the field is required based on its validators
   *
   * @returns True if the field has required validators
   * @protected
   */
  protected isRequired(): boolean {
    return isRequired({ validators: this.field().validators });
  }

  /**
   * Computed property that returns the combined error message for the field
   * Combines synchronous and asynchronous validation errors
   */
  protected hasError = computed(() => {
    const field = this.field();
    return this.validationService.getCombinedError(field);
  });

  /**
   * Computed property that determines if the field is currently validating
   * Checks for async validation in progress
   */
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

  /**
   * Placeholder for form options initialization
   * Reserved for future functionality
   *
   * @private
   */
  private initializeFormOptionsEffect(): void {}

  /**
   * Effect that initializes computed field values on component setup
   * Runs once when the component first loads if the field has a computedValue function
   *
   * @private
   */
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

  /**
   * Effect that watches for changes to computed field values
   * Updates the field value when the computed value function result changes
   *
   * @private
   */
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

  /**
   * Effect that sets up validation for the field
   * Configures validation triggers, debouncing, and async validation
   *
   * @private
   */
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

  /**
   * Effect that handles field focus behavior
   * Scrolls to and highlights fields when focus is requested,
   * typically when navigating to validation errors
   *
   * @private
   */
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

  /**
   * Computed property that determines if the field should be hidden
   * Supports both boolean and function-based hidden conditions
   */
  protected isHidden = computed<boolean>(() => {
    const { hidden } = this.field();
    return typeof hidden === 'function' ? hidden(this.form()) : !!hidden;
  });

  /**
   * Computed property that determines if the field should be disabled
   * Supports both boolean and function-based disabled conditions
   */
  protected isDisabled = computed<boolean>(() => {
    const { disabled } = this.field();
    return typeof disabled === 'function' ? disabled(this.form()) : !!disabled;
  });

  /**
   * Sets the field value with proper type handling
   * Handles different value types (string, number, boolean, Date, object)
   * and updates the field's touched and dirty states
   *
   * @param value - The value to set on the field
   * @param markTouched - Whether to mark the field as touched and dirty (default: true)
   * @private
   */
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
