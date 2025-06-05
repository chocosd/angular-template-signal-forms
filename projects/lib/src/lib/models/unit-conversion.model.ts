/**
 * Unit conversion function type - converts value from one unit to target unit
 */
export type UnitConverter = (value: number, fromUnit: string) => number;

/**
 * Unit parsing function type - formats the value for display
 */
export type UnitParser = (value: number) => string;

/**
 * Configuration for a single unit in the conversion system
 */
export interface UnitConfig {
  /** Display label for the unit */
  label: string;

  /** Function to convert from any unit to this unit */
  convert: UnitConverter;

  /** Optional unit-specific parser that overrides field-level parser */
  parser?: UnitParser;
}

/**
 * Position of the unit dropdown relative to the input
 */
export type UnitPosition = 'prefix' | 'suffix';

/**
 * Complete unit conversion configuration for a number field
 */
export interface UnitConversionConfig {
  /** Map of unit keys to their configurations */
  unitConversions: Record<string, UnitConfig>;

  /** Default unit to use when field is first rendered */
  defaultUnit: string;

  /** Position of unit dropdown (prefix/suffix) */
  unitPosition: UnitPosition;

  /** Optional field-level parser - can be overridden by unit-specific parsers */
  parser?: UnitParser;

  /** Number of decimal places to round converted values to (default: 2) */
  precision?: number;
}

// Common conversion utilities
export class ConversionUtils {
  /**
   * Weight conversions (base unit: kg)
   */
  static weight = {
    kg: {
      label: 'Kilograms',
      convert: (value: number, fromUnit: string) => {
        switch (fromUnit) {
          case 'lbs':
            return value * 0.453592;
          case 'oz':
            return value * 0.0283495;
          case 'g':
            return value / 1000;
          case 'kg':
            return value;
          default:
            return value;
        }
      },
    },
    lbs: {
      label: 'Pounds',
      convert: (value: number, fromUnit: string) => {
        switch (fromUnit) {
          case 'kg':
            return value * 2.20462;
          case 'oz':
            return value / 16;
          case 'g':
            return value * 0.00220462;
          case 'lbs':
            return value;
          default:
            return value;
        }
      },
    },
    oz: {
      label: 'Ounces',
      convert: (value: number, fromUnit: string) => {
        switch (fromUnit) {
          case 'kg':
            return value * 35.274;
          case 'lbs':
            return value * 16;
          case 'g':
            return value * 0.035274;
          case 'oz':
            return value;
          default:
            return value;
        }
      },
    },
    g: {
      label: 'Grams',
      convert: (value: number, fromUnit: string) => {
        switch (fromUnit) {
          case 'kg':
            return value * 1000;
          case 'lbs':
            return value * 453.592;
          case 'oz':
            return value * 28.3495;
          case 'g':
            return value;
          default:
            return value;
        }
      },
    },
  };

  /**
   * Length conversions (base unit: m)
   */
  static length = {
    m: {
      label: 'Meters',
      convert: (value: number, fromUnit: string) => {
        switch (fromUnit) {
          case 'ft':
            return value * 0.3048;
          case 'in':
            return value * 0.0254;
          case 'cm':
            return value / 100;
          case 'mm':
            return value / 1000;
          case 'm':
            return value;
          default:
            return value;
        }
      },
    },
    ft: {
      label: 'Feet',
      convert: (value: number, fromUnit: string) => {
        switch (fromUnit) {
          case 'm':
            return value * 3.28084;
          case 'in':
            return value / 12;
          case 'cm':
            return value * 0.0328084;
          case 'mm':
            return value * 0.00328084;
          case 'ft':
            return value;
          default:
            return value;
        }
      },
    },
    in: {
      label: 'Inches',
      convert: (value: number, fromUnit: string) => {
        switch (fromUnit) {
          case 'm':
            return value * 39.3701;
          case 'ft':
            return value * 12;
          case 'cm':
            return value * 0.393701;
          case 'mm':
            return value * 0.0393701;
          case 'in':
            return value;
          default:
            return value;
        }
      },
    },
    cm: {
      label: 'Centimeters',
      convert: (value: number, fromUnit: string) => {
        switch (fromUnit) {
          case 'm':
            return value * 100;
          case 'ft':
            return value * 30.48;
          case 'in':
            return value * 2.54;
          case 'mm':
            return value / 10;
          case 'cm':
            return value;
          default:
            return value;
        }
      },
    },
    mm: {
      label: 'Millimeters',
      convert: (value: number, fromUnit: string) => {
        switch (fromUnit) {
          case 'm':
            return value * 1000;
          case 'ft':
            return value * 304.8;
          case 'in':
            return value * 25.4;
          case 'cm':
            return value * 10;
          case 'mm':
            return value;
          default:
            return value;
        }
      },
    },
  };

  /**
   * Temperature conversions (base unit: celsius)
   */
  static temperature = {
    celsius: {
      label: 'Celsius',
      convert: (value: number, fromUnit: string) => {
        switch (fromUnit) {
          case 'fahrenheit':
            return ((value - 32) * 5) / 9;
          case 'kelvin':
            return value - 273.15;
          case 'celsius':
            return value;
          default:
            return value;
        }
      },
    },
    fahrenheit: {
      label: 'Fahrenheit',
      convert: (value: number, fromUnit: string) => {
        switch (fromUnit) {
          case 'celsius':
            return (value * 9) / 5 + 32;
          case 'kelvin':
            return ((value - 273.15) * 9) / 5 + 32;
          case 'fahrenheit':
            return value;
          default:
            return value;
        }
      },
    },
    kelvin: {
      label: 'Kelvin',
      convert: (value: number, fromUnit: string) => {
        switch (fromUnit) {
          case 'celsius':
            return value + 273.15;
          case 'fahrenheit':
            return ((value - 32) * 5) / 9 + 273.15;
          case 'kelvin':
            return value;
          default:
            return value;
        }
      },
    },
  };

  /**
   * Common parsers for different number formats
   */
  static parsers = {
    currency: (value: number, locale = 'en-US', currency = 'USD') =>
      new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
        value,
      ),

    percentage: (value: number, locale = 'en-US') =>
      new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: 1,
      }).format(value / 100),

    decimal: (value: number, locale = 'en-US', fractionDigits = 2) =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }).format(value),

    integer: (value: number, locale = 'en-US') =>
      new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value),
  };
}
