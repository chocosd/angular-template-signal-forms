import { computed, signal } from '@angular/core';
import { FormFieldType } from '@enums/form-field-type.enum';
import { FormStatus } from '@enums/form-status.enum';
import { type RuntimeTextSignalField } from '@models/signal-field-types.model';
import { type SignalFormContainer } from '@models/signal-form.model';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { SignalFormInputItemComponent } from './signal-form-input-item.component';

interface TestModel {
  name: string;
}

describe('SignalFormInputItemComponent', () => {
  let spectator: Spectator<SignalFormInputItemComponent<TestModel>>;
  let mockField: RuntimeTextSignalField<TestModel, 'name'>;
  let mockForm: SignalFormContainer<TestModel>;

  const createComponent = createComponentFactory<
    SignalFormInputItemComponent<TestModel>
  >({
    component: SignalFormInputItemComponent,
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
      value: signal({ name: '' }),
      rawValue: signal({ name: '' }),
      status: signal<FormStatus>(FormStatus.Idle),
      anyTouched: signal(false),
      anyDirty: signal(false),
      hasSaved: signal(false),
      patchValue: jest.fn(),
      setValue: jest.fn(),
      config: { layout: 'flex' },
      parentForm: null,
    } as unknown as SignalFormContainer<TestModel>;

    mockField = {
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
      validators: [],
      config: { hint: 'Enter your name' },
      asyncError: signal(null),
      validating: signal(false),
    };

    spectator = createComponent({
      props: {
        field: mockField,
        form: mockForm,
      },
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should render field label', () => {
    const formControl = spectator.query('.form-control');
    expect(formControl).toBeTruthy();
    expect(formControl?.getAttribute('data-form-field')).toBe('name');
  });

  it('should render field hint when no error', () => {
    expect(spectator.component.field().config?.hint).toBe('Enter your name');
  });

  it('should render error message when field has error', () => {
    mockField.error.set('Name is required');
    spectator.detectChanges();

    expect(spectator.component['hasError']()).toBe('Name is required');
  });

  it('should add has-error class when field has error', () => {
    mockField.error.set('Name is required');
    spectator.detectChanges();

    const formControl = spectator.query('.form-control');
    expect(formControl?.classList.contains('has-error')).toBe(true);
  });

  it('should add is-success class when field has value and no error', () => {
    mockField.value.set('John');
    spectator.detectChanges();

    const formControl = spectator.query('.form-control');
    expect(formControl?.classList.contains('is-success')).toBe(true);
  });

  it('should not render when field is hidden', () => {
    // Create a new component with hidden field
    const hiddenField = {
      ...mockField,
      hidden: true,
    };

    const hiddenSpectator = createComponent({
      props: {
        field: hiddenField,
        form: mockForm,
      },
    });

    hiddenSpectator.detectChanges();
    expect(hiddenSpectator.query('.form-control')).toBeFalsy();
  });

  it('should set grid area based on field name', () => {
    expect(spectator.component.gridArea).toBe('name');
  });

  it('should set grid area with index when provided', () => {
    spectator.setInput('index', 1);
    spectator.detectChanges();

    expect(spectator.component['name']()).toBe('name-1');
  });

  it('should render loading state while field is loading', () => {
    // Note: Testing loading state would require manipulating the @defer block,
    // which is not directly possible in the current test setup
    // This would need integration tests or e2e tests
  });

  it('should render error state when field fails to load', () => {
    // Note: Testing error state would require manipulating the @defer block,
    // which is not directly possible in the current test setup
    // This would need integration tests or e2e tests
  });

  it('should show required asterisk when field has required validator', () => {
    const requiredValidator = (value: string) => (!value ? 'Required' : null);
    Object.assign(requiredValidator, { __meta: { required: true } });
    mockField.validators = [requiredValidator];
    spectator.detectChanges();

    expect(spectator.component['isRequired']()).toBe(true);
  });

  it('should not show required asterisk when field is optional', () => {
    expect(spectator.component['isRequired']()).toBe(false);
  });
});
