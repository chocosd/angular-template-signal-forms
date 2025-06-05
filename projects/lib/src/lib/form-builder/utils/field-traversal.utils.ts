import {
  type FieldWithFormTraversal,
  type FieldWithRepeatableForms,
  type SignalFormContainer,
  type SignalFormField,
} from '../../models/signal-form.model';

export class FieldTraversalUtils {
  static findFieldByPath<TModel>(
    form: SignalFormContainer<TModel>,
    path: string,
  ): SignalFormField<TModel> | undefined {
    const segments = this.parsePath(path);
    let currentField: SignalFormField<TModel> | undefined;
    let currentForm: SignalFormContainer<TModel> = form;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];

      if (segment.type === 'field') {
        currentField = currentForm.fields.find(
          (f) => f.name === segment.name,
        ) as SignalFormField<TModel> | undefined;

        if (!currentField) {
          return undefined;
        }

        if (i < segments.length - 1) {
          if (this.isFieldWithForm(currentField)) {
            currentForm = currentField.form;
          } else if (this.isRepeatableField(currentField)) {
            continue;
          } else {
            return undefined;
          }
        }
      } else if (segment.type === 'index') {
        if (currentField && this.isRepeatableField(currentField)) {
          const forms = currentField.repeatableForms();

          if (Array.isArray(forms) && forms[segment.index]) {
            currentForm = forms[segment.index];
          } else {
            return undefined;
          }
        } else {
          return undefined;
        }
      }
    }

    return currentField;
  }

  private static parsePath(
    path: string,
  ): Array<{ type: 'field'; name: string } | { type: 'index'; index: number }> {
    const segments: Array<
      { type: 'field'; name: string } | { type: 'index'; index: number }
    > = [];
    const parts = path.split(/[\.\[\]]+/).filter(Boolean);

    let i = 0;
    while (i < parts.length) {
      const part = parts[i];

      if (!isNaN(Number(part))) {
        segments.push({ type: 'index', index: Number(part) });
      } else {
        segments.push({ type: 'field', name: part });
      }
      i++;
    }

    return segments;
  }

  private static isFieldWithForm<T>(
    field: SignalFormField<T>,
  ): field is SignalFormField<T> & FieldWithFormTraversal<T> {
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
