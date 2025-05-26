// field-factory.ts
import { computed, isSignal, signal, WritableSignal } from '@angular/core';
import { FormFieldType } from '@enums/form-field-type.enum';
import {
  FormOption,
  ItemOf,
  RepeatableGroupBuilderField,
  RepeatableGroupSignalFormField,
  SignalFormConfig,
  SignalFormContainer,
  SignalFormField,
  SignalFormFieldBuilderInput,
} from '@models/signal-form.model';
import { FormBuilder } from '../builder/form-builder';

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

    const baseField = {
      ...field,
      error: signal<string | null>(null),
      touched: signal<boolean>(false),
      dirty: signal<boolean>(false),
      focus: signal<boolean>(false),
    } as unknown as SignalFormField<TModel>;

    // 🌀 Repeatable Group
    if (
      (field as RepeatableGroupBuilderField<TModel, keyof TModel>).type ===
      FormFieldType.REPEATABLE_GROUP
    ) {
      return this.buildRepeatableGroup(
        baseField as unknown as RepeatableGroupBuilderField<
          TModel,
          keyof TModel
        >,
        rawValue,
        formRef,
        referencePath,
      ) as unknown as SignalFormField<TModel>;
    }

    // 🧱 Nested Form Group
    if ('fields' in field && Array.isArray(field.fields)) {
      return this.buildNestedForm(baseField, rawValue, formRef, referencePath);
    }

    // 🧠 Normal field: assign value
    baseField.value = signal(rawValue);

    // 🧠 Attach signal-wrapped options if needed
    if ('options' in field && Array.isArray(field.options)) {
      (
        baseField as unknown as SignalFormField<TModel> & {
          options: WritableSignal<FormOption[]> | FormOption[];
        }
      ).options = isSignal(field.options)
        ? field.options
        : signal(field.options);
    }

    return baseField;
  }

  private static buildRepeatableGroup<TModel, TParent>(
    baseField: RepeatableGroupBuilderField<TModel, keyof TModel>,
    rawValue: TModel[keyof TModel],
    parentForm?: SignalFormContainer<TParent>,
    referencePath?: string,
  ): RepeatableGroupSignalFormField<TModel, keyof TModel> {
    const items = Array.isArray(rawValue) ? rawValue : [];

    const repeatableForms = signal(
      items.map((item) =>
        FormBuilder.createForm({
          model: item,
          fields: baseField.fields,
          config: (baseField.config as SignalFormConfig<
            ItemOf<TModel[keyof TModel]>
          >) ?? { layout: 'flex' },
          parentForm,
        }),
      ),
    );

    const repeatableField: RepeatableGroupSignalFormField<
      TModel,
      keyof TModel
    > = {
      ...baseField,
      repeatableForms,
      addItem: (initial = {} as ItemOf<TModel[keyof TModel]>) => {
        const newForm = FormBuilder.createForm({
          model: initial as ItemOf<TModel[keyof TModel]>,
          fields: baseField.fields,
          config: (baseField.config as SignalFormConfig<
            ItemOf<TModel[keyof TModel]>
          >) ?? { layout: 'flex' },
        });

        (repeatableField as any).getParentForm = () => parentForm;
        repeatableForms.update((forms) => [...forms, newForm]);
        repeatableField.dirty.set(true);
        repeatableField.touched.set(true);
      },
      removeItem: (index: number) => {
        repeatableForms.update((forms) => forms.filter((_, i) => i !== index));
        repeatableField.dirty.set(true);
        repeatableField.touched.set(true);
      },
      value: computed(() => repeatableForms().map((f) => f.getValue())),
      error: signal(false),
      touched: signal(false),
      dirty: signal(false),
    };

    return repeatableField;
  }

  private static buildNestedForm<TModel, TParent>(
    baseField: any,
    rawValue: TModel[keyof TModel],
    parentForm?: SignalFormContainer<TParent>,
    referencePath?: string,
  ): any {
    const nestedForm = FormBuilder.createForm({
      model: rawValue,
      fields: baseField.fields as SignalFormFieldBuilderInput<
        TModel[keyof TModel]
      >[],
      config: baseField.config ?? { layout: 'flex' },
      parentForm,
    });

    baseField.form = nestedForm;
    baseField.fields = nestedForm.fields;
    baseField.value = computed(() => nestedForm.getValue());

    return baseField;
  }
}
