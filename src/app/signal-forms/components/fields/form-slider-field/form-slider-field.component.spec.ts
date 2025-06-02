import { computed, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { FormFieldType } from '@enums/form-field-type.enum';
import { type RuntimeSliderSignalField } from '@models/signal-field-types.model';
import { type SignalFormContainer } from '@models/signal-form.model';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { createMockForm } from '../../../testing/mock-form.helper';
import { FormSliderFieldComponent } from './form-slider-field.component';

interface TestModel {
  volume: number;
}

describe('FormSliderFieldComponent', () => {
  let spectator: Spectator<FormSliderFieldComponent<TestModel, 'volume'>>;
  let mockField: RuntimeSliderSignalField<TestModel, 'volume'>;
  let mockForm: SignalFormContainer<TestModel>;

  const createComponent = createComponentFactory<
    FormSliderFieldComponent<TestModel, 'volume'>
  >({
    component: FormSliderFieldComponent,
    shallow: true,
    schemas: [NO_ERRORS_SCHEMA],
  });

  beforeEach(() => {
    mockForm = createMockForm<TestModel>({ volume: 50 });

    mockField = {
      name: 'volume',
      label: 'Volume',
      type: FormFieldType.SLIDER,
      error: signal(null),
      touched: signal(false),
      dirty: signal(false),
      focus: signal(false),
      value: signal(50),
      getForm: () => mockForm,
      path: 'volume',
      isDisabled: computed(() => false),
      isHidden: computed(() => false),
      config: {
        min: 0,
        max: 100,
        step: 1,
      },
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

  it('should render slider wrapper', () => {
    const wrapper = spectator.query('.slider-wrapper');
    expect(wrapper).toBeTruthy();
  });

  it('should render range input with correct attributes', () => {
    const input = spectator.query('input[type="range"]');
    expect(input).toBeTruthy();
    expect(input?.classList.contains('slider')).toBe(true);
  });

  it('should display current field value', () => {
    mockField.value.set(75);
    spectator.detectChanges();

    const input = spectator.query('input') as HTMLInputElement;
    expect(input.valueAsNumber).toBe(75);
  });

  it('should display value text next to slider', () => {
    mockField.value.set(25);
    spectator.detectChanges();

    const wrapper = spectator.query('.slider-wrapper');
    expect(wrapper?.textContent?.trim()).toContain('25');
  });

  it('should update field value when slider is moved', () => {
    const input = spectator.query('input') as HTMLInputElement;
    spectator.typeInElement('80', input);

    expect(mockField.value()).toBe(80);
  });

  it('should handle zero value', () => {
    mockField.value.set(0);
    spectator.detectChanges();

    const input = spectator.query('input') as HTMLInputElement;
    expect(input.valueAsNumber).toBe(0);
  });
});
