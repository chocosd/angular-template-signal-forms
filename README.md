# 🧩 Angular Template Signal Forms

A declarative, fully reactive **signal-based** form builder for Angular.  
Forget `FormControl`, `FormGroup`, and `ngModel`. This is a **zero-boilerplate**, type-safe alternative that mirrors the **developer-friendly ergonomics** of template-driven and reactive forms — powered entirely by **Angular Signals**.

---

## 🚦 Why?

Angular’s traditional forms APIs are either:

- ❗ Template-driven: verbose and disconnected from logic.
- ❗ Reactive forms: imperative, overly verbose, and hard to scale.
- ✅ This library: **signal-powered**, **typed**, and **fully declarative**.

Built from the ground up to:

- 🧠 Infer types from your model.
- 💡 Provide strong intellisense and type safety.
- 🎯 Bind to the DOM directly with `[(value)]`, no `FormGroup` necessary.
- 🧼 Keep forms composable and clean.

---

## ✨ Features

- ✅ Model-driven form creation (`FormBuilder.createForm`)
- ✅ Type-safe field declarations
- ✅ Nested fields with recursion
- ✅ `computedValue()` support
- ✅ Custom validators
- ✅ Signal-based value/touched/dirty/error tracking
- ✅ Built-in save/reset/validation methods
- ✅ Autocomplete with `Promise` or `Observable`
- ✅ Full control via template: use `signal-form`, or drop in `signal-form-fields` manually
- ✅ Auto-highlight errors + smooth scroll

---

## 🧱 Define a Model

```ts
export interface Basket {
  address: {
    line1: string;
    postcode: string;
  };
  apples: number;
  applePrice: number;
  appleTotal: number;
  pears: number;
  pearPrice: number;
  pearTotal: number;
  isOrganic: boolean;
  total: number;
}
```

## Build your Form

```ts
this.form = FormBuilder.createForm<Basket>({
  title: "Fruit Basket",
  model: {
    address: { line1: "", postcode: "" },
    apples: 2,
    applePrice: 0.5,
    appleTotal: 1,
    pears: 2,
    pearPrice: 0.7,
    pearTotal: 1.4,
    isOrganic: false,
    total: 2.4,
  },
  fields: [
    {
      name: "address",
      heading: "Delivery Address",
      subheading: "Where should we send your basket?",
      hidden: (form) => form.getField("total").value() < 100,
      fields: [
        { name: "line1", label: "Street", type: FormFieldType.TEXT },
        { name: "postcode", label: "Postcode", type: FormFieldType.TEXT },
      ],
    },
    {
      name: "apples",
      label: "Number of Apples",
      type: FormFieldType.NUMBER,
    },
    {
      name: "applePrice",
      label: "Apple Price",
      type: FormFieldType.NUMBER,
      validators: [(v) => (v < 0 ? "Must be positive" : null)],
    },
    {
      name: "appleTotal",
      label: "Total (Apples)",
      type: FormFieldType.NUMBER,
      computedValue: (form) => form.getField("apples").value() * form.getField("applePrice").value(),
    },
    {
      name: "isOrganic",
      label: "Is Organic?",
      type: FormFieldType.CHECKBOX,
    },
    {
      name: "total",
      label: "Basket Total",
      type: FormFieldType.NUMBER,
      computedValue: (form) => {
        const a = form.getField("appleTotal").value();
        const b = form.getField("pearTotal").value();
        return a + b;
      },
      validators: [(val, form) => (!(form.getField("applePrice").value() || form.getField("pearPrice").value()) ? "must have at least one apple and pear for this order" : null)],
    },
  ],
});
```

## Render the form

#option A: Full Template Form

```html
<signal-form [form]="form()" (onSave)="handleSubmit($event)" />
```

#option B: Manual Layout

```html
<signal-form-fields [form]="form()" [fields]="form().fields" />
<!-- Add custom content/layout -->
<signal-form-save-button [data]="form()" (onSave)="handleSubmit($event)" />
```

## Computed Fields

```ts
{
  name: 'appleTotal',
  label: 'Total',
  type: FormFieldType.NUMBER,
  computedValue: (form) => {
    return form.getField('apples').value() * form.getField('applePrice').value();
  }
}
```

## Validation

validators take 2 arguments, the first being the value of the field and the second being the form itself, allowing you to either do something like:

```ts
validators: [(value) => (value <= 0 ? "Must be greater than 0" : null)];
```

or even

```ts
   validators: [
            (val, form) =>
              !(
                form.getField('applePrice').value() ||
                form.getField('pearPrice').value()
              )
                ? 'must have at least one apple and pear for this order'
                : null,
            (val) => val > 100 ? 'order must be at least 100' : null
          ],
```

Validators run reactively and before submits too.

## Autocomplete

Supports both Promise and Observables

Promise Example:

```ts
{
  name: 'city',
  label: 'City',
  type: FormFieldType.AUTOCOMPLETE,
  loadOptions: (search) =>
    fetch(`https://api.teleport.org/api/cities/?search=${search}`)
      .then(res => res.json())
      .then(data => data._embedded['city:search-results'].map((item: any) => ({
        label: item.matching_full_name,
        value: item.matching_full_name,
      })))
}
```

Observable example:

```ts
{
  name: 'country',
  label: 'Country',
  type: FormFieldType.AUTOCOMPLETE,
  loadOptions: (search) =>
    this.countriesService.getCountries(search).pipe(
      map(countries =>
        countries.map((c) => ({
          label: c.name,
          value: c.code
        }))
      )
    )
}
```

## API

each for instance provides:

```ts
form.getField("apples").value(); // signal
form.getField("price").touched(); // signal
form.value(); // computed, excluding disabled
form.rawValue(); // full value, all fields
form.anyTouched(); // true if any field has been interacted with
form.getErrors(); // list of error messages
form.reset(); // restores initial state
form.save(); // triggers validation + onSave
```

## Layout and Config

Each group of fields (nested object) can have:

```ts
{
  heading: 'Your Info',
  subheading: 'Please tell us more about you',
  config: {
    layout: 'stacked' | 'row' | 'grid',
  }
}
```

## Roadmap

[x] nested field groups
[x] computed fields
[x] validations
[x] autocomplete (Promise/Observable)
[x] save/reset support
[x] disabled/hidden logic
[] repeatable fields (coming soon)
[] field transitions/animations
[] dynamic field registration
[] css variables and theming
