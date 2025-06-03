import {
  type SignalFormContainer,
  type SignalFormField,
} from '@models/signal-form.model';

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
    console.log('FieldTraversalUtils: searching for path:', path);
    const segments = this.parsePath(path);
    console.log('FieldTraversalUtils: parsed segments:', segments);
    let currentField: SignalFormField<TModel> | undefined;
    let currentForm: SignalFormContainer<TModel> = form;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      console.log(`FieldTraversalUtils: processing segment ${i}:`, segment);

      if (segment.type === 'field') {
        currentField = currentForm.fields.find(
          (f) => f.name === segment.name,
        ) as SignalFormField<TModel> | undefined;

        console.log(
          `FieldTraversalUtils: found field for '${segment.name}':`,
          currentField?.name,
          currentField?.path,
        );

        if (!currentField) {
          console.log(
            'FieldTraversalUtils: field not found, returning undefined',
          );
          return undefined;
        }

        if (i < segments.length - 1) {
          if (this.isFieldWithForm(currentField)) {
            currentForm = currentField.form;
            console.log('FieldTraversalUtils: moved to nested form');
          } else if (this.isRepeatableField(currentField)) {
            console.log(
              'FieldTraversalUtils: found repeatable field, continuing',
            );
            continue;
          } else {
            console.log('FieldTraversalUtils: cannot traverse further');
            return undefined;
          }
        }
      } else if (segment.type === 'index') {
        if (currentField && this.isRepeatableField(currentField)) {
          const forms = currentField.repeatableForms();
          console.log(
            `FieldTraversalUtils: accessing index ${segment.index} from ${forms.length} forms`,
          );
          if (Array.isArray(forms) && forms[segment.index]) {
            currentForm = forms[segment.index];
            console.log(
              'FieldTraversalUtils: moved to form at index',
              segment.index,
            );
          } else {
            console.log('FieldTraversalUtils: index out of bounds');
            return undefined;
          }
        } else {
          console.log(
            'FieldTraversalUtils: trying to access index but not on repeatable field',
          );
          return undefined;
        }
      }
    }

    console.log(
      'FieldTraversalUtils: returning field:',
      currentField?.name,
      currentField?.path,
    );
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
