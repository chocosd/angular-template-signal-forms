import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  signal,
  viewChildren,
} from '@angular/core';
import {
  type ErrorMessage,
  type SignalFormContainer,
  type SignalSteppedFormContainer,
} from '@models/signal-form.model';
import { FieldTraversalUtils } from '../../../form-builder/utils/field-traversal.utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'signal-form-error-summary',
  standalone: true,
  templateUrl: './form-error-summary.component.html',
  styleUrls: ['./form-error-summary.component.scss'],
})
export class SignalFormErrorSummaryComponent<TModel> {
  public form = input.required<
    SignalFormContainer<TModel> | SignalSteppedFormContainer<TModel>
  >();
  readonly fieldsEls = viewChildren<ElementRef>('formFields');

  private currentIndex = signal(0);
  private readonly injector = inject(Injector);

  public errors = computed(() => {
    if ('steps' in this.form()) {
      return (this.form() as SignalSteppedFormContainer<TModel>).steps.flatMap(
        (step) => step.getErrors(),
      );
    }
    return this.form().getErrors();
  });

  public currentError = computed(() => {
    const all = this.errors();
    return all.length ? all[this.currentIndex() % all.length] : null;
  });

  protected focusNext(): void {
    if (!this.errors().length) {
      return;
    }

    this.currentIndex.update((i) => (i + 1) % this.errors().length);
    this.focusCurrent();
  }

  protected focusPrevious(): void {
    const errs = this.errors();

    if (!errs.length) {
      return;
    }

    this.currentIndex.update((i) => (i - 1 + errs.length) % errs.length);
    this.focusCurrent();
  }

  protected focusCurrent(): void {
    const err = this.currentError();

    if (!err) {
      return;
    }

    const isStepped = 'steps' in this.form();

    if (isStepped) {
      this.focusSteppedError(err);
    } else {
      this.focusNestedError(err);
    }
  }

  private focusSteppedError(err: ErrorMessage<TModel>): void {
    const steppedForm = this.form() as SignalSteppedFormContainer<TModel>;
    // Find the step that contains a field matching the full path
    const stepIndex = steppedForm.steps.findIndex((step) =>
      FieldTraversalUtils.findFieldByPath(step, err.path),
    );

    if (stepIndex !== -1) {
      steppedForm.currentStep.set(stepIndex);
      effect(
        () => {
          this.focusNestedError(err, steppedForm.steps[stepIndex]);
        },
        { injector: this.injector },
      );
    }
  }

  private focusNestedError(
    err: ErrorMessage<TModel>,
    form: SignalFormContainer<TModel> = this.form() as SignalFormContainer<TModel>,
  ): void {
    if (err.focusField) {
      err.focusField();
      return;
    }

    const field = FieldTraversalUtils.findFieldByPath(form, err.path);
    if (field?.focus) {
      field.focus.set(true);
    }
  }
}
