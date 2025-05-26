// # region
import { computed, signal } from '@angular/core';
import { FormStatus } from '@enums/form-status.enum';
import {
  type ErrorMessage,
  type SignalFormConfig,
  type SignalFormContainer,
  type SignalFormField,
  type SignalFormFieldBuilderInput,
  type SignalFormFieldForKey,
  type SignalSteppedFormConfig,
  type SignalSteppedFormContainer,
} from '@models/signal-form.model';
import { FormEngine } from '../engine/form-engine';
import { FieldFactory } from '../factory/field-factory';
import { FieldUtils } from '../utils/field-utils';
// #endregion
export class FormBuilder {
  static createForm<TModel, TParentModel = unknown>(args: {
    model: TModel;
    fields: SignalFormFieldBuilderInput<TModel>[];
    title?: string;
    config?: SignalFormConfig<TModel>;
    onSave?: (value: TModel) => void;
    parentForm?: SignalFormContainer<any>;
    parentPath?: string;
  }): SignalFormContainer<TModel> {
    // 👇 Create a mutable object early
    const form: Partial<SignalFormContainer<TModel>> = {};
    const status = signal<FormStatus>(FormStatus.Idle);

    // 👇 Safe because 'form' is already declared
    const fields: SignalFormField<TModel>[] = args.fields.map((field) =>
      FieldFactory.build(
        field,
        args.model,
        form as SignalFormContainer<TModel>,
      ),
    );

    // 👇 Complete the object with all methods
    Object.assign(form, {
      title: args.title,
      status,
      fields,
      getField: FormEngine.getField(fields),
      anyTouched: FieldUtils.anyTouched(fields),
      anyDirty: FieldUtils.anyDirty(fields),
      value: computed(() =>
        FormEngine.getValueFromFields(
          fields,
          form as SignalFormContainer<TModel>,
        ),
      ),
      rawValue: FormEngine.getRawValue(fields),
      getValue: () => (form as SignalFormContainer<TModel>).value(),
      getRawValue: () => (form as SignalFormContainer<TModel>).rawValue(),
      hasSaved: () => FieldUtils.hasSaved(form as SignalFormContainer<TModel>),
      validateForm: FormEngine.validateForm(
        fields,
        form as SignalFormContainer<TModel>,
      ),
      reset: FormEngine.resetForm(fields, { ...args.model }),
      getErrors: FormEngine.getErrors(fields),
      config: args.config ?? {},
      patchValue: FormEngine.patchForm(fields),
      setValue: FormEngine.setFormValue(fields),
      save: FormEngine.runSaveHandler(
        fields,
        status,
        form as SignalFormContainer<TModel>,
        args.onSave,
      ),
      getParent: () => args.parentForm,
    });

    return form as SignalFormContainer<TModel>;
  }

  static createSteppedForm<TModel>(args: {
    model: TModel;
    steps: {
      fields: SignalFormFieldBuilderInput<TModel>[];
      config?: SignalFormConfig<TModel>;
      title?: string;
      description?: string;
    }[];
    onSave?: (value: TModel) => void;
    config?: SignalSteppedFormConfig<TModel>;
  }): SignalSteppedFormContainer<TModel> {
    const currentStep = signal(0);
    const status = signal<FormStatus>(FormStatus.Idle);

    const steps: SignalFormContainer<TModel>[] = args.steps.map((step) =>
      FormBuilder.createForm({
        model: args.model,
        fields: step.fields,
        config: step.config,
      }),
    );

    const value = computed(() =>
      steps.reduce(
        (acc, step) => ({ ...acc, ...step.getValue() }),
        {} as TModel,
      ),
    );

    const validateStep = () => steps[currentStep()].validateForm();
    const isValidStep = () =>
      steps[currentStep()].fields.every((f) => !f.error());
    const validateAll = () => steps.every((step) => step.validateForm());

    const getErrors = (): ErrorMessage<TModel>[] =>
      steps.flatMap((step) =>
        step.getErrors().map(({ name, message }: ErrorMessage<TModel>) => ({
          name,
          message,
        })),
      );

    const getField = <K extends keyof TModel>(
      key: K,
    ): SignalFormFieldForKey<TModel, K> => {
      const allFields = steps.flatMap((step) => step.fields);
      return allFields.find(
        (f) => f.name === key,
      ) as unknown as SignalFormFieldForKey<TModel, K>;
    };

    const reset = () => steps.forEach((step) => step.reset());

    const anyTouched = computed(() => steps.some((step) => step.anyTouched()));
    const anyDirty = computed(() => steps.some((step) => step.anyDirty()));
    const hasSaved = computed(
      () => !anyDirty() && !anyTouched() && status() === FormStatus.Success,
    );

    const allFields = steps.flatMap((s) => s.fields);
    const virtualForm = {
      ...steps[0],
      fields: allFields,
      getValue: () => value(),
      anyDirty: computed(() => steps.some((s) => s.anyDirty())),
      anyTouched: computed(() => steps.some((s) => s.anyTouched())),
      config: args.config,
    } as SignalFormContainer<TModel>;

    return {
      anyTouched,
      anyDirty,
      steps,
      currentStep,
      value,
      getValue: () => value(),
      validateStep,
      validateAll,
      isValidStep,
      getErrors,
      getField,
      hasSaved,
      reset,
      save: FormEngine.runSaveHandler(
        allFields,
        status,
        virtualForm,
        args.onSave,
      ),
      status,
      config: {
        ...args.config,
        canSkipIncompleteSteps: args.config?.canSkipIncompleteSteps ?? false,
      },
    };
  }
}
