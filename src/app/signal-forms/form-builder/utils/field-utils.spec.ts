import { computed, signal } from '@angular/core';
import { FormFieldType } from '@enums/form-field-type.enum';
import { FormStatus } from '@enums/form-status.enum';
import type {
  SignalFormContainer,
  SignalFormField,
} from '@models/signal-form.model';
import { FieldUtils } from './field-utils';

interface TestModel {
  name: string;
  email: string;
  nested: {
    value: string;
  };
  items: Array<{ id: number; value: string }>;
}

describe('FieldUtils', () => {
  let mockForm: SignalFormContainer<TestModel>;

  beforeEach(() => {
    mockForm = {
      anyTouched: signal(false),
      anyDirty: signal(false),
      status: signal(FormStatus.Idle),
      fields: [],
    } as unknown as SignalFormContainer<TestModel>;
  });

  describe('anyTouched', () => {
    it('should return false when no fields are touched', () => {
      const fields: SignalFormField<TestModel>[] = [
        createMockField('name', false),
        createMockField('email', false),
      ];

      const anyTouchedComputed = FieldUtils.anyTouched(fields);

      expect(anyTouchedComputed()).toBe(false);
    });

    it('should return true when at least one field is touched', () => {
      const fields: SignalFormField<TestModel>[] = [
        createMockField('name', false),
        createMockField('email', true), // This field is touched
      ];

      const anyTouchedComputed = FieldUtils.anyTouched(fields);

      expect(anyTouchedComputed()).toBe(true);
    });

    it('should handle nested form fields', () => {
      const nestedForm = {
        anyTouched: signal(true),
      } as unknown as SignalFormContainer<TestModel['nested']>;

      const fieldWithForm = {
        ...createMockField('nested', false),
        form: nestedForm,
      };

      const fields = [fieldWithForm];
      const anyTouchedComputed = FieldUtils.anyTouched(fields);

      expect(anyTouchedComputed()).toBe(true);
    });

    it('should handle repeatable field groups', () => {
      const repeatableForm1 = {
        anyTouched: signal(false),
      } as unknown as SignalFormContainer<TestModel['items'][0]>;

      const repeatableForm2 = {
        anyTouched: signal(true),
      } as unknown as SignalFormContainer<TestModel['items'][0]>;

      const repeatableField = {
        ...createMockField('items', false),
        repeatableForms: signal([repeatableForm1, repeatableForm2]),
      };

      const fields = [repeatableField];
      const anyTouchedComputed = FieldUtils.anyTouched(fields);

      expect(anyTouchedComputed()).toBe(true);
    });

    it('should handle repeatable field itself being touched', () => {
      const repeatableForm = {
        anyTouched: signal(false),
      } as unknown as SignalFormContainer<TestModel['items'][0]>;

      const repeatableField = {
        ...createMockField('items', true),
        repeatableForms: signal([repeatableForm]),
      };

      const fields = [repeatableField];
      const anyTouchedComputed = FieldUtils.anyTouched(fields);

      expect(anyTouchedComputed()).toBe(true);
    });

    it('should be reactive to field changes', () => {
      const touchedSignal = signal(false);
      const field = {
        ...createMockField('name', false),
        touched: touchedSignal,
      };

      const fields = [field];
      const anyTouchedComputed = FieldUtils.anyTouched(fields);

      expect(anyTouchedComputed()).toBe(false);

      touchedSignal.set(true);
      expect(anyTouchedComputed()).toBe(true);
    });
  });

  describe('anyDirty', () => {
    it('should return false when no fields are dirty', () => {
      const fields: SignalFormField<TestModel>[] = [
        createMockField('name', false, false),
        createMockField('email', false, false),
      ];

      const anyDirtyComputed = FieldUtils.anyDirty(fields);

      expect(anyDirtyComputed()).toBe(false);
    });

    it('should return true when at least one field is dirty', () => {
      const fields: SignalFormField<TestModel>[] = [
        createMockField('name', false, false),
        createMockField('email', false, true),
      ];

      const anyDirtyComputed = FieldUtils.anyDirty(fields);

      expect(anyDirtyComputed()).toBe(true);
    });

    it('should handle nested form fields', () => {
      const nestedForm = {
        anyDirty: signal(true),
      } as unknown as SignalFormContainer<TestModel['nested']>;

      const fieldWithForm = {
        ...createMockField('nested', false, false),
        form: nestedForm,
      };

      const fields = [fieldWithForm];
      const anyDirtyComputed = FieldUtils.anyDirty(fields);

      expect(anyDirtyComputed()).toBe(true);
    });

    it('should handle repeatable field groups', () => {
      const repeatableForm1 = {
        anyDirty: signal(false),
      } as unknown as SignalFormContainer<TestModel['items'][0]>;

      const repeatableForm2 = {
        anyDirty: signal(true),
      } as unknown as SignalFormContainer<TestModel['items'][0]>;

      const repeatableField = {
        ...createMockField('items', false, false),
        repeatableForms: signal([repeatableForm1, repeatableForm2]),
      };

      const fields = [repeatableField];
      const anyDirtyComputed = FieldUtils.anyDirty(fields);

      expect(anyDirtyComputed()).toBe(true);
    });

    it('should handle repeatable field itself being dirty', () => {
      const repeatableForm = {
        anyDirty: signal(false),
      } as unknown as SignalFormContainer<TestModel['items'][0]>;

      const repeatableField = {
        ...createMockField('items', false, true),
        repeatableForms: signal([repeatableForm]),
      };

      const fields = [repeatableField];
      const anyDirtyComputed = FieldUtils.anyDirty(fields);

      expect(anyDirtyComputed()).toBe(true);
    });

    it('should be reactive to field changes', () => {
      const dirtySignal = signal(false);
      const field = {
        ...createMockField('name', false, false),
        dirty: dirtySignal,
      };

      const fields = [field];
      const anyDirtyComputed = FieldUtils.anyDirty(fields);

      expect(anyDirtyComputed()).toBe(false);

      dirtySignal.set(true);
      expect(anyDirtyComputed()).toBe(true);
    });
  });

  describe('hasSaved', () => {
    it('should return false when form is touched', () => {
      mockForm.anyTouched = signal(true);
      mockForm.anyDirty = signal(false);
      mockForm.status = signal(FormStatus.Success);

      const hasSavedComputed = FieldUtils.hasSaved(mockForm);

      expect(hasSavedComputed()).toBe(false);
    });

    it('should return false when form is dirty', () => {
      mockForm.anyTouched = signal(false);
      mockForm.anyDirty = signal(true);
      mockForm.status = signal(FormStatus.Success);

      const hasSavedComputed = FieldUtils.hasSaved(mockForm);

      expect(hasSavedComputed()).toBe(false);
    });

    it('should return false when form status is not success', () => {
      mockForm.anyTouched = signal(false);
      mockForm.anyDirty = signal(false);
      mockForm.status = signal(FormStatus.Idle);

      const hasSavedComputed = FieldUtils.hasSaved(mockForm);

      expect(hasSavedComputed()).toBe(false);
    });

    it('should return true when form is not touched, not dirty, and status is success', () => {
      mockForm.anyTouched = signal(false);
      mockForm.anyDirty = signal(false);
      mockForm.status = signal(FormStatus.Success);

      const hasSavedComputed = FieldUtils.hasSaved(mockForm);

      expect(hasSavedComputed()).toBe(true);
    });

    it('should be reactive to form state changes', () => {
      const touchedSignal = signal(true);
      const dirtySignal = signal(false);
      const statusSignal = signal(FormStatus.Success);

      mockForm.anyTouched = touchedSignal;
      mockForm.anyDirty = dirtySignal;
      mockForm.status = statusSignal;

      const hasSavedComputed = FieldUtils.hasSaved(mockForm);

      expect(hasSavedComputed()).toBe(false);

      touchedSignal.set(false);
      expect(hasSavedComputed()).toBe(true);

      dirtySignal.set(true);
      expect(hasSavedComputed()).toBe(false);

      dirtySignal.set(false);
      statusSignal.set(FormStatus.Idle);
      expect(hasSavedComputed()).toBe(false);

      statusSignal.set(FormStatus.Success);
      expect(hasSavedComputed()).toBe(true);
    });
  });

  describe('edge cases and combinations', () => {
    it('should handle nested form fields separately', () => {
      const nestedForm = {
        anyTouched: signal(false),
        anyDirty: signal(true),
      } as unknown as SignalFormContainer<TestModel['nested']>;

      const fieldWithForm = {
        ...createMockField('nested', false, false),
        form: nestedForm,
      };

      const fields = [fieldWithForm];

      const anyTouchedComputed = FieldUtils.anyTouched(fields);
      const anyDirtyComputed = FieldUtils.anyDirty(fields);

      expect(anyTouchedComputed()).toBe(false);
      expect(anyDirtyComputed()).toBe(true);
    });

    it('should handle repeatable form fields separately', () => {
      const repeatableForm = {
        anyTouched: signal(true),
        anyDirty: signal(false),
      } as unknown as SignalFormContainer<TestModel['items'][0]>;

      const repeatableField = {
        ...createMockField('items', false, false),
        repeatableForms: signal([repeatableForm]),
      };

      const fields = [repeatableField];

      const anyTouchedComputed = FieldUtils.anyTouched(fields);
      const anyDirtyComputed = FieldUtils.anyDirty(fields);

      expect(anyTouchedComputed()).toBe(true);
      expect(anyDirtyComputed()).toBe(false);
    });

    it('should handle empty fields array', () => {
      const fields: SignalFormField<TestModel>[] = [];

      const anyTouchedComputed = FieldUtils.anyTouched(fields);
      const anyDirtyComputed = FieldUtils.anyDirty(fields);

      expect(anyTouchedComputed()).toBe(false);
      expect(anyDirtyComputed()).toBe(false);
    });

    it('should handle fields with empty repeatable forms array', () => {
      const repeatableField = {
        ...createMockField('items', false, false),
        repeatableForms: signal([]),
      };

      const fields = [repeatableField];

      const anyTouchedComputed = FieldUtils.anyTouched(fields);
      const anyDirtyComputed = FieldUtils.anyDirty(fields);

      expect(anyTouchedComputed()).toBe(false);
      expect(anyDirtyComputed()).toBe(false);
    });
  });
});

function createMockField<TModel>(
  name: keyof TModel,
  touched: boolean,
  dirty: boolean = false,
): SignalFormField<TModel> {
  return {
    name,
    type: FormFieldType.TEXT,
    label: String(name),
    touched: signal(touched),
    dirty: signal(dirty),
    error: signal(null),
    value: signal(''),
    path: String(name),
    focus: signal(false),
    isDisabled: computed(() => false),
    isHidden: computed(() => false),
    getForm: () => ({}) as SignalFormContainer<TModel>,
    asyncError: signal(null),
    validating: signal(false),
  } as SignalFormField<TModel>;
}
