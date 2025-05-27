import { Injectable } from '@angular/core';
import { FormFieldType } from '../enums/form-field-type.enum';
import { SignalFormField } from '../models/signal-form.model';

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
        id: name,
        name,
        disabled: field.isDisabled(),
        placeholder: field.config?.placeholder ?? null,
      },
    };
  }

  private getRoleSpecificAttributes<
    TModel extends object,
    K extends keyof TModel,
  >(field: SignalFormField<TModel, K>): RoleAttributes {
    const name = String(field.name);
    switch (field.type) {
      case FormFieldType.SELECT:
      case FormFieldType.MULTISELECT:
      case FormFieldType.AUTOCOMPLETE:
        console.log('Getting attributes for', field.type, {
          name,
          field,
          attributes: {
            role: 'combobox',
            ariaAttributes: {
              'aria-owns': `${name}-listbox`,
              'aria-controls': `${name}-listbox`,
              'aria-haspopup': 'listbox',
            },
            inputAttributes: {},
          },
        });
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
        return {
          role: 'switch',
          ariaAttributes: {
            'aria-checked': field.value() ? 'true' : 'false',
          },
          inputAttributes: {
            checked: Boolean(field.value()),
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
            'aria-orientation': 'horizontal',
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
      case FormFieldType.MASKED:
        return {
          ariaAttributes: {},
          inputAttributes: {
            inputmode: field.config?.numericOnly ? 'numeric' : 'text',
          },
        };

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
