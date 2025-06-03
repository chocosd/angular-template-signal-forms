import { computed, signal } from '@angular/core';
import { FormFieldType } from '@enums/form-field-type.enum';
import { type RuntimeRadioSignalField } from '@models/signal-field-types.model';
import {
  type FormOption,
  type SignalFormContainer,
} from '@models/signal-form.model';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { createMockForm } from '../../../testing/mock-form.helper';
import { SignalFormRadioFieldComponent } from './signal-form-radio-field.component';

interface TestModel {
  size: string;
}

describe('SignalFormRadioFieldComponent', () => {
  let spectator: Spectator<SignalFormRadioFieldComponent<TestModel, 'size'>>;
  let mockField: RuntimeRadioSignalField<TestModel, 'size'>;
  let mockForm: SignalFormContainer<TestModel>;

  const createComponent = createComponentFactory<
    SignalFormRadioFieldComponent<TestModel, 'size'>
  >({
    component: SignalFormRadioFieldComponent,
    shallow: true,
  });

  beforeEach(() => {
    mockForm = createMockForm<TestModel>({ size: '' });

    mockField = {
      name: 'size',
      label: 'Size',
      type: FormFieldType.RADIO,
      error: signal(null),
      touched: signal(false),
      dirty: signal(false),
      focus: signal(false),
      value: signal(''),
      getForm: () => mockForm,
      path: 'size',
      isDisabled: computed(() => false),
      isHidden: computed(() => false),
      options: computed<FormOption<string>[]>(() => [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ]),
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

  it('should render fieldset with proper attributes', () => {
    const fieldset = spectator.query('fieldset');
    expect(fieldset).toBeTruthy();
    expect(fieldset?.classList.contains('form-radio-group')).toBe(true);
  });

  it('should render legend with field label', () => {
    const legend = spectator.query('legend');
    expect(legend?.textContent?.trim()).toBe('Size');
    expect(legend?.classList.contains('sr-only')).toBe(true);
  });

  it('should render all radio options', () => {
    const radios = spectator.queryAll('input[type="radio"]');
    const labels = spectator.queryAll('.form-radio-option');

    expect(radios.length).toBe(3);
    expect(labels.length).toBe(3);
    expect(labels[0].textContent?.trim()).toContain('Small');
    expect(labels[1].textContent?.trim()).toContain('Medium');
    expect(labels[2].textContent?.trim()).toContain('Large');
  });

  it('should set name attribute on all radios', () => {
    const radios = spectator.queryAll(
      'input[type="radio"]',
    ) as HTMLInputElement[];

    radios.forEach((radio) => {
      expect(radio.name).toBe('size');
    });
  });
});
