// field-factory.ts
import { computed, signal } from '@angular/core';
import { FormFieldType } from '@enums/form-field-type.enum';
import {
  type BaseFieldState,
  type FormOption,
  type ItemOf,
  type NestedGroupBuilderField,
  type RepeatableGroupBuilderField,
  type RepeatableGroupSignalFormField,
  type SignalFormContainer,
  type SignalFormField,
  type SignalFormFieldBuilderInput,
} from '@models/signal-form.model';
import { FormBuilder } from '../builder/form-builder';

type FieldWithOptions = {
  type:
    | FormFieldType.SELECT
    | FormFieldType.RADIO
    | FormFieldType.CHECKBOX
    | FormFieldType.CHECKBOX_GROUP
    | FormFieldType.MULTISELECT
    | FormFieldType.CHIPLIST;
  options: FormOption[];
};

export class FieldFactory {
  static build<TModel>(
    field: SignalFormFieldBuilderInput<TModel>,
    model: TModel,
    formRef: SignalFormContainer<TModel>,
    parentPath = '',
  ): SignalFormField<TModel> {
    const rawValue = model[field.name as keyof TModel];
    const referencePath = parentPath
      ? `${parentPath}.${String(field.name)}`
      : `${String(field.name)}`;

    const baseFieldState: BaseFieldState<TModel, TModel[keyof TModel]> = {
      path: referencePath,
      error: signal<string | null>(null),
      touched: signal<boolean>(false),
      dirty: signal<boolean>(false),
      focus: signal<boolean>(false),
      value: signal(rawValue),
      getForm: () => formRef,
      isDisabled: computed(() =>
        typeof field.disabled === 'function'
          ? field.disabled(formRef)
          : (field.disabled ?? false),
      ),
      isHidden: computed(() =>
        typeof field.hidden === 'function'
          ? field.hidden(formRef)
          : (field.hidden ?? false),
      ),
    };

    // Handle Repeatable Group
    if (this.isRepeatableGroupField(field)) {
      return this.buildRepeatableGroup(
        { ...field, path: referencePath },
        rawValue,
        formRef,
        referencePath,
        baseFieldState,
      );
    }

    // Handle Nested Form Group
    if (this.isNestedGroupField(field)) {
      return this.buildNestedForm(
        { ...field, path: referencePath },
        rawValue,
        formRef,
        referencePath,
        baseFieldState,
      );
    }

    // Handle normal field
    let baseField = {
      ...field,
      ...baseFieldState,
      path: referencePath,
    } as SignalFormField<TModel>;

    // Handle options for fields that support them
    if (this.hasOptions(field)) {
      baseField = {
        ...baseField,
        options: signal(field.options),
      } as unknown as SignalFormField<TModel>;
    }

    return baseField;
  }

  private static isRepeatableGroupField<TModel>(
    field: SignalFormFieldBuilderInput<TModel>,
  ): field is Extract<
    SignalFormFieldBuilderInput<TModel>,
    RepeatableGroupBuilderField<TModel, keyof TModel>
  > {
    return 'type' in field && field.type === FormFieldType.REPEATABLE_GROUP;
  }

  private static isNestedGroupField<TModel>(
    field: SignalFormFieldBuilderInput<TModel>,
  ): field is Extract<
    SignalFormFieldBuilderInput<TModel>,
    NestedGroupBuilderField<TModel, keyof TModel>
  > {
    return (
      !('type' in field) && 'fields' in field && Array.isArray(field.fields)
    );
  }

  private static hasOptions<TModel>(
    field: SignalFormFieldBuilderInput<TModel>,
  ): field is SignalFormFieldBuilderInput<TModel> & FieldWithOptions {
    return (
      'type' in field &&
      'options' in field &&
      Array.isArray(field.options) &&
      [
        FormFieldType.SELECT,
        FormFieldType.RADIO,
        FormFieldType.CHECKBOX,
        FormFieldType.CHECKBOX_GROUP,
        FormFieldType.MULTISELECT,
        FormFieldType.CHIPLIST,
      ].includes(field.type as FormFieldType)
    );
  }

  private static buildRepeatableGroup<TModel>(
    field: RepeatableGroupBuilderField<TModel, keyof TModel>,
    rawValue: TModel[keyof TModel],
    parentForm: SignalFormContainer<TModel>,
    referencePath: string,
    baseFieldState: BaseFieldState<TModel, TModel[keyof TModel]>,
  ): SignalFormField<TModel> {
    const items = Array.isArray(rawValue) ? rawValue : [];
    type TItemType = ItemOf<TModel[keyof TModel]>;

    const repeatableForms = signal(
      items.map((item) =>
        FormBuilder.createForm<TItemType>({
          model: item,
          fields: field.fields,
          config: field.config ?? { layout: 'flex' },
          parentForm: parentForm as unknown as SignalFormContainer<unknown>,
        }),
      ),
    );

    const repeatableField: RepeatableGroupSignalFormField<
      TModel,
      keyof TModel
    > = {
      ...field,
      error: signal(false),
      touched: signal(false),
      dirty: signal(false),
      value: computed(() => repeatableForms().map((f) => f.getValue())),
      repeatableForms,
      addItem: (initial = {} as TItemType) => {
        const newForm = FormBuilder.createForm<TItemType>({
          model: initial,
          fields: field.fields,
          config: field.config ?? { layout: 'flex' },
          parentForm: parentForm as unknown as SignalFormContainer<unknown>,
        });

        repeatableForms.update((forms) => [...forms, newForm]);
        repeatableField.dirty.set(true);
        repeatableField.touched.set(true);
      },
      removeItem: (index: number) => {
        repeatableForms.update((forms) => forms.filter((_, i) => i !== index));
        repeatableField.dirty.set(true);
        repeatableField.touched.set(true);
      },
    };

    return repeatableField as unknown as SignalFormField<TModel>;
  }

  private static buildNestedForm<TModel>(
    field: NestedGroupBuilderField<TModel, keyof TModel>,
    rawValue: TModel[keyof TModel],
    parentForm: SignalFormContainer<TModel>,
    referencePath: string,
    baseFieldState: BaseFieldState<TModel, TModel[keyof TModel]>,
  ): SignalFormField<TModel> {
    type TNestedType = TModel[keyof TModel];

    const nestedForm = FormBuilder.createForm<TNestedType>({
      model: rawValue,
      fields: field.fields,
      config: field.config ?? { layout: 'flex' },
      parentForm: parentForm as unknown as SignalFormContainer<unknown>,
    });

    const nestedField = {
      ...field,
      ...baseFieldState,
      form: nestedForm,
      fields: nestedForm.fields,
    };

    return nestedField as unknown as SignalFormField<TModel>;
  }
}
