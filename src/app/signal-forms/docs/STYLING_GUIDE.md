# Signal Forms Field Styling Guide

The Signal Forms system provides flexible styling options for maximum control over field appearance. You can apply styles through static classes, dynamic functions, and target specific parts of each field.

## Styling Configuration

Each field can include a `styling` property with the following options:

```typescript
interface FieldStylingConfig<TModel> {
  // Static CSS classes applied to the field wrapper
  modifierClass?: string[];

  // Dynamic function for CSS classes and inline styles
  stylesFn?: (
    field,
    form,
  ) =>
    | string
    | string[]
    | {
        wrapper?: string | string[];
        label?: string | string[];
        input?: string | string[];
        error?: string | string[];
        hint?: string | string[];
      };

  // Dynamic function for inline styles
  inlineStylesFn?: (
    field,
    form,
  ) => {
    wrapper?: { [key: string]: string };
    label?: { [key: string]: string };
    input?: { [key: string]: string };
    error?: { [key: string]: string };
    hint?: { [key: string]: string };
  };
}
```

## Basic Examples

### 1. Static CSS Classes

```typescript
{
  name: 'email',
  type: FormFieldType.TEXT,
  label: 'Email Address',
  styling: {
    modifierClass: ['premium-field', 'highlight-border']
  }
}
```

### 2. Dynamic CSS Classes Based on Form State

```typescript
{
  name: 'priority',
  type: FormFieldType.SELECT,
  label: 'Priority Level',
  styling: {
    stylesFn: (field, form) => {
      const value = field.value();
      return value === 'high' ? ['priority-high', 'urgent'] : ['priority-normal'];
    }
  }
}
```

### 3. Part-Specific Styling

```typescript
{
  name: 'description',
  type: FormFieldType.TEXTAREA,
  label: 'Description',
  styling: {
    stylesFn: (field, form) => ({
      wrapper: ['textarea-wrapper', 'expanded'],
      label: field.value() ? 'label-active' : 'label-inactive',
      input: ['custom-textarea', 'auto-resize'],
      error: 'error-prominent',
      hint: 'hint-subtle'
    })
  }
}
```

### 4. Dynamic Inline Styles

```typescript
{
  name: 'progress',
  type: FormFieldType.NUMBER,
  label: 'Progress %',
  styling: {
    inlineStylesFn: (field, form) => {
      const progress = field.value() || 0;
      return {
        wrapper: {
          borderLeft: `4px solid hsl(${progress * 1.2}, 70%, 50%)`,
          background: `linear-gradient(90deg, rgba(34,197,94,0.1) ${progress}%, transparent ${progress}%)`
        },
        label: {
          color: progress > 80 ? '#059669' : '#6b7280',
          fontWeight: progress > 50 ? '600' : '400'
        }
      };
    }
  }
}
```

## Advanced Examples

### 1. Conditional Field Highlighting

```typescript
{
  name: 'amount',
  type: FormFieldType.NUMBER,
  label: 'Amount',
  styling: {
    stylesFn: (field, form) => {
      const amount = field.value() || 0;
      const budget = form.getValue().budget || 0;

      if (amount > budget) {
        return {
          wrapper: ['over-budget', 'warning'],
          label: 'label-warning',
          input: 'input-warning',
          error: 'error-critical'
        };
      }

      if (amount > budget * 0.8) {
        return {
          wrapper: 'approaching-budget',
          label: 'label-caution'
        };
      }

      return 'normal-budget';
    }
  }
}
```

### 2. Form Step Progress Styling

```typescript
{
  name: 'currentStep',
  type: FormFieldType.SELECT,
  label: 'Current Step',
  styling: {
    stylesFn: (field, form) => {
      const steps = ['basic', 'details', 'review', 'complete'];
      const currentIndex = steps.indexOf(field.value());

      return {
        wrapper: `step-${currentIndex + 1}`,
        label: currentIndex >= steps.length - 1 ? 'label-complete' : 'label-in-progress'
      };
    },
    inlineStylesFn: (field, form) => {
      const steps = ['basic', 'details', 'review', 'complete'];
      const currentIndex = steps.indexOf(field.value());
      const progress = ((currentIndex + 1) / steps.length) * 100;

      return {
        wrapper: {
          position: 'relative',
          '::after': {
            content: '""',
            position: 'absolute',
            bottom: '-4px',
            left: '0',
            height: '4px',
            width: `${progress}%`,
            backgroundColor: '#10b981',
            transition: 'width 0.3s ease'
          }
        }
      };
    }
  }
}
```

### 3. Field Validation State Styling

```typescript
{
  name: 'phone',
  type: FormFieldType.TEXT,
  label: 'Phone Number',
  styling: {
    stylesFn: (field, form) => {
      const hasError = !!field.error();
      const isValidating = field.validating?.();
      const hasValue = !!field.value();

      return {
        wrapper: [
          hasError ? 'field-error' : '',
          isValidating ? 'field-validating' : '',
          hasValue && !hasError ? 'field-success' : ''
        ].filter(Boolean),
        label: hasError ? 'label-error' : hasValue ? 'label-filled' : '',
        input: [
          'phone-input',
          hasError ? 'input-error' : '',
          hasValue ? 'input-filled' : ''
        ].filter(Boolean),
        error: hasError ? 'error-bounce' : '',
        hint: hasError ? 'hint-hidden' : 'hint-visible'
      };
    }
  }
}
```

### 4. Theme-Based Styling

```typescript
{
  name: 'theme',
  type: FormFieldType.RADIO,
  label: 'Theme Preference',
  styling: {
    stylesFn: (field, form) => {
      const selectedTheme = field.value();

      return {
        wrapper: `theme-${selectedTheme}`,
        label: `theme-${selectedTheme}-label`
      };
    },
    inlineStylesFn: (field, form) => {
      const themes = {
        light: { backgroundColor: '#ffffff', color: '#1f2937' },
        dark: { backgroundColor: '#1f2937', color: '#f9fafb' },
        auto: { backgroundColor: '#f3f4f6', color: '#374151' }
      };

      const selectedTheme = field.value();
      const themeStyles = themes[selectedTheme] || themes.auto;

      return {
        wrapper: {
          ...themeStyles,
          padding: '1rem',
          borderRadius: '8px',
          transition: 'all 0.2s ease'
        }
      };
    }
  }
}
```

## CSS Classes You Can Use

The styling system provides several built-in CSS classes:

### Wrapper Classes

- `compact` - Reduced spacing
- `spaced` - Increased spacing
- `fullwidth` - Full width container

### Validation State Classes

- `field-error` - Error state styling
- `field-validating` - Loading/validating state
- `field-success` - Success state styling

### Part-Specific Classes

- `label-active`, `label-inactive` - Label states
- `input-filled`, `input-error` - Input states
- `error-prominent`, `error-critical` - Error styling
- `hint-subtle`, `hint-visible`, `hint-hidden` - Hint styling

## Best Practices

1. **Performance**: Use static `modifierClass` for styles that don't change
2. **Reactivity**: Use `stylesFn` for styles that depend on form state
3. **Specificity**: Target specific parts when you need fine-grained control
4. **Consistency**: Create reusable style functions for common patterns
5. **Accessibility**: Ensure color changes are accompanied by other visual cues

## Example: Complete Contact Form with Custom Styling

```typescript
const contactForm = signalFormBuilder({
  model: { name: "", email: "", phone: "", priority: "normal", message: "" },
  fields: [
    {
      name: "name",
      type: FormFieldType.TEXT,
      label: "Full Name",
      styling: {
        modifierClass: ["name-field"],
        stylesFn: (field) => (field.value() ? "field-completed" : ""),
      },
    },
    {
      name: "email",
      type: FormFieldType.TEXT,
      label: "Email",
      styling: {
        stylesFn: (field) => ({
          wrapper: field.error() ? "email-error" : "email-normal",
          input: ["email-input", field.value()?.includes("@") ? "email-valid" : ""],
        }),
      },
    },
    {
      name: "priority",
      type: FormFieldType.SELECT,
      label: "Priority",
      options: [
        { label: "Low", value: "low" },
        { label: "Normal", value: "normal" },
        { label: "High", value: "high" },
        { label: "Urgent", value: "urgent" },
      ],
      styling: {
        stylesFn: (field) => `priority-${field.value()}`,
        inlineStylesFn: (field) => {
          const colors = {
            low: "#10b981",
            normal: "#6b7280",
            high: "#f59e0b",
            urgent: "#ef4444",
          };
          return {
            wrapper: { borderLeftColor: colors[field.value()] || colors.normal },
          };
        },
      },
    },
  ],
});
```

This styling system gives you complete control over field appearance while maintaining clean, reactive code.
