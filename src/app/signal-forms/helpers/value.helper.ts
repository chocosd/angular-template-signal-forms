export class ValueHelper {
  static isNull(value: unknown): value is null | undefined {
    return value === null || value === undefined;
  }

  static isString(value: unknown): value is string {
    return typeof value === 'string';
  }

  static isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
  }

  static isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
  }

  static isDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }

  static isObject(value: unknown): value is object {
    return typeof value === 'object' && value !== null;
  }

  static hasValueProperty(
    value: unknown,
  ): value is { label: string; value: unknown } {
    return ValueHelper.isObject(value) && 'value' in value;
  }

  static isCheckboxInput(element: Element): element is HTMLInputElement {
    return element instanceof HTMLInputElement && element.type === 'checkbox';
  }

  static isDateInput(element: Element): element is HTMLInputElement {
    return element instanceof HTMLInputElement && element.type === 'date';
  }

  static isNumberInput(element: Element): element is HTMLInputElement {
    return element instanceof HTMLInputElement && element.type === 'number';
  }

  static isComboboxDiv(element: Element): element is HTMLDivElement {
    return (
      element instanceof HTMLDivElement &&
      element.getAttribute('role') === 'combobox'
    );
  }

  static isFormElement(
    element: Element,
  ): element is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
    return (
      element instanceof HTMLInputElement ||
      element instanceof HTMLSelectElement ||
      element instanceof HTMLTextAreaElement
    );
  }

  static extractValueString(value: unknown): string {
    if (ValueHelper.isNull(value)) {
      return '';
    }
    if (ValueHelper.isString(value)) {
      return value;
    }
    if (ValueHelper.isNumber(value) || ValueHelper.isBoolean(value))
      return String(value);

    if (ValueHelper.hasValueProperty(value)) {
      return String(value.label);
    }

    return String(value);
  }
}
