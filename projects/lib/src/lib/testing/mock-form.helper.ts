import { signal } from '@angular/core';
import { FormStatus } from '../enums/form-status.enum';
import { type SignalFormContainer } from '../models/signal-form.model';

export function createMockForm<TModel extends Record<string, any>>(
  initialValue: TModel,
): SignalFormContainer<TModel> {
  return {
    fields: [],
    getField: jest.fn(),
    getValue: jest.fn(),
    getRawValue: jest.fn(),
    getErrors: jest.fn().mockReturnValue({}),
    validateForm: jest.fn(),
    reset: jest.fn(),
    save: jest.fn(),
    value: signal(initialValue),
    rawValue: signal(initialValue),
    status: signal<FormStatus>(FormStatus.Idle),
    anyTouched: signal(false),
    anyDirty: signal(false),
    hasSaved: signal(false),
    patchValue: jest.fn(),
    setValue: jest.fn(),
    config: { layout: 'flex' },
    parentForm: null,
  } as unknown as SignalFormContainer<TModel>;
}
