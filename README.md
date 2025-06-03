# 🧩 Angular Signal Forms

A declarative, fully reactive **signal-based** form builder for Angular.  
Forget `FormControl`, `FormGroup`, and `ngModel`. This is a **zero-boilerplate**, type-safe alternative powered entirely by **Angular Signals**.

---

## 🚦 Why?

Angular's traditional forms APIs are either:

- ❗ Template-driven: verbose and disconnected from logic.
- ❗ Reactive forms: imperative, overly verbose, and hard to scale.
- ✅ This library: **signal-powered**, **typed**, and **fully declarative**.

Built from the ground up to:

- 🧠 Infer types from your model.
- 💡 Provide strong intellisense and type safety.
- 🎯 Bind to the DOM directly with signals, no `FormGroup` necessary.
- 🧼 Keep forms composable and clean.

---

## ✨ Features

### Core Functionality

- ✅ Model-driven form creation (`SignalFormBuilder.createForm`)
- ✅ Type-safe field declarations
- ✅ Nested fields with recursion
- ✅ `computedValue()` support
- ✅ Custom validators
- ✅ Signal-based value/touched/dirty/error tracking
- ✅ Built-in save/reset/validation methods
- ✅ Auto-highlight errors + smooth scroll

### Advanced Field Types

- ✅ **Number Fields** with specialized input types (currency, percentage, unit conversion)
- ✅ **Unit Conversion** with automatic value conversion between units
- ✅ **Word Count** for text-based inputs with configurable display formats
- ✅ **Autocomplete** with `Promise` or `Observable` support
- ✅ **File uploads** with validation and size limits
- ✅ **Color picker** with multiple view modes
- ✅ **Date/time picker** with custom formatting

### Form Features

- ✅ `computedValue()` support for calculated fields
- ✅ Custom validators with form-wide context
- ✅ Conditional field visibility and disabled states
- ✅ Stepped forms (wizard-style navigation)
- ✅ Repeatable groups for dynamic arrays
- ✅ Full template control or pre-built components

---

## 📦 Installation

```bash
npm install signal-forms
```

```typescript
// Core functionality
import { SignalFormBuilder, FormFieldType } from "signal-forms";

// Pre-built form components
import { SignalFormComponent } from "signal-forms/renderers";

// Individual field components
import { SignalFormTextFieldComponent } from "signal-forms/fields";
```

---

## 🧱 Basic Usage

### 1. Define Your Model

```typescript
interface UserProfile {
  personal: {
    name: string;
    age: number;
    income: number;
    weight: number;
    bio: string;
  };
  preferences: {
    theme: string;
    notifications: boolean;
  };
}
```

### 2. Build Your Form

```typescript
import { SignalFormBuilder, FormFieldType, NumberInputType, ConversionUtils } from "signal-forms";

export class MyComponent {
  form = SignalFormBuilder.createForm<UserProfile>({
    title: "User Profile",
    model: {
      personal: { name: "", age: 0, income: 0, weight: 0, bio: "" },
      preferences: { theme: "light", notifications: true },
    },
    // Manage save logic here instead of using template output
    onSave: (form) => this.handleSubmit(form.value()),
    fields: [
      {
        name: "personal",
        heading: "Personal Information",
        fields: [
          {
            name: "name",
            label: "Full Name",
            type: FormFieldType.TEXT,
            config: { wordCount: true },
            validators: [(value) => (!value ? "Name is required" : null), (value) => (value.length < 2 ? "Name must be at least 2 characters" : null)],
          },
          {
            name: "age",
            label: "Age",
            type: FormFieldType.NUMBER,
            config: {
              inputType: NumberInputType.INTEGER,
              min: 13,
              max: 120,
            },
          },
          {
            name: "income",
            label: "Annual Income",
            type: FormFieldType.NUMBER,
            config: {
              inputType: NumberInputType.CURRENCY,
              currencyCode: "USD",
              locale: "en-US",
            },
          },
          {
            name: "weight",
            label: "Weight",
            type: FormFieldType.NUMBER,
            config: {
              inputType: NumberInputType.UNIT_CONVERSION,
              unitConversions: {
                unitConversions: ConversionUtils.weight,
                defaultUnit: "kg",
                unitPosition: "suffix",
              },
            },
          },
          {
            name: "bio",
            label: "Biography",
            type: FormFieldType.TEXTAREA,
            config: {
              wordCount: true,
              minRows: 3,
              maxRows: 8,
            },
          },
        ],
      },
    ],
  });

  handleSubmit(data: UserProfile) {
    console.log("Form submitted:", data);
  }
}
```

### 3. Render the Form

**Option A: Using Form Builder onSave Callback**

```html
<!-- Form handles save internally via onSave callback -->
<signal-form [form]="form()" />
```

**Option B: Using Template Output**

```html
<!-- Handle save via template output -->
<signal-form [form]="form()" (onSave)="handleSubmit($event)" />
```

**Option C: Custom Layout**

```html
<signal-form-fields [form]="form()" [fields]="form().fields" /> <button (click)="form().save()">Save</button>
```

// Get current values
form().value() // Complete form model

````

---

## 🔢 Number Field Types

The `NumberFieldConfig` supports different input types for specialized formatting:

### Standard Number

```typescript
{
  name: 'quantity',
  type: FormFieldType.NUMBER,
  config: {
    inputType: NumberInputType.STANDARD,
    min: 0,
    max: 100,
    step: 1
  }
}
````

### Currency

```typescript
{
  name: 'price',
  type: FormFieldType.NUMBER,
  config: {
    inputType: NumberInputType.CURRENCY,
    currencyCode: 'EUR',
    locale: 'de-DE'  // €1.234,56
  }
}
```

### Percentage

```typescript
{
  name: 'completion',
  type: FormFieldType.NUMBER,
  config: {
    inputType: NumberInputType.PERCENTAGE,
    locale: 'en-US'  // Shows as 85.5%
  }
}
```

### Unit Conversion

```typescript
{
  name: 'distance',
  type: FormFieldType.NUMBER,
  config: {
    inputType: NumberInputType.UNIT_CONVERSION,
    unitConversions: {
      unitConversions: ConversionUtils.length,
      defaultUnit: 'km',
      unitPosition: 'suffix',
      precision: 2,  // Round converted values to 2 decimal places
      parser: (value) => value.toFixed(2) + ' units'
    }
  }
}
```

### Built-in Conversion Utilities

```typescript
// Weight conversions (kg, lbs, oz, g)
ConversionUtils.weight

// Length conversions (m, ft, in, cm, mm)
ConversionUtils.length

// Temperature conversions (celsius, fahrenheit, kelvin)
ConversionUtils.temperature

// Custom conversion
{
  unitConversions: {
    mph: {
      label: 'Miles per Hour',
      convert: (value, fromUnit) => fromUnit === 'kph' ? value * 0.621371 : value
    },
    kph: {
      label: 'Kilometers per Hour',
      convert: (value, fromUnit) => fromUnit === 'mph' ? value * 1.60934 : value
    }
  }
}
```

---

## 📝 Word Count Feature

Enable word counting on text-based fields:

```typescript
{
  name: 'description',
  type: FormFieldType.TEXTAREA,
  config: {
    wordCount: true  // Enables word count display
  }
}

// Text field shows character count
{
  name: 'title',
  type: FormFieldType.TEXT,
  config: {
    wordCount: true  // Shows character count for text fields
  }
}
```

The word count component supports different display formats:

- `'words'` - "25 words"
- `'characters'` - "150 characters"
- `'both'` - "25 words, 150 characters"
- `'detailed'` - "25 words | 150 chars | 5 lines"

---

## 🎯 Form Container API

The form container provides powerful methods for interaction:

### Form State

```typescript
const form = SignalFormBuilder.createForm<MyModel>({...});

// Form status
form().status()        // 'valid' | 'invalid' | 'pending' | 'disabled'
form().valid()         // boolean
form().invalid()       // boolean
form().pending()       // boolean
form().disabled()      // boolean

// Form state
form().touched()       // boolean - any field touched
form().dirty()         // boolean - any field modified
form().pristine()      // boolean - form unchanged
form().submitted()     // boolean - form submitted

// Get current values
form().value()         // Complete form model
```

### Field Access

```typescript
// Get specific fields
const nameField = form().getField("name");
const addressField = form().getField("address.line1"); // Nested access

// Field properties
nameField.value(); // Current value
nameField.touched(); // boolean
nameField.dirty(); // boolean
nameField.focus(); // boolean
nameField.errors(); // string[] | null
nameField.valid(); // boolean
nameField.disabled(); // boolean
```

### Form Actions

```typescript
// Save/Submit
form().save(); // Validate and emit onSave
form().validate(); // Run all validators
form().markAllTouched(); // Mark all fields as touched

// Reset operations
form().reset(); // Reset to original values
form().resetToValue(newModel); // Reset to specific values
form().markPristine(); // Mark as unchanged

// Field operations
form().setFieldValue("name", "John"); // Set single field
form().setFieldDisabled("email", true); // Disable field
form().setFieldError("phone", "Invalid format"); // Set custom error
```

### Conditional Logic

```typescript
{
  name: 'shippingAddress',
  fields: [...],
  hidden: (form) => !form.getField('needsShipping').value(),
  disabled: (form) => form.getField('sameAsBilling').value()
}
```

### Computed Values

```typescript
{
  name: 'total',
  label: 'Total Amount',
  type: FormFieldType.NUMBER,
  computedValue: (form) => {
    const subtotal = form.getField('subtotal').value();
    const tax = form.getField('tax').value();
    return subtotal + tax;
  }
}
```

---

## 🏗️ Field Types Reference

### Text Fields

```typescript
// Basic text
{ name: 'title', type: FormFieldType.TEXT }

// Password with toggle
{
  name: 'password',
  type: FormFieldType.PASSWORD,
  config: { showToggle: true }
}

// Textarea with word count
{
  name: 'description',
  type: FormFieldType.TEXTAREA,
  config: {
    wordCount: true,
    minRows: 3,
    maxRows: 10
  }
}
```

### Selection Fields

```typescript
// Dropdown select
{
  name: 'country',
  type: FormFieldType.SELECT,
  options: [
    { label: 'United States', value: 'US' },
    { label: 'Canada', value: 'CA' }
  ]
}

// Multi-select
{
  name: 'skills',
  type: FormFieldType.MULTISELECT,
  options: skillOptions
}

// Radio buttons
{
  name: 'gender',
  type: FormFieldType.RADIO,
  options: [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' }
  ]
}

// Chip list (tags)
{
  name: 'tags',
  type: FormFieldType.CHIPLIST,
  options: tagOptions
}
```

### Interactive Fields

```typescript
// Switch/Toggle
{ name: 'enabled', type: FormFieldType.SWITCH }

// Checkbox
{ name: 'agree', type: FormFieldType.CHECKBOX }

// Slider/Range
{
  name: 'volume',
  type: FormFieldType.SLIDER,
  config: { min: 0, max: 100, step: 5 }
}

// Star rating
{
  name: 'rating',
  type: FormFieldType.RATING,
  config: { min: 1, max: 5, allowHalf: true }
}
```

### Special Fields

```typescript
// File upload
{
  name: 'avatar',
  type: FormFieldType.FILE,
  config: {
    accept: ['image/*'],
    maxSizeMb: 5,
    multiple: false
  }
}

// Color picker
{
  name: 'theme',
  type: FormFieldType.COLOR,
  config: { view: 'swatch' } // or 'pickerWithInput'
}

// Date/time
{
  name: 'birthDate',
  type: FormFieldType.DATETIME,
  config: { format: 'yyyy-MM-dd' }
}

// Autocomplete with API
{
  name: 'city',
  type: FormFieldType.AUTOCOMPLETE,
  loadOptions: (searchTerm) =>
    fetch(`/api/cities?q=${searchTerm}`)
      .then(res => res.json()),
  config: {
    debounceMs: 300,
    minChars: 2
  }
}
```

---

## 🧪 Validation

### Field-level Validators

```typescript
{
  name: 'email',
  type: FormFieldType.TEXT,
  validators: [
    (value) => !value ? 'Email is required' : null,
    (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !emailRegex.test(value) ? 'Invalid email format' : null;
    }
  ]
}
```

### Cross-field Validation

```typescript
{
  name: 'confirmPassword',
  type: FormFieldType.PASSWORD,
  validators: [
    (value, form) => {
      const password = form.getField('password').value();
      return value !== password ? 'Passwords must match' : null;
    }
  ]
}
```

### Async Validation

```typescript
{
  name: 'username',
  type: FormFieldType.TEXT,
  asyncValidators: [
    async (value) => {
      const response = await fetch(`/api/check-username/${value}`);
      const { available } = await response.json();
      return available ? null : 'Username is already taken';
    }
  ]
}
```

### Built-in Validators

```typescript
import { SignalValidators } from "signal-forms";

{
  validators: [SignalValidators.required(), SignalValidators.email(), SignalValidators.minLength(6), SignalValidators.maxLength(50), SignalValidators.pattern(/^[A-Z]+$/), SignalValidators.min(18), SignalValidators.max(100)];
}
```

---

## 🪜 Stepped Forms (Wizards)

Create multi-step forms with navigation:

```typescript
const form = SignalFormBuilder.createSteppedForm<MyModel>({
  title: "User Registration",
  model: initialModel,
  steps: [
    {
      name: "personal",
      title: "Personal Information",
      fields: [
        { name: "firstName", type: FormFieldType.TEXT },
        { name: "lastName", type: FormFieldType.TEXT },
      ],
    },
    {
      name: "contact",
      title: "Contact Details",
      fields: [
        { name: "email", type: FormFieldType.TEXT },
        { name: "phone", type: FormFieldType.TEXT },
      ],
    },
  ],
});

// Step navigation
form().nextStep();
form().previousStep();
form().goToStep(1);
form().currentStep(); // Current step index
form().canGoNext(); // Boolean
form().canGoPrevious(); // Boolean
```

```html
<signal-form-stepper [form]="form()" (onSave)="handleSubmit($event)" />
```

---

## 🎨 Styling & Theming

### CSS Classes

The library applies consistent CSS classes for easy styling:

```css
/* Form containers */
.signal-form {
}
.signal-form-step {
}

/* Field wrappers */
.form-input-wrapper {
}
.form-input {
}
.form-label {
}
.form-hint {
}
.form-error {
}

/* Field states */
.form-input--invalid {
}
.form-input--disabled {
}
.form-input--focused {
}

/* Word count */
.word-count {
}
.word-count-compact {
}

/* Unit conversion */
.form-select-unit {
}
.form-select-prefix {
}
.form-select-suffix {
}
```

### Custom Styling

```typescript
{
  name: 'description',
  type: FormFieldType.TEXTAREA,
  styling: {
    wrapper: 'custom-wrapper',
    input: 'custom-textarea',
    label: 'custom-label'
  }
}
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

---

## 📄 License

MIT © Steven Dix
