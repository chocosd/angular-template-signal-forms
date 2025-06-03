# Signal Template Forms

A powerful, type-safe Angular forms library built with signals, providing reactive form management with excellent developer experience and performance.

## Features

- 🎯 **Type-safe**: Full TypeScript support with intelligent autocompletion
- ⚡ **Signal-based**: Reactive forms using Angular signals for optimal performance
- 🔧 **Rich field types**: Text, number, select, autocomplete, date, file upload, and more
- ✅ **Validation**: Field-level, cross-field, and async validation support
- 🎨 **Customizable**: CSS variables for easy theming and styling
- 📱 **Responsive**: Built-in responsive design patterns
- 🔄 **Unit conversion**: Advanced number fields with automatic unit conversions
- 📊 **Word counting**: Text fields with character/word count display
- 🧙 **Stepped forms**: Multi-step form wizard support

## Installation

```bash
npm install signal-template-forms
```

## Quick Start

```typescript
import { SignalFormBuilder } from "signal-template-forms";

@Component({
  // ...
})
export class MyComponent {
  private formBuilder = inject(SignalFormBuilder);

  form = this.formBuilder.createForm({
    model: { name: "", email: "", age: 0 },
    fields: [
      { name: "name", label: "Full Name", type: FormFieldType.TEXT },
      { name: "email", label: "Email", type: FormFieldType.TEXT },
      { name: "age", label: "Age", type: FormFieldType.NUMBER },
    ],
    onSave: (value) => console.log("Form saved:", value),
  });
}
```

```html
<signal-form-container [form]="form">
  <signal-form-fields />
  <signal-form-save-button />
</signal-form-container>
```

## Form Container API

The form container provides these reactive properties and methods:

### Properties

- `status: WritableSignal<FormStatus>` - Current form status (Idle, Submitting, Success, Error)
- `value: Signal<TModel>` - Current form values (excluding disabled fields)
- `rawValue: Signal<TModel>` - All form values including disabled fields
- `anyTouched: Signal<boolean>` - True if any field has been touched
- `anyDirty: Signal<boolean>` - True if any field has been modified
- `saveButtonDisabled: Signal<boolean>` - Whether save button should be disabled
- `fields: SignalFormField<TModel>[]` - Array of all form fields

### Methods

- `getField<K extends keyof TModel>(key: K)` - Get a specific field instance
- `getValue(): TModel` - Get current form values
- `getRawValue(): TModel` - Get all form values including disabled
- `getErrors(): ErrorMessage<TModel>[]` - Get all validation errors
- `validateForm(): boolean` - Validate entire form
- `setValue(model: TModel): void` - Set complete form values
- `patchValue(partial: DeepPartial<TModel>): void` - Update specific fields
- `reset(): void` - Reset form to initial state
- `save(): void` - Save form (runs validation first)

## Field Access

Fields are signals that can be accessed and modified directly:

```typescript
// Get a field
const nameField = form.getField("name");

// Access field signals
const currentValue = nameField.value();
const hasError = nameField.error();
const isTouched = nameField.touched();
const isDirty = nameField.dirty();
const hasFocus = nameField.focus();

// Modify field signals
nameField.value.set("New Value");
nameField.disabled.set(true);
nameField.disabled.update((current) => !current);
nameField.focus.set(true);
nameField.error.set("Custom error message");

// Reactive field interactions
const isSubmitDisabled = computed(() => form.getField("email").error() || !form.getField("terms").value());

// Set field value based on another field
effect(() => {
  const country = form.getField("country").value();
  if (country === "US") {
    form.getField("currency").value.set("USD");
  }
});
```

## Field Types Reference

### Text Fields

```typescript
{ name: 'username', label: 'Username', type: FormFieldType.TEXT }
{ name: 'description', label: 'Description', type: FormFieldType.TEXTAREA }
{ name: 'password', label: 'Password', type: FormFieldType.PASSWORD }
```

### Number Fields with Unit Conversion

```typescript
// Standard number
{ name: 'quantity', label: 'Quantity', type: FormFieldType.NUMBER }

// Currency formatting
{
  name: 'price',
  label: 'Price',
  type: FormFieldType.NUMBER,
  config: {
    inputType: NumberInputType.CURRENCY,
    currencyCode: 'USD'
  }
}

// Percentage
{
  name: 'discount',
  label: 'Discount',
  type: FormFieldType.NUMBER,
  config: { inputType: NumberInputType.PERCENTAGE }
}

// Unit conversion (weight)
{
  name: 'weight',
  label: 'Weight',
  type: FormFieldType.NUMBER,
  config: {
    inputType: NumberInputType.UNIT_CONVERSION,
    unitConversions: ConversionUtils.createWeightConfig('kg', 1)
  }
}
```

### Selection Fields

```typescript
// Select dropdown
{
  name: 'country',
  label: 'Country',
  type: FormFieldType.SELECT,
  options: [
    { label: 'United States', value: 'US' },
    { label: 'Canada', value: 'CA' }
  ]
}

// Radio buttons
{
  name: 'size',
  label: 'Size',
  type: FormFieldType.RADIO,
  options: [
    { label: 'Small', value: 'S' },
    { label: 'Medium', value: 'M' },
    { label: 'Large', value: 'L' }
  ]
}

// Multi-select
{
  name: 'skills',
  label: 'Skills',
  type: FormFieldType.MULTISELECT,
  options: [
    { label: 'JavaScript', value: 'js' },
    { label: 'TypeScript', value: 'ts' },
    { label: 'Angular', value: 'angular' }
  ]
}
```

### Autocomplete Fields

```typescript
// Static options autocomplete
{
  name: 'city',
  label: 'City',
  type: FormFieldType.AUTOCOMPLETE,
  loadOptions: (search: string) => {
    const cities = [
      { label: 'New York', value: 'ny' },
      { label: 'Los Angeles', value: 'la' },
      { label: 'Chicago', value: 'chi' }
    ];
    return of(cities.filter(city =>
      city.label.toLowerCase().includes(search.toLowerCase())
    ));
  },
  config: {
    debounceMs: 300,
    minChars: 2
  }
}

// Observable-based autocomplete with HTTP service
{
  name: 'country',
  label: 'Country',
  type: FormFieldType.AUTOCOMPLETE,
  loadOptions: (search: string) =>
    this.httpService.searchCountries(search).pipe(
      map(countries => countries.map(country => ({
        label: country.name,
        value: country.code
      })))
    ),
  config: {
    debounceMs: 200,
    minChars: 1
  }
}
```

### Boolean Fields

```typescript
{ name: 'agreeToTerms', label: 'I agree to terms', type: FormFieldType.CHECKBOX }
{ name: 'enableNotifications', label: 'Notifications', type: FormFieldType.SWITCH }
```

### Advanced Fields

```typescript
{ name: 'birthDate', label: 'Birth Date', type: FormFieldType.DATETIME }
{ name: 'favoriteColor', label: 'Color', type: FormFieldType.COLOR }
{ name: 'volume', label: 'Volume', type: FormFieldType.SLIDER, config: { min: 0, max: 100 } }
{ name: 'rating', label: 'Rating', type: FormFieldType.RATING, config: { max: 5 } }
{ name: 'avatar', label: 'Profile Picture', type: FormFieldType.FILE }
```

### Word Count Feature

```typescript
{
  name: 'description',
  label: 'Description',
  type: FormFieldType.TEXTAREA,
  config: {
    wordCount: {
      enabled: true,
      maxWords: 150,
      showCharacters: true
    }
  }
}
```

## Validation

### Field-Level Validation

```typescript
import { SignalValidators } from 'signal-template-forms';

{
  name: 'email',
  label: 'Email',
  type: FormFieldType.TEXT,
  validators: [
    SignalValidators.required(),
    SignalValidators.email(),
    SignalValidators.minLength(5)
  ]
}
```

### Cross-Field Validation

```typescript
{
  name: 'confirmPassword',
  label: 'Confirm Password',
  type: FormFieldType.PASSWORD,
  validators: [
    SignalValidators.required(),
    (value, form) => {
      const password = form.getField('password').value();
      return value === password ? null : 'Passwords must match';
    }
  ]
}
```

### Async Validation

```typescript
{
  name: 'username',
  label: 'Username',
  type: FormFieldType.TEXT,
  asyncValidators: [
    (value: string) =>
      this.userService.checkUsername(value).pipe(
        map(isAvailable => isAvailable ? null : 'Username taken')
      )
  ]
}
```

## Stepped Forms (Wizards)

```typescript
const steppedForm = this.formBuilder.createSteppedForm({
  model: { personal: {}, contact: {}, preferences: {} },
  steps: [
    {
      title: "Personal Information",
      fields: [
        { name: "firstName", label: "First Name", type: FormFieldType.TEXT },
        { name: "lastName", label: "Last Name", type: FormFieldType.TEXT },
      ],
    },
    {
      title: "Contact Details",
      fields: [
        { name: "email", label: "Email", type: FormFieldType.TEXT },
        { name: "phone", label: "Phone", type: FormFieldType.TEXT },
      ],
    },
  ],
  onSave: (value) => this.submitForm(value),
});
```

```html
<signal-stepped-form-container [form]="steppedForm">
  <signal-form-step-indicator />
  <signal-form-fields />
  <signal-form-step-navigation />
</signal-stepped-form-container>
```

## Form Actions

### Setting Field Values

```typescript
// Set individual field values
form.getField("name").value.set("John Doe");
form.getField("email").value.set("john@example.com");

// Set field state
form.getField("email").disabled.set(true);
form.getField("name").error.set("Custom error");
form.getField("description").focus.set(true);

// Update field values reactively
form.getField("quantity").value.update((current) => current + 1);
form.getField("enabled").disabled.update((current) => !current);
```

### Form-Level Actions

```typescript
// Set complete form values (requires full model)
form.setValue({
  name: "John Doe",
  email: "john@example.com",
  age: 30,
});

// Patch partial form values
form.patchValue({
  email: "newemail@example.com",
  age: 31,
});

// Reset form to initial state
form.reset();

// Validate and save
if (form.validateForm()) {
  form.save();
}
```

## Conditional Fields

```typescript
{
  name: 'reason',
  label: 'Reason for leaving',
  type: FormFieldType.TEXTAREA,
  hidden: (form) => form.getField('isStaying').value() === true
}

{
  name: 'managerEmail',
  label: 'Manager Email',
  type: FormFieldType.TEXT,
  disabled: (form) => form.getField('hasManager').value() === false
}
```

## Styling

The library uses CSS variables for theming:

```css
:root {
  --signal-form-text: #1f2937;
  --signal-form-background: #ffffff;
  --signal-form-border-color: #d1d5db;
  --signal-form-border-radius-sm: 0.375rem;
  --signal-form-outline-focus: #3b82f6;
  --signal-form-error-color: #ef4444;
  --signal-form-success-color: #10b981;
}
```

## Form Outputs

### Template Output Pattern

```html
<signal-form-container [form]="form" (onSave)="handleSave($event)">
  <signal-form-fields />
  <signal-form-save-button />
</signal-form-container>
```

### Callback Pattern

```typescript
form = this.formBuilder.createForm({
  model: myModel,
  fields: myFields,
  onSave: (value) => {
    console.log("Form saved with:", value);
    this.apiService.saveData(value);
  },
});
```

## License

MIT @ Steven Dix
