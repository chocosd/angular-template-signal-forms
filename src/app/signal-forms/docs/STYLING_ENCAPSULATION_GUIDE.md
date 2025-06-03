# Signal Forms CSS Encapsulation & Styling Guide

## The Encapsulation Challenge

Angular components use ViewEncapsulation by default, which means styles are scoped to the component. When you add `modifierClass: ['premium-field']` to a field, you need to understand how to style it properly.

## Our Solution: ViewEncapsulation.None + Scoped Selectors

The Signal Forms input components use `ViewEncapsulation.None` but with **scoped selectors** to give you the best of both worlds:

✅ **You can style modifier classes directly**  
✅ **Component styles don't pollute the global scope**  
✅ **CSS custom properties for easy theming**

## How to Style Your Fields

### Method 1: Global Styles (Recommended)

Add your custom styles to your global stylesheet (`src/styles.scss` or `src/styles.css`):

```scss
// In your global styles.scss
signal-form-input-item {
  .form-control.premium-field {
    border: 2px solid #8b5cf6;
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(139, 92, 246, 0.1);

    .form-label {
      color: #8b5cf6;
      font-weight: 600;
    }

    .form-input {
      background: rgba(255, 255, 255, 0.9);
      border: none;
    }
  }

  .form-control.error-field {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.05);

    .form-error {
      font-weight: 600;
      animation: shake 0.3s ease-in-out;
    }
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}
```

### Method 2: Component-Specific Styles

If you're using the styling system in a specific component, add styles to that component's stylesheet:

```scss
// In your component.scss
:host {
  signal-form-input-item {
    .form-control.my-custom-field {
      // Your custom styles here
    }
  }
}
```

### Method 3: CSS Custom Properties (Theme-based)

Use CSS custom properties for easy theming:

```scss
// Set theme variables globally or per component
:root {
  --premium-color: #8b5cf6;
  --premium-bg: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  --premium-radius: 8px;

  --error-prominent-color: #dc2626;
  --error-prominent-bg: rgba(239, 68, 68, 0.1);

  --label-prominent-color: #1f2937;
  --label-prominent-size: 1.125rem;
}

// Then use built-in modifier classes that use these variables
```

### Method 4: Dynamic Inline Styles

For completely dynamic styling based on form state:

```typescript
{
  name: 'priority',
  type: FormFieldType.SELECT,
  label: 'Priority',
  styling: {
    inlineStylesFn: (field, form) => {
      const priority = field.value();
      const colors = {
        low: { border: '2px solid #10b981', background: '#ecfdf5' },
        high: { border: '2px solid #f59e0b', background: '#fffbeb' },
        urgent: { border: '2px solid #ef4444', background: '#fef2f2' }
      };

      return {
        wrapper: colors[priority] || {},
        label: { color: colors[priority]?.border?.split(' ')[2] || '#6b7280' }
      };
    }
  }
}
```

## Built-in Modifier Classes

The component includes several built-in modifier classes you can use immediately:

### Field Container Classes

```typescript
modifierClass: ["premium-field"]; // Elegant styling with purple theme
modifierClass: ["compact-field"]; // Reduced spacing and smaller fonts
modifierClass: ["highlighted-field"]; // Focus-style highlight border
```

### Part-Specific Classes

```typescript
stylesFn: () => ({
  label: "label-prominent", // Larger, bolder label
  label: "label-subtle", // Smaller, lighter label
  error: "error-prominent", // Highlighted error with background
  error: "error-subtle", // Standard error styling
  hint: "hint-prominent", // More prominent hint text
  hint: "hint-subtle", // Lighter hint text
  input: "custom-input-wrapper", // Custom input container styling
});
```

## CSS Custom Properties You Can Override

```scss
signal-form-input-item {
  // Field basics
  --field-border-color: #d1d5db;
  --field-border-radius: 4px;
  --field-padding: 0.5rem 0.75rem;
  --field-font-size: 1rem;
  --field-background: #ffffff;
  --field-focus-color: #3b82f6;
  --field-error-color: #ef4444;
  --field-success-color: #10b981;

  // Premium field theme
  --premium-color: #8b5cf6;
  --premium-bg: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  --premium-radius: 8px;

  // Highlight field theme
  --highlight-color: rgba(59, 130, 246, 0.1);
  --highlight-border: #3b82f6;

  // Label themes
  --label-prominent-color: #1f2937;
  --label-prominent-size: 1.125rem;
  --label-subtle-color: #6b7280;
  --label-subtle-size: 0.875rem;

  // Error themes
  --error-prominent-color: #dc2626;
  --error-prominent-bg: rgba(239, 68, 68, 0.1);
  --error-subtle-color: #ef4444;
  --error-subtle-size: 0.875rem;

  // Hint themes
  --hint-prominent-color: #374151;
  --hint-subtle-color: #9ca3af;
  --hint-subtle-size: 0.875rem;

  // Input wrapper
  --input-wrapper-bg: transparent;
  --input-wrapper-border: none;
  --input-wrapper-radius: inherit;
  --input-wrapper-padding: 0;
}
```

## Complete Examples

### 1. Simple Modifier Class

```typescript
// Field definition
{
  name: 'email',
  type: FormFieldType.TEXT,
  label: 'Email Address',
  styling: {
    modifierClass: ['premium-field']
  }
}
```

```scss
// Global styles
signal-form-input-item .form-control.premium-field {
  border: 2px solid var(--premium-color, #8b5cf6);
  background: var(--premium-bg);
  border-radius: var(--premium-radius, 8px);
}
```

### 2. Advanced Dynamic Styling

```typescript
// Field definition
{
  name: 'status',
  type: FormFieldType.SELECT,
  label: 'Status',
  styling: {
    stylesFn: (field, form) => {
      const status = field.value();
      return {
        wrapper: `status-${status}`,
        label: status === 'urgent' ? 'label-prominent' : 'label-subtle',
        error: 'error-prominent'
      };
    },
    inlineStylesFn: (field, form) => {
      const statusColors = {
        pending: '#f59e0b',
        approved: '#10b981',
        rejected: '#ef4444',
        urgent: '#dc2626'
      };

      return {
        wrapper: {
          borderLeftColor: statusColors[field.value()] || '#6b7280',
          borderLeftWidth: '4px',
          borderLeftStyle: 'solid'
        }
      };
    }
  }
}
```

```scss
// Global styles
signal-form-input-item {
  .form-control.status-urgent {
    animation: pulse 2s infinite;
    box-shadow: 0 0 10px rgba(220, 38, 38, 0.3);
  }

  .form-control.status-approved {
    background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
```

## Best Practices

1. **Use CSS Custom Properties** for theme-based styling
2. **Use Global Styles** for modifier classes that won't change
3. **Use Dynamic Functions** for state-dependent styling
4. **Combine Approaches** - static classes for base styles, dynamic functions for state changes
5. **Namespace Your Classes** to avoid conflicts (e.g., `my-app-premium-field`)

## Troubleshooting

**Q: My styles aren't applying to modifier classes**  
A: Make sure you're targeting `signal-form-input-item .form-control.your-class` in global styles.

**Q: Can I style individual input elements?**  
A: Yes, use the `input` property in `stylesFn` to target the form-field-wrapper, or use CSS custom properties for input styling.

**Q: How do I create a theme?**  
A: Set CSS custom properties at the `:root` level or component level, then use built-in modifier classes.

This approach gives you complete styling control while maintaining clean encapsulation!
