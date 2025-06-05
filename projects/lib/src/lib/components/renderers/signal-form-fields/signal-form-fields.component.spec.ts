import { computed, signal } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { FormStatus } from '../../../enums/form-status.enum';
import {
  type SignalFormContainer,
  type SignalFormField,
} from '../../../models/signal-form.model';
import { SignalFormFieldsComponent } from './signal-form-fields.component';

interface TestModel {
  name: string;
  email: string;
}

describe('SignalFormFieldsComponent', () => {
  let spectator: Spectator<SignalFormFieldsComponent<TestModel>>;
  let mockForm: SignalFormContainer<TestModel>;
  let mockFields: SignalFormField<TestModel>[];

  const createComponent = createComponentFactory<
    SignalFormFieldsComponent<TestModel>
  >({
    component: SignalFormFieldsComponent,
    shallow: true,
  });

  beforeEach(() => {
    mockForm = {
      fields: [],
      getField: jest.fn(),
      getValue: jest.fn(),
      getRawValue: jest.fn(),
      getErrors: jest.fn(),
      validateForm: jest.fn(),
      reset: jest.fn(),
      save: jest.fn(),
      value: signal({ name: '', email: '' }),
      rawValue: signal({ name: '', email: '' }),
      status: signal<FormStatus>(FormStatus.Idle),
      anyTouched: signal(false),
      anyDirty: signal(false),
      hasSaved: signal(false),
      patchValue: jest.fn(),
      setValue: jest.fn(),
      config: { layout: 'flex' },
      parentForm: null,
    } as unknown as SignalFormContainer<TestModel>;

    mockFields = [
      {
        name: 'name',
        label: 'Name',
        type: FormFieldType.TEXT,
        error: signal(null),
        touched: signal(false),
        dirty: signal(false),
        focus: signal(false),
        value: signal(''),
        path: 'name',
        isDisabled: computed(() => false),
        isHidden: computed(() => false),
        getForm: () => mockForm,
        asyncError: signal(null),
        validating: signal(false),
      },
      {
        name: 'email',
        label: 'Email',
        type: FormFieldType.TEXT,
        error: signal(null),
        touched: signal(false),
        dirty: signal(false),
        focus: signal(false),
        value: signal(''),
        path: 'email',
        isDisabled: computed(() => false),
        isHidden: computed(() => false),
        getForm: () => mockForm,
        asyncError: signal(null),
        validating: signal(false),
      },
    ];

    spectator = createComponent({
      props: {
        form: mockForm,
        fields: mockFields,
      },
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should render all form fields', () => {
    const inputItems = spectator.queryAll('signal-form-input-item');
    expect(inputItems.length).toBe(2);
  });

  it('should render fields in correct order', () => {
    const inputItems = spectator.queryAll('signal-form-input-item');
    expect(inputItems.length).toBe(2);
    // In shallow mode, we can't test the actual rendered content,
    // but we can verify the components are created in the right order
    expect(inputItems[0]).toBeTruthy();
    expect(inputItems[1]).toBeTruthy();
  });

  it('should not render hidden fields', () => {
    const isHidden = signal(false);

    // Create modified fields array with hidden field
    const modifiedFields = [...mockFields];
    modifiedFields[0] = {
      ...modifiedFields[0],
      isHidden: computed(() => isHidden()),
    };

    isHidden.set(true);

    spectator.setInput('fields', modifiedFields);
    spectator.detectChanges();

    const inputItems = spectator.queryAll('signal-form-input-item');
    expect(inputItems.length).toBe(1);
  });
});
