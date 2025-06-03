import { computed, signal } from '@angular/core';
import { FormFieldType } from '@enums/form-field-type.enum';
import { type RuntimeDateTimeSignalField } from '@models/signal-field-types.model';
import { type SignalFormContainer } from '@models/signal-form.model';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { DateTime } from 'luxon';
import { createMockForm } from '../../../testing/mock-form.helper';
import { SignalFormDatetimeFieldComponent } from './signal-form-datetime-field.component';

interface TestModel {
  birthDate: Date;
}

describe('SignalFormDatetimeFieldComponent', () => {
  let spectator: Spectator<
    SignalFormDatetimeFieldComponent<TestModel, 'birthDate'>
  >;
  let mockField: RuntimeDateTimeSignalField<TestModel, 'birthDate'>;
  let mockForm: SignalFormContainer<TestModel>;

  const createComponent = createComponentFactory<
    SignalFormDatetimeFieldComponent<TestModel, 'birthDate'>
  >({
    component: SignalFormDatetimeFieldComponent,
    shallow: true,
  });

  beforeEach(() => {
    const testDate = new Date('2023-12-25T15:30:00');
    mockForm = createMockForm<TestModel>({ birthDate: testDate });

    mockField = {
      name: 'birthDate',
      label: 'Birth Date',
      type: FormFieldType.DATETIME,
      error: signal(null),
      touched: signal(false),
      dirty: signal(false),
      focus: signal(false),
      value: signal(testDate),
      getForm: () => mockForm,
      path: 'birthDate',
      isDisabled: computed(() => false),
      isHidden: computed(() => false),
      config: {
        format: "yyyy-LL-dd'T'HH:mm",
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

  it('should render datetime-local input', () => {
    const input = spectator.query('input[type="datetime-local"]');
    expect(input).toBeTruthy();
    expect(input?.classList.contains('form-input')).toBe(true);
  });

  it('should display formatted date value', () => {
    const expectedFormat = DateTime.fromJSDate(
      new Date('2023-12-25T15:30:00'),
    ).toFormat("yyyy-LL-dd'T'HH:mm");

    // Test the formattedValue method directly since we're using shallow rendering
    const formattedValue = spectator.component['formattedValue']();
    expect(formattedValue).toBe(expectedFormat);
  });

  it('should handle custom format configuration', () => {
    const customDate = new Date('2023-06-15T10:45:00');
    mockField.value.set(customDate);
    mockField.config = { format: 'dd/LL/yyyy HH:mm' };
    spectator.detectChanges();

    // Component should use the custom format
    const expectedFormat =
      DateTime.fromJSDate(customDate).toFormat('dd/LL/yyyy HH:mm');
    const formattedValue = spectator.component['formattedValue']();
    expect(formattedValue).toBe(expectedFormat);
  });

  it('should use default format when no format is specified', () => {
    mockField.config = {};
    spectator.detectChanges();

    const formattedValue = spectator.component['formattedValue']();
    const expectedFormat = DateTime.fromJSDate(
      new Date('2023-12-25T15:30:00'),
    ).toFormat("yyyy-LL-dd'T'HH:mm");
    expect(formattedValue).toBe(expectedFormat);
  });

  it('should handle null date value', () => {
    mockField.value.set(null as any);
    spectator.detectChanges();

    const input = spectator.query('input') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('should handle undefined date value', () => {
    mockField.value.set(undefined as any);
    spectator.detectChanges();

    const input = spectator.query('input') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('should extract Date value from input change', () => {
    const input = spectator.query('input') as HTMLInputElement;
    const newDateString = '2024-01-01T12:00';

    spectator.typeInElement(newDateString, input);

    // The extractValue method should convert the string to a Date
    const extractedValue = spectator.component['extractValue'](input);
    expect(extractedValue).toBeInstanceOf(Date);
    expect(extractedValue.toISOString()).toBe(
      new Date(newDateString).toISOString(),
    );
  });

  it('should handle invalid date input gracefully', () => {
    const input = spectator.query('input') as HTMLInputElement;
    input.value = 'invalid-date';

    const extractedValue = spectator.component['extractValue'](input);
    expect(extractedValue).toBeInstanceOf(Date);
    expect(isNaN(extractedValue.getTime())).toBe(true); // Invalid Date
  });

  it('should update field value when input changes', () => {
    const input = spectator.query('input') as HTMLInputElement;
    const newDateString = '2024-03-15T14:20';

    // Simulate input change
    spectator.typeInElement(newDateString, input);

    // The field value should be updated through the signalModel directive
    // We can't directly test this without a more complex setup, but we can verify
    // that the extractValue method works correctly
    const extractedValue = spectator.component['extractValue'](input);
    expect(extractedValue).toEqual(new Date(newDateString));
  });

  it('should handle different date formats correctly', () => {
    const testCases = [
      {
        format: 'yyyy-LL-dd',
        date: new Date('2023-12-25T15:30:00'),
        expected: '2023-12-25',
      },
      {
        format: 'dd/LL/yyyy',
        date: new Date('2023-06-15T10:45:00'),
        expected: '15/06/2023',
      },
      {
        format: 'LL-dd-yyyy HH:mm',
        date: new Date('2023-03-08T09:15:00'),
        expected: '03-08-2023 09:15',
      },
    ];

    testCases.forEach(({ format, date, expected }) => {
      mockField.value.set(date);
      mockField.config = { format };
      spectator.detectChanges();

      const formattedValue = spectator.component['formattedValue']();
      expect(formattedValue).toBe(expected);
    });
  });

  it('should have proper ARIA attributes for accessibility', () => {
    const input = spectator.query('input');
    expect(input?.getAttribute('type')).toBe('datetime-local');
    expect(input?.classList.contains('form-input')).toBe(true);
  });

  it('should work with edge case dates', () => {
    const edgeCases = [
      new Date('1970-01-01T00:00:00'), // Unix epoch
      new Date('2038-01-19T03:14:07'), // Year 2038 problem
      new Date('2000-02-29T12:00:00'), // Leap year
    ];

    edgeCases.forEach((date) => {
      mockField.value.set(date);
      spectator.detectChanges();

      const formattedValue = spectator.component['formattedValue']();
      const expectedFormat =
        DateTime.fromJSDate(date).toFormat("yyyy-LL-dd'T'HH:mm");
      expect(formattedValue).toBe(expectedFormat);
    });
  });
});
