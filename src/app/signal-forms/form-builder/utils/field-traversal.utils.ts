import {
  SignalFormContainer,
  SignalFormField,
} from '../../models/signal-form.model';

interface FieldWithForm<T> {
  form: SignalFormContainer<T>;
}

interface FieldWithRepeatableForms<T> {
  repeatableForms: () => SignalFormContainer<T>[];
}

export class FieldTraversalUtils {
  static findFieldByPath<TModel>(
    form: SignalFormContainer<TModel>,
    path: string,
  ): SignalFormField<TModel> | undefined {
    const segments = path.split('.');
    let currentField: SignalFormField<TModel> | undefined;
    let currentForm: SignalFormContainer<TModel> = form;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];

      // Check if we're dealing with an array index
      const isArrayIndex = !isNaN(Number(segment));

      if (
        isArrayIndex &&
        currentField &&
        this.isRepeatableField(currentField)
      ) {
        // Handle repeatable field array index
        const index = Number(segment);
        const forms = currentField.repeatableForms();
        if (Array.isArray(forms) && forms[index]) {
          currentForm = forms[index];
          continue;
        }
      }

      // Try to find the field in the current form
      currentField = currentForm.fields.find((f) => f.name === segment) as
        | SignalFormField<TModel>
        | undefined;

      if (!currentField) {
        return undefined;
      }

      // If this isn't the last segment and we have a nested form, update currentForm
      if (i < segments.length - 1) {
        if (this.isFieldWithForm(currentField)) {
          // Handle nested form
          currentForm = currentField.form;
        } else if (this.isRepeatableField(currentField)) {
          // Wait for next iteration to handle array index
          continue;
        } else {
          // Can't traverse further
          return undefined;
        }
      }
    }

    return currentField;
  }

  private static isFieldWithForm<T>(
    field: SignalFormField<T>,
  ): field is SignalFormField<T> & FieldWithForm<T> {
    return 'form' in field && this.isSignalFormContainer(field.form);
  }

  private static isRepeatableField<T>(
    field: SignalFormField<T>,
  ): field is SignalFormField<T> & FieldWithRepeatableForms<T> {
    return (
      'repeatableForms' in field &&
      typeof (field as any).repeatableForms === 'function'
    );
  }

  private static isSignalFormContainer<T>(
    value: unknown,
  ): value is SignalFormContainer<T> {
    return (
      value !== null &&
      typeof value === 'object' &&
      'fields' in (value as object) &&
      Array.isArray((value as SignalFormContainer<T>).fields) &&
      'getField' in (value as object) &&
      typeof (value as SignalFormContainer<T>).getField === 'function'
    );
  }
}
