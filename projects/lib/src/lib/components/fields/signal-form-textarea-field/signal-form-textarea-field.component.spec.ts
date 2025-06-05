import { computed, signal } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { type RuntimeTextAreaSignalField } from '../../../models/signal-field-types.model';
import { type SignalFormContainer } from '../../../models/signal-form.model';
import { createMockForm } from '../../../testing/mock-form.helper';
import { SignalFormTextareaFieldComponent } from './signal-form-textarea-field.component';

interface TestModel {
  description: string;
}

describe('SignalFormTextareaFieldComponent', () => {
  let spectator: Spectator<
    SignalFormTextareaFieldComponent<TestModel, 'description'>
  >;
  let mockField: RuntimeTextAreaSignalField<TestModel, 'description'>;
  let mockForm: SignalFormContainer<TestModel>;

  const createComponent = createComponentFactory<
    SignalFormTextareaFieldComponent<TestModel, 'description'>
  >({
    component: SignalFormTextareaFieldComponent,
    shallow: true,
  });

  beforeEach(() => {
    mockForm = createMockForm<TestModel>({ description: '' });

    mockField = {
      name: 'description',
      label: 'Description',
      type: FormFieldType.TEXTAREA,
      error: signal(null),
      touched: signal(false),
      dirty: signal(false),
      focus: signal(false),
      value: signal(''),
      getForm: () => mockForm,
      path: 'description',
      isDisabled: computed(() => false),
      isHidden: computed(() => false),
      config: {},
    } as any;

    spectator = createComponent({
      props: {
        field: mockField,
      },
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should render input wrapper with correct class', () => {
    const wrapper = spectator.query('.form-input-wrapper');
    expect(wrapper).toBeTruthy();
  });

  it('should render textarea with correct attributes', () => {
    const textarea = spectator.query('textarea');
    expect(textarea).toBeTruthy();
    expect(textarea?.classList.contains('form-input')).toBe(true);
  });

  it('should display current field value', () => {
    const testValue = 'This is a test description';
    mockField.value.set(testValue);
    spectator.detectChanges();

    const textarea = spectator.query('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe(testValue);
  });

  it('should update field value on input', () => {
    const textarea = spectator.query('textarea') as HTMLTextAreaElement;
    const newValue = 'Updated description';
    spectator.typeInElement(newValue, textarea);

    expect(mockField.value()).toBe(newValue);
  });

  it('should handle multiline text', () => {
    const multilineText = 'Line 1\nLine 2\nLine 3';
    mockField.value.set(multilineText);
    spectator.detectChanges();

    const textarea = spectator.query('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe(multilineText);
  });

  it('should handle empty value', () => {
    mockField.value.set('');
    spectator.detectChanges();

    const textarea = spectator.query('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe('');
  });

  it('should handle null value', () => {
    mockField.value.set(null as any);
    spectator.detectChanges();

    const textarea = spectator.query('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe('');
  });

  it('should handle long text content', () => {
    const longText = 'A'.repeat(1000);
    mockField.value.set(longText);
    spectator.detectChanges();

    const textarea = spectator.query('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe(longText);
  });

  it('should handle special characters', () => {
    const specialText = 'Special chars: !@#$%^&*()_+-={}[]|\\:";\'<>?,./';
    mockField.value.set(specialText);
    spectator.detectChanges();

    const textarea = spectator.query('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe(specialText);
  });
});
