# Signal Template Forms

[![npm version](https://img.shields.io/npm/v/signal-template-forms.svg)](https://www.npmjs.com/package/signal-template-forms)

A modern Angular form library built from the ground up with Signals — flexible, type-safe, and fully themeable.

Born from an itch to reimagine template-driven forms, `signal-template-forms` gives you a clean, declarative API powered by Angular Signals and full control over layout, styling, and behavior.

> ⚠️ Built with Angular 19.2.

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
  form = SignalFormBuilder.createForm({
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
<signal-form [form]="form" />
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
    return of(cities.filter((city) =>
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
      map((countries) => countries.map(country => ({
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
{ name: 'birthDate', label: 'Birth Date', type: FormFieldType.DATETIME, config: {
  format: 'YYYY-MM-DD'
} }
{ name: 'favoriteColor', label: 'Color', type: FormFieldType.COLOR, config: { view: 'pickerWithInput' } }
{ name: 'volume', label: 'Volume', type: FormFieldType.SLIDER, config: { min: 0, max: 100 } }
{ name: 'rating', label: 'Rating', type: FormFieldType.RATING, config: { max: 5 } }
{ name: 'avatar', label: 'Profile Picture', type: FormFieldType.FILE, { config: {
  accept: ['jpg', 'png'],
  maxSizeMb: 10,
  multiple: false,
  uploadText: 'upload your jpegs or pngs here'
}} }
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
        map((isAvailable) => isAvailable ? null : 'Username taken')
      )
  ]
}
```

## Stepped Forms (Wizards)

```typescript
const steppedForm = SignalFormBuilder.createSteppedForm({
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
<signal-form-stepper [form]="steppedForm" (afterSaveCompletes)="handleAfterSaveHasFinished()" />
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

### CSS Color System

Signal Template Forms includes a comprehensive color system with automatic dark mode support:

```css
:root {
  /* Base colors - customize these to rebrand your entire form library */
  --signal-forms-primary: #3b82f6; /* Blue */
  --signal-forms-accent: #8b5cf6; /* Purple */
  --signal-forms-success: #10b981; /* Green */
  --signal-forms-warning: #f59e0b; /* Amber */
  --signal-forms-info: #0ea5e9; /* Sky */
  --signal-forms-danger: #ef4444; /* Red */
}
```

Each color automatically generates a complete scale (50-950) using CSS `color-mix()`:

- **50-400**: Light tints (mixed with white)
- **500**: Base color (your custom value)
- **600-950**: Dark shades (mixed with black)

```css
/* These are automatically generated from your base colors */
--signal-forms-primary-50: color-mix(in srgb, var(--signal-forms-primary) 5%, white);
--signal-forms-primary-100: color-mix(in srgb, var(--signal-forms-primary) 10%, white);
/* ... up to 950 */
```

### Dark Mode Support

to enable forms to use dark-mode simply use this provider within your apps config.

```typescript
provideSignalFormsTheme({ darkMode: true }),
```

this allows you to decide if you want the forms to use dark mode or not. if you want to default the theme we can also use `defaultTheme` as an argument withing the provideSignalFormsTheme provider, this allows us to choose between `'light' | 'dark' | 'auto'` and originally defaults to auto.

### Theming Variables

Customize form appearance with CSS variables:

```css
:root {
  /* Layout */
  --signal-form-padding: 1rem;
  --signal-form-border-radius: 4px;
  --signal-form-max-width: 600px;

  /* Colors (use semantic color tokens) */
  --signal-form-bg: var(--signal-forms-neutral-50);
  --signal-form-text: var(--signal-forms-neutral-700);
  --signal-form-border-color: var(--signal-forms-neutral-300);
  --signal-form-outline-focus: var(--signal-forms-primary-500);
  --signal-form-error-color: var(--signal-forms-danger-600);

  /* Typography */
  --signal-form-font-size-base: 1rem;
  --signal-form-font-size-sm: 0.75rem;

  /* Buttons */
  --signal-form-button-primary-bg: var(--signal-forms-primary-500);
  --signal-form-button-primary-bg-hover: var(--signal-forms-primary-600);

  /* Form spacing */
  --signal-form-fields-gap: 1rem;
  --signal-form-group-gap: 1rem;
}
```

### Custom Brand Theme Example

```css
:root {
  /* Custom brand colors */
  --signal-forms-primary: #ff6b35; /* Orange brand */
  --signal-forms-accent: #6c5ce7; /* Purple accent */
  --signal-forms-success: #2ecc71; /* Custom green */

  /* Adjust layout for your design */
  --signal-form-border-radius: 8px;
  --signal-form-padding: 1.5rem;
  --signal-form-max-width: 800px;
}
```

## Layout Configurations

### Standard Layouts

Configure form layout using the `view` property:

```typescript
// Stacked layout (default)
{
  config: {
    view: "stacked";
  }
}

// Row layout (horizontal)
{
  config: {
    view: "row";
  }
}

// Collapsable sections
{
  config: {
    view: "collapsable";
  }
}
```

### CSS Grid Layout with `gridArea` 🎯

The most powerful layout feature allows you to create custom CSS Grid layouts using `gridArea`:

```typescript
const form = SignalFormBuilder.createForm({
  model: { name: "", email: "", phone: "", address: "", city: "", zip: "" },
  fields: [
    { name: "name", label: "Full Name", type: FormFieldType.TEXT },
    { name: "email", label: "Email", type: FormFieldType.TEXT },
    { name: "phone", label: "Phone", type: FormFieldType.TEXT },
    { name: "address", label: "Address", type: FormFieldType.TEXT },
    { name: "city", label: "City", type: FormFieldType.TEXT },
    { name: "zip", label: "ZIP Code", type: FormFieldType.TEXT },
  ],
  config: {
    layout: "grid-area",
    gridArea: [
      ["name", "name", "email"], // Row 1: name spans 2 cols, email 1 col
      ["phone", "phone", "phone"], // Row 2: phone spans all 3 cols
      ["address", "address", "address"], // Row 3: address spans all 3 cols
      ["city", "city", "zip"], // Row 4: city spans 2 cols, zip 1 col
    ],
  },
});
```

This creates a CSS Grid with:

- **3 columns** (based on array length)
- **4 rows** (based on gridArea array length)
- Each field automatically gets `grid-area: fieldName`

### Advanced Grid Examples

**Complex Dashboard Layout:**

```typescript
config: {
  layout: 'grid-area',
  gridArea: [
    ['title', 'title', 'status', 'priority'],
    ['description', 'description', 'description', 'tags'],
    ['startDate', 'endDate', 'assignee', 'tags'],
    ['budget', 'category', 'assignee', 'tags'],
    ['notes', 'notes', 'notes', 'notes'],
  ]
}
```

**Responsive Contact Form:**

```typescript
config: {
  layout: 'grid-area',
  gridArea: [
    ['firstName', 'lastName'],         // 2-column row
    ['email', 'phone'],               // 2-column row
    ['company', 'jobTitle'],          // 2-column row
    ['message', 'message'],           // Full-width message
    ['newsletter', 'submit'],         // Checkbox + submit
  ]
}
```

**Use Empty Slots for Spacing:**

```typescript
config: {
  layout: 'grid-area',
  gridArea: [
    ['name', '.', 'email'],           // '.' creates empty grid cell
    ['address', 'address', 'address'],
    ['.', 'submit', '.'],             // Center the submit button
  ]
}
```

### Grid Layout Benefits

- ✅ **Pixel-perfect layouts** - No flexbox guesswork
- ✅ **Responsive by design** - CSS Grid handles mobile gracefully
- ✅ **Visual layout definition** - See your layout in the array structure
- ✅ **Automatic field positioning** - No manual CSS grid-area declarations needed
- ✅ **Empty cell support** - Use `'.'` for intentional spacing
- ✅ **Type-safe field names** - TypeScript ensures field names exist

### Custom Grid Styling

The grid container automatically gets:

```css
.grid {
  display: grid;
  grid-template-areas: "name name email" "phone phone phone" /* ... */;
  gap: var(--signal-form-fields-gap);
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
}
```

## Form Outputs

### Template Output Pattern

```html
<signal-form [form]="form" (onSave)="handleSave($event)" />
```

### Callback Pattern

```typescript
import { SignalFormBuilder } from "signal-template-forms";

form = SignalFormBuilder.createForm({
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
