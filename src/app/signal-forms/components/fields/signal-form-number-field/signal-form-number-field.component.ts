import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit,
  signal,
} from '@angular/core';
import { BaseInputDirective } from '@base/base-input/base-input.directive';
import { type RuntimeNumberSignalField } from '@models/signal-field-types.model';
import { SignalModelDirective } from '../../../directives/signal-model.directive';
import { NumberInputType } from '../../../enums/number-input-type.enum';
import { type UnitConversionConfig } from '../../../models/unit-conversion.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'signal-form-number-field',
  standalone: true,
  imports: [SignalModelDirective, CommonModule],
  templateUrl: './signal-form-number-field.component.html',
  styleUrl: './signal-form-number-field.component.scss',
})
export class SignalFormNumberFieldComponent<
    TModel extends object,
    K extends keyof TModel = keyof TModel,
  >
  extends BaseInputDirective<RuntimeNumberSignalField<TModel, K>, TModel, K>
  implements OnInit
{
  protected readonly NumberInputType = NumberInputType;
  protected readonly currentUnit = signal<string>('');
  protected readonly isEditing = signal<boolean>(false);

  protected readonly inputType = computed(
    () => this.field().config?.inputType ?? NumberInputType.STANDARD,
  );

  protected readonly hasUnitConversion = computed(
    () =>
      this.inputType() === NumberInputType.UNIT_CONVERSION &&
      !!this.field().config?.unitConversions,
  );

  protected readonly unitConfig = computed(
    (): UnitConversionConfig | null =>
      this.field().config?.unitConversions ?? null,
  );

  protected readonly availableUnits = computed(() => {
    const config = this.unitConfig();
    return config
      ? Object.keys(config.unitConversions).map((key) => ({
          key,
          ...config.unitConversions[key],
        }))
      : [];
  });

  protected readonly unitPosition = computed(
    () => this.unitConfig()?.unitPosition ?? 'suffix',
  );

  protected readonly inputStep = computed(() => {
    const config = this.field().config;
    if (config?.step !== undefined) return config.step;

    switch (this.inputType()) {
      case NumberInputType.CURRENCY:
        return 0.01;
      case NumberInputType.PERCENTAGE:
        return 0.1;
      case NumberInputType.INTEGER:
        return 1;
      default:
        return 'any';
    }
  });

  protected readonly inputMin = computed(() => this.field().config?.min);
  protected readonly inputMax = computed(() => this.field().config?.max);

  protected readonly formattedValue = computed(() => {
    const value = this.field().value();
    if (value === null || value === undefined || isNaN(value)) return '';

    const config = this.field().config;
    const inputType = this.inputType();
    const locale = config?.locale ?? 'en-US';

    // Check for unit-specific parser first
    if (this.hasUnitConversion()) {
      const unitConfig = this.unitConfig();
      const currentUnitKey = this.currentUnit();
      const unitData = unitConfig?.unitConversions[currentUnitKey];
      if (unitData?.parser) {
        return unitData.parser(value);
      }
    }

    // Check for field-level custom parser
    if (config?.parser) {
      return config.parser(value);
    }

    // Apply built-in formatting based on inputType
    switch (inputType) {
      case NumberInputType.CURRENCY:
        const currencyCode = config?.currencyCode ?? 'USD';
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currencyCode,
        }).format(value);

      case NumberInputType.PERCENTAGE:
        return new Intl.NumberFormat(locale, {
          style: 'percent',
          minimumFractionDigits: 1,
        }).format(value / 100);

      case NumberInputType.DECIMAL:
        const fractionDigits = config?.decimalPlaces ?? 2;
        return new Intl.NumberFormat(locale, {
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
        }).format(value);

      case NumberInputType.INTEGER:
        return new Intl.NumberFormat(locale, {
          maximumFractionDigits: 0,
        }).format(value);

      default:
        return value.toString();
    }
  });

  protected readonly showFormattedValue = computed(() => {
    return (
      this.inputType() !== NumberInputType.STANDARD &&
      !this.isEditing() &&
      !!this.field().value() &&
      this.field().value() !== 0
    );
  });

  protected readonly rawValue = computed(() => {
    const value = this.field().value();
    return value?.toString() ?? '';
  });

  protected onFocusFormattedDisplay(): void {
    // Switch to raw input mode
    this.isEditing.set(true);

    // Use setTimeout to ensure the input is rendered before focusing
    setTimeout(() => {
      const input = document.querySelector(
        '.form-input[type="number"]',
      ) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select(); // Select all text for easy editing
      }
    }, 0);
  }

  protected onBlurRawInput(): void {
    // Switch back to formatted display mode with a small delay
    // to prevent immediate blur when switching elements
    setTimeout(() => {
      this.isEditing.set(false);
    }, 100);
  }

  public ngOnInit() {
    // Initialize unit for unit conversion fields
    if (this.hasUnitConversion()) {
      const defaultUnit = this.unitConfig()?.defaultUnit;
      if (defaultUnit) {
        this.currentUnit.set(defaultUnit);
      }
    }
  }

  protected onUnitChange(newUnit: string): void {
    if (!this.hasUnitConversion()) return;

    const currentValue = this.field().value();
    if (
      currentValue === null ||
      currentValue === undefined ||
      isNaN(currentValue)
    ) {
      this.currentUnit.set(newUnit);
      return;
    }

    const unitConfig = this.unitConfig();
    if (!unitConfig) return;

    const oldUnit = this.currentUnit();
    const newUnitConverter = unitConfig.unitConversions[newUnit]?.convert;

    if (newUnitConverter && oldUnit !== newUnit) {
      const convertedValue = newUnitConverter(currentValue, oldUnit);

      // Apply precision rounding if specified
      const precision = unitConfig.precision ?? 2;
      const roundedValue =
        Math.round(convertedValue * Math.pow(10, precision)) /
        Math.pow(10, precision);

      this.field().value.set(roundedValue);
      this.currentUnit.set(newUnit);
    }
  }

  protected extractValue(el: HTMLInputElement): number {
    const raw = el.value;
    const parsed = parseFloat(raw);
    return isNaN(parsed) ? 0 : parsed;
  }
}
