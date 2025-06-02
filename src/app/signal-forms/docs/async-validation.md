# Async Validation in Signal Forms

Signal Forms supports asynchronous validation with configurable trigger behaviors and debouncing. This allows you to perform complex validations like checking email availability, validating against remote APIs, or any other async operations.

## Basic Usage

### Adding Async Validators

```typescript
import { SignalAsyncValidator } from "../models/signal-form.model";
import { Observable, of, timer } from "rxjs";
import { map, switchMap } from "rxjs/operators";

// Create a custom async validator
const checkEmailAvailability: SignalAsyncValidator<MyModel, "email"> = (value, form) => {
  if (!value) return of(null);

  return timer(500).pipe(
    switchMap(() => fetch(`/api/check-email/${value}`)),
    switchMap((response) => response.json()),
    map((result) => (result.available ? null : "This email is already taken")),
  );
};

const field: SignalField<MyModel, "email"> = {
  name: "email",
  type: FormFieldType.TEXT,
  label: "Email Address",
  asyncValidators: [checkEmailAvailability],
};
```

### Validation Configuration

You can control when and how validation occurs:

```typescript
const field: SignalField<MyModel, "username"> = {
  name: "username",
  type: FormFieldType.TEXT,
  label: "Username",
  asyncValidators: [checkUsernameAvailability],
  validationConfig: {
    trigger: "blur", // When to trigger validation
    debounceMs: 500, // Delay before validation
    validateAsyncOnInit: false, // Don't validate on component init
  },
};
```

Or in the field config:

```typescript
const field: SignalField<MyModel, "email"> = {
  name: "email",
  type: FormFieldType.TEXT,
  label: "Email",
  config: {
    validation: {
      trigger: "change", // Validate on every change
      debounceMs: 300, // With 300ms debounce
    },
  },
  asyncValidators: [checkEmailAvailability],
};
```

## Validation Triggers

### `'change'` (default)

Validates whenever the field value changes, with optional debouncing:

```typescript
validationConfig: {
  trigger: 'change',
  debounceMs: 300  // Wait 300ms after user stops typing
}
```

### `'blur'`

Validates only when the field loses focus:

```typescript
validationConfig: {
  trigger: "blur";
}
```

### `'submit'`

Validates only when the form is submitted:

```typescript
validationConfig: {
  trigger: "submit";
}
```

## Creating Custom Async Validators

### Email Availability Validator

```typescript
import { SignalAsyncValidator } from "../models/signal-form.model";
import { Observable, of, timer } from "rxjs";
import { map, switchMap, catchError } from "rxjs/operators";

export function createEmailValidator<TModel, K extends keyof TModel>(checkEmailFn: (email: string) => Promise<boolean> | Observable<boolean>, errorMessage: string = "This email is already registered"): SignalAsyncValidator<TModel, K> {
  return (value: TModel[K], form: SignalFormContainer<TModel>) => {
    if (!value) {
      return of(null);
    }

    const result = checkEmailFn(value as string);
    const obs$ = result instanceof Promise ? of(result).pipe(switchMap((p) => p)) : result;

    return obs$.pipe(
      map((isAvailable) => (isAvailable ? null : errorMessage)),
      catchError(() => of("Unable to verify email availability")),
    );
  };
}
```

### Generic Uniqueness Validator

```typescript
export function createUniqueValidator<TModel, K extends keyof TModel>(checkFn: (value: TModel[K]) => Promise<boolean> | Observable<boolean>, errorMessage: string = "This value is already taken"): SignalAsyncValidator<TModel, K> {
  return (value: TModel[K], form: SignalFormContainer<TModel>) => {
    if (!value) {
      return of(null);
    }

    const result = checkFn(value);
    const obs$ = result instanceof Promise ? of(result).pipe(switchMap((p) => p)) : result;

    return obs$.pipe(map((isUnique) => (isUnique ? null : errorMessage)));
  };
}
```

### Remote Validation

```typescript
export function createRemoteValidator<TModel, K extends keyof TModel>(validateFn: (value: TModel[K], form: SignalFormContainer<TModel>) => Promise<string | null> | Observable<string | null>): SignalAsyncValidator<TModel, K> {
  return (value: TModel[K], form: SignalFormContainer<TModel>) => {
    const result = validateFn(value, form);
    return result instanceof Promise ? of(result).pipe(switchMap((p) => p)) : result;
  };
}
```

## Validation States

Fields with async validators have additional state signals:

- `field.validating()` - true while async validation is running
- `field.asyncError()` - async validation error message
- `field.error()` - sync validation error message

The combined error (sync + async) can be retrieved using:

```typescript
const error = validationService.getCombinedError(field);
```

## UI Feedback

The form input component automatically shows:

- A spinner icon while validating
- Yellow border and background during validation
- "Validating..." message below the field
- Error messages from async validators

## Configuration Priority

Validation configuration is resolved in this order:

1. Field-level `validationConfig`
2. Field config `validation` property
3. Default values (`trigger: 'change'`, `debounceMs: 300`)

## Performance Considerations

1. **Debouncing**: Always use appropriate debounce delays for `'change'` triggers
2. **Trigger Selection**: Use `'blur'` for expensive validations
3. **Caching**: Consider implementing caching in your validation functions
4. **Cleanup**: The validation service automatically cleans up subscriptions

## Complete Example: Email Validation

```typescript
import { timer, of } from "rxjs";
import { map, catchError, switchMap } from "rxjs/operators";

// Mock API call
const checkEmailAvailability = (email: string) => {
  return timer(100).pipe(
    // Simulate network delay
    switchMap(() => fetch(`/api/users/check-email?email=${encodeURIComponent(email)}`).then((response) => response.json())),
    map((result) => result.available),
    catchError(() => of(false)), // Assume unavailable on error
  );
};

// Create the validator
const emailAvailabilityValidator: SignalAsyncValidator<UserModel, "email"> = (value, form) => {
  if (!value || typeof value !== "string") {
    return of(null);
  }

  return checkEmailAvailability(value).pipe(map((isAvailable) => (isAvailable ? null : "This email is already registered")));
};

// Use in field definition
const emailField: SignalField<UserModel, "email"> = {
  name: "email",
  type: FormFieldType.TEXT,
  label: "Email Address",
  validators: [required("Email is required"), email("Please enter a valid email")],
  asyncValidators: [emailAvailabilityValidator],
  validationConfig: {
    trigger: "blur",
    debounceMs: 300,
    validateAsyncOnInit: false,
  },
};
```

This setup provides a great user experience:

- Immediate feedback for format errors (sync)
- Efficient availability checking only on blur
- Visual feedback during validation
- No unnecessary API calls while typing
