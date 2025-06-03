import { Injectable } from '@angular/core';
import { type SignalFormField } from '@models/signal-form.model';
import { FormFieldType } from '../enums/form-field-type.enum';

export interface RoleAttributes {
  role?: string;
  ariaAttributes: Record<string, string | boolean | null>;
  inputAttributes: Record<string, string | boolean | null>;
}

@Injectable({
  providedIn: 'root',
})
export class FieldRoleAttributesService {
  getAttributesForField<
    TModel extends object,
    K extends keyof TModel = keyof TModel,
  >(field: SignalFormField<TModel, K>): RoleAttributes {
    const baseAttributes = this.getBaseAttributes(field);
    const roleAttributes = this.getRoleSpecificAttributes(field);
    const typeAttributes = this.getTypeSpecificAttributes(field);

    return {
      role: roleAttributes.role,
      ariaAttributes: {
        ...baseAttributes.ariaAttributes,
        ...roleAttributes.ariaAttributes,
        ...typeAttributes.ariaAttributes,
      },
      inputAttributes: {
        ...baseAttributes.inputAttributes,
        ...roleAttributes.inputAttributes,
        ...typeAttributes.inputAttributes,
      },
    };
  }

  private getBaseAttributes<TModel extends object, K extends keyof TModel>(
    field: SignalFormField<TModel, K>,
  ): RoleAttributes {
    const name = String(field.name);

    return {
      ariaAttributes: {
        'aria-invalid': field.error() ? 'true' : 'false',
        'aria-describedby': field.error() ? `${name}-error` : null,
      },
      inputAttributes: {
        disabled: field.isDisabled() ? true : null,
        placeholder: this.getPlaceholder(field),
      },
    };
  }

  /**
   * Generates intelligent default placeholders based on field type and name
   */
  private getPlaceholder<TModel extends object, K extends keyof TModel>(
    field: SignalFormField<TModel, K>,
  ): string | null {
    // If user provided a custom placeholder, use it
    if (field.config?.placeholder) {
      return field.config.placeholder;
    }

    // Generate smart defaults based on field type
    const fieldName = String(field.name);
    const label = field.label || fieldName;

    switch (field.type) {
      case FormFieldType.TEXT:
      case FormFieldType.PASSWORD:
      case FormFieldType.TEXTAREA:
      case FormFieldType.NUMBER:
        return `Type ${label.toLowerCase()} here`;

      case FormFieldType.SELECT:
      case FormFieldType.AUTOCOMPLETE:
        return `Select a ${label.toLowerCase()}`;

      case FormFieldType.MULTISELECT:
      case FormFieldType.CHIPLIST:
        return `Select ${label.toLowerCase()}`;

      case FormFieldType.DATETIME:
        return `Select ${label.toLowerCase()}`;

      case FormFieldType.FILE:
        return `Choose ${label.toLowerCase()} file`;

      case FormFieldType.COLOR:
        return `Pick a color for ${label.toLowerCase()}`;

      // These field types don't typically use placeholders
      case FormFieldType.CHECKBOX:
      case FormFieldType.CHECKBOX_GROUP:
      case FormFieldType.RADIO:
      case FormFieldType.SWITCH:
      case FormFieldType.SLIDER:
      case FormFieldType.RATING:
        return null;

      default:
        return `Enter ${label.toLowerCase()}`;
    }
  }

  private getRoleSpecificAttributes<
    TModel extends object,
    K extends keyof TModel,
  >(field: SignalFormField<TModel, K>): RoleAttributes {
    const name = String(field.name);
    switch (field.type) {
      case FormFieldType.SELECT:
      case FormFieldType.AUTOCOMPLETE:
        return {
          role: 'combobox',
          ariaAttributes: {
            'aria-owns': `${name}-listbox`,
            'aria-controls': `${name}-listbox`,
            'aria-haspopup': 'listbox',
          },
          inputAttributes: {},
        };

      case FormFieldType.CHECKBOX_GROUP:
        return {
          role: 'group',
          ariaAttributes: {
            'aria-labelledby': `${name}-legend`,
          },
          inputAttributes: {},
        };

      case FormFieldType.RADIO:
        return {
          role: 'radiogroup',
          ariaAttributes: {
            'aria-labelledby': `${name}-legend`,
          },
          inputAttributes: {},
        };

      case FormFieldType.SWITCH:
        const fieldValue = field.value();
        let ariaChecked: string | null = null;

        if (fieldValue === null || fieldValue === undefined) {
          ariaChecked = null;
        } else if (typeof fieldValue === 'boolean') {
          ariaChecked = fieldValue ? 'true' : 'false';
        } else if (fieldValue) {
          ariaChecked = String(fieldValue);
        } else {
          ariaChecked = String(fieldValue);
        }

        return {
          role: 'switch',
          ariaAttributes: {
            'aria-checked': ariaChecked,
          },
          inputAttributes: {
            checked: Boolean(fieldValue),
          },
        };

      case FormFieldType.SLIDER:
        const min = String(field.config?.min ?? 0);
        const max = String(field.config?.max ?? 100);
        const step = String(field.config?.step ?? 1);
        const value = String(field.value() ?? 0);

        return {
          role: 'slider',
          ariaAttributes: {
            'aria-valuemin': min,
            'aria-valuemax': max,
            'aria-valuenow': value,
          },
          inputAttributes: {
            min,
            max,
            step,
          },
        };

      case FormFieldType.RATING:
        return {
          role: 'radiogroup',
          ariaAttributes: {
            'aria-valuemin': '0',
            'aria-valuemax': field.config?.max?.toString() ?? '5',
            'aria-valuenow': field.value()?.toString() ?? '0',
            'aria-label': field.label,
            'aria-invalid': field.error() ? 'true' : 'false',
            'aria-describedby': field.error()
              ? `error-${String(field.name)}`
              : `hint-${String(field.name)}`,
          },
          inputAttributes: {},
        };

      case FormFieldType.FILE:
        const accept = Array.isArray(field.config?.accept)
          ? field.config.accept.join(',')
          : null;

        return {
          role: 'button',
          ariaAttributes: {
            'aria-label':
              field.config?.uploadText ?? 'Click or drag a file to upload',
          },
          inputAttributes: {
            accept,
          },
        };

      case FormFieldType.MULTISELECT:
        return {
          role: 'listbox',
          ariaAttributes: {
            'aria-label': field.label,
            'aria-multiselectable': 'true',
          },
          inputAttributes: {},
        };

      default:
        return {
          ariaAttributes: {},
          inputAttributes: {},
        };
    }
  }

  private getTypeSpecificAttributes<
    TModel extends object,
    K extends keyof TModel,
  >(field: SignalFormField<TModel, K>): RoleAttributes {
    switch (field.type) {
      case FormFieldType.PASSWORD:
        return {
          ariaAttributes: {
            'aria-label': `Password field for ${field.label}`,
          },
          inputAttributes: {
            autocomplete: 'current-password',
          },
        };

      case FormFieldType.COLOR:
        return {
          ariaAttributes: {
            'aria-label': `Color picker for ${field.label}`,
          },
          inputAttributes: {},
        };

      case FormFieldType.DATETIME:
        return {
          ariaAttributes: {},
          inputAttributes: {},
        };

      default:
        return {
          ariaAttributes: {},
          inputAttributes: {},
        };
    }
  }
}
