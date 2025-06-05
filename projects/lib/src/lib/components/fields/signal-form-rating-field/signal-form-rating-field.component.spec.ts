import { computed, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { type RuntimeRatingSignalField } from '../../../models/signal-field-types.model';
import { type SignalFormContainer } from '../../../models/signal-form.model';
import { createMockForm } from '../../../testing/mock-form.helper';
import { SignalFormRatingFieldComponent } from './signal-form-rating-field.component';

interface TestModel {
  rating: number;
}

describe('SignalFormRatingFieldComponent', () => {
  let spectator: Spectator<SignalFormRatingFieldComponent<TestModel, 'rating'>>;
  let mockField: RuntimeRatingSignalField<TestModel, 'rating'>;
  let mockForm: SignalFormContainer<TestModel>;

  const createComponent = createComponentFactory<
    SignalFormRatingFieldComponent<TestModel, 'rating'>
  >({
    component: SignalFormRatingFieldComponent,
    shallow: true,
    schemas: [NO_ERRORS_SCHEMA],
  });

  beforeEach(() => {
    mockForm = createMockForm<TestModel>({ rating: 0 });

    mockField = {
      name: 'rating',
      label: 'Rating',
      type: FormFieldType.RATING,
      error: signal(null),
      touched: signal(false),
      dirty: signal(false),
      focus: signal(false),
      value: signal(0),
      getForm: () => mockForm,
      path: 'rating',
      isDisabled: computed(() => false),
      isHidden: computed(() => false),
      config: {
        min: 2,
        max: 6,
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

  it('should render rating wrapper with correct role', () => {
    const wrapper = spectator.query('.form-rating');
    expect(wrapper).toBeTruthy();
    expect(wrapper?.getAttribute('role')).toBe('radiogroup');
  });

  it('should render rating stars container', () => {
    const starsContainer = spectator.query('.rating-stars');
    expect(starsContainer).toBeTruthy();
  });

  it('should render correct number of stars based on config', () => {
    const stars = spectator.queryAll('.star');
    expect(stars).toHaveLength(5);
  });

  it('should render custom number of stars when config.max is set', () => {
    const newMockField = { ...mockField, config: { max: 3 } };
    spectator = createComponent({
      props: {
        field: newMockField,
      },
    });

    const stars = spectator.queryAll('.star');
    expect(stars).toHaveLength(3);
  });

  it('should render star buttons with correct attributes', () => {
    const firstStar = spectator.query('.star');
    expect(firstStar?.tagName).toBe('BUTTON');
    expect(firstStar?.getAttribute('type')).toBe('button');
    expect(firstStar?.getAttribute('role')).toBe('radio');
    expect(firstStar?.textContent?.trim()).toBe('★');
  });

  it('should set correct aria-label for each star', () => {
    const stars = spectator.queryAll('.star');
    expect(stars[0]?.getAttribute('aria-label')).toBe('Rate 2 star');
    expect(stars[1]?.getAttribute('aria-label')).toBe('Rate 3 star');
    expect(stars[4]?.getAttribute('aria-label')).toBe('Rate 6 star');
  });

  it('should set aria-checked correctly based on field value', () => {
    mockField.value.set(3);
    spectator.detectChanges();

    const stars = spectator.queryAll('.star');
    expect(stars[0]?.getAttribute('aria-checked')).toBe('false');
    expect(stars[1]?.getAttribute('aria-checked')).toBe('true');
    expect(stars[2]?.getAttribute('aria-checked')).toBe('false');
    expect(stars[3]?.getAttribute('aria-checked')).toBe('false');
    expect(stars[4]?.getAttribute('aria-checked')).toBe('false');
  });

  it('should add filled class to stars up to current rating', () => {
    mockField.value.set(3);
    spectator.detectChanges();

    const stars = spectator.queryAll('.star');
    expect(stars[0]?.classList.contains('filled')).toBe(true);
    expect(stars[1]?.classList.contains('filled')).toBe(true);
    expect(stars[2]?.classList.contains('filled')).toBe(false);
    expect(stars[3]?.classList.contains('filled')).toBe(false);
    expect(stars[4]?.classList.contains('filled')).toBe(false);
  });

  it('should update field value when star is clicked', () => {
    const thirdStar = spectator.queryAll('.star')[2]!;
    spectator.click(thirdStar);

    expect(mockField.value()).toBe(4);
  });

  it('should set touched to true when star is clicked', () => {
    const firstStar = spectator.query('.star')!;
    spectator.click(firstStar);

    expect(mockField.touched()).toBe(true);
  });

  it('should handle zero rating (no stars filled)', () => {
    mockField.value.set(0);
    spectator.detectChanges();

    const stars = spectator.queryAll('.star');
    stars.forEach((star, i) => {
      expect(star?.classList.contains('filled')).toBe(false);
      expect(star?.getAttribute('aria-checked')).toBe('false');
    });
  });

  it('should handle maximum rating (all stars filled)', () => {
    mockField.value.set(6);
    spectator.detectChanges();

    const stars = spectator.queryAll('.star');
    stars.forEach((star, i) => {
      expect(star?.classList.contains('filled')).toBe(true);
    });
    expect(stars[4]?.getAttribute('aria-checked')).toBe('true');
  });

  it('should handle clicking first star', () => {
    const firstStar = spectator.query('.star')!;
    spectator.click(firstStar);

    expect(mockField.value()).toBe(2);
    expect(mockField.touched()).toBe(true);
  });

  it('should handle clicking last star', () => {
    const lastStar = spectator.queryAll('.star')[4]!;
    spectator.click(lastStar);

    expect(mockField.value()).toBe(6);
    expect(mockField.touched()).toBe(true);
  });

  it('should handle default max value when config is empty', () => {
    const newMockField = { ...mockField, config: {} };
    spectator = createComponent({
      props: {
        field: newMockField,
      },
    });

    const stars = spectator.queryAll('.star');
    expect(stars).toHaveLength(5);
  });

  it('should handle partial ratings correctly', () => {
    mockField.value.set(2.5 as any);
    spectator.detectChanges();

    const stars = spectator.queryAll('.star');
    expect(stars[0]?.classList.contains('filled')).toBe(true);
    expect(stars[1]?.classList.contains('filled')).toBe(false);
    expect(stars[2]?.classList.contains('filled')).toBe(false);
  });
});
