import { FormBuilder } from '@builder/builder/form-builder';
import { FormFieldType } from '../app/signal-forms/enums/form-field-type.enum';

/**
 * Example: Basic Custom Styling
 * Shows how to use modifierClass for simple static styling
 */
export const basicStylingExample = () => {
  return FormBuilder.createForm({
    model: {
      firstName: '',
      email: '',
      priority: 'normal',
    },
    fields: [
      {
        name: 'firstName',
        type: FormFieldType.TEXT,
        label: 'First Name',
        styling: {
          modifierClass: ['premium-field'], // Will be styled via global CSS
        },
      },
      {
        name: 'email',
        type: FormFieldType.TEXT,
        label: 'Email Address',
        styling: {
          modifierClass: ['highlighted-field', 'compact-field'],
        },
      },
    ],
  });
};

/**
 * Example: Dynamic State-Based Styling
 * Shows how to use stylesFn for reactive styling
 */
export const dynamicStylingExample = () => {
  return FormBuilder.createForm({
    model: {
      status: 'pending',
      progress: 0,
      isUrgent: false,
    },
    fields: [
      {
        name: 'status',
        type: FormFieldType.SELECT,
        label: 'Status',
        options: [
          { label: 'Pending', value: 'pending' },
          { label: 'In Progress', value: 'progress' },
          { label: 'Completed', value: 'completed' },
          { label: 'Urgent', value: 'urgent' },
        ],
        styling: {
          stylesFn: (field) => {
            const status = field.value();

            switch (status) {
              case 'urgent':
                return {
                  wrapper: ['status-urgent', 'pulse-animation'],
                  label: 'label-prominent',
                  error: 'error-prominent',
                };
              case 'completed':
                return {
                  wrapper: 'status-completed',
                  label: 'label-subtle',
                };
              default:
                return `status-${status}`;
            }
          },
        },
      },
      {
        name: 'progress',
        type: FormFieldType.NUMBER,
        label: 'Progress %',
        styling: {
          inlineStylesFn: (field) => {
            const progress = parseInt(field.value() as string, 10) || 0;
            const hue = Math.min(progress * 1.2, 120);

            return {
              wrapper: {
                borderLeft: `4px solid hsl(${hue}, 70%, 50%)`,
                background: `linear-gradient(90deg, hsla(${hue}, 70%, 95%, 0.5) ${progress}%, transparent ${progress}%)`,
              },
              label: {
                color: progress > 80 ? '#059669' : '#6b7280',
                fontWeight: progress > 50 ? '600' : '400',
              },
            };
          },
        },
      },
    ],
  });
};

/**
 * Example: Complex Validation-Based Styling
 * Shows how to style based on validation state
 */
export const validationStylingExample = () => {
  return FormBuilder.createForm({
    model: {
      phone: '',
      email: '',
      password: '',
    },
    fields: [
      {
        name: 'phone',
        type: FormFieldType.TEXT,
        label: 'Phone Number',
        validators: [
          (value: string) => {
            if (!value) return 'Phone is required';
            if (!/^\d{11}$/.test(value)) return 'Phone must be 11 digits';
            return null;
          },
        ],
        styling: {
          stylesFn: (field, form) => {
            const hasError = !!field.error();
            const isValidating = field.validating?.();
            const hasValue = !!field.value();

            return {
              wrapper: [
                hasError ? 'field-error' : '',
                isValidating ? 'field-validating' : '',
                hasValue && !hasError ? 'field-success' : '',
              ].filter(Boolean),
              label: hasError ? 'label-error' : hasValue ? 'label-filled' : '',
              input: [
                'phone-input',
                hasError ? 'input-error' : '',
                hasValue ? 'input-filled' : '',
              ].filter(Boolean),
              error: hasError ? 'error-bounce' : '',
              hint: hasError ? 'hint-hidden' : 'hint-visible',
            };
          },
        },
      },
    ],
  });
};

/**
 * Example: Theme-Based Styling
 * Shows how to create consistent theming
 */
export const themeStylingExample = () => {
  return FormBuilder.createForm({
    model: {
      theme: 'light',
      accentColor: '#3b82f6',
    },
    fields: [
      {
        name: 'theme',
        type: FormFieldType.RADIO,
        label: 'Theme Preference',
        options: [
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
          { label: 'Auto', value: 'auto' },
        ],
        styling: {
          stylesFn: (field, form) => ({
            wrapper: `theme-${field.value()}`,
            label: `theme-${field.value()}-label`,
          }),
          inlineStylesFn: (field, form) => {
            const themes = {
              light: {
                backgroundColor: '#ffffff',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
              },
              dark: {
                backgroundColor: '#1f2937',
                color: '#f9fafb',
                border: '1px solid #374151',
              },
              auto: {
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
              },
            };

            const selectedTheme = field.value() as keyof typeof themes;
            const themeStyles = themes[selectedTheme] || themes.auto;

            return {
              wrapper: {
                ...themeStyles,
                padding: '1rem',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
              },
            };
          },
        },
      },
    ],
  });
};

/**
 * CSS to add to your global styles.scss for the examples above
 */
export const exampleGlobalCSS = `
/* Add this to your src/styles.scss */

signal-form-input-item {
  /* Premium field styling */
  .form-control.premium-field {
    border: 2px solid var(--premium-color, #8b5cf6);
    background: var(--premium-bg, linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%));
    border-radius: var(--premium-radius, 8px);
    box-shadow: 0 4px 6px rgba(139, 92, 246, 0.1);

    .form-label {
      color: #8b5cf6;
      font-weight: 600;
    }
  }

  /* Status-based styling */
  .form-control.status-urgent {
    animation: pulse 2s infinite;
    border-color: #dc2626;
    background: rgba(220, 38, 38, 0.1);
  }

  .form-control.status-completed {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.1);
  }

  .form-control.status-pending {
    border-color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
  }

  /* Validation state styling */
  .form-control.field-error {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.05);

    .form-error {
      font-weight: 600;
      animation: shake 0.3s ease-in-out;
    }
  }

  .form-control.field-success {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.05);
  }

  .form-control.field-validating {
    border-color: #f59e0b;
    background: rgba(245, 158, 11, 0.05);
  }

  /* Theme styling */
  .form-control.theme-dark {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  }

  .form-control.theme-light {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* CSS Custom Properties for theming */
:root {
  --premium-color: #8b5cf6;
  --premium-bg: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  --premium-radius: 8px;
}
`;
