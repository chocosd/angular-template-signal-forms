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
  type SignalFormContainer,
  type SignalSteppedFormContainer,
} from '@models/signal-form.model';

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
    if ('steps' in this.form) {
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

  private focusCurrent(): void {
    const err = this.currentError();

    if (!err) {
      return;
    }

    const isStepped = 'steps' in this.form();

    if (isStepped) {
      const steppedForm = this.form() as SignalSteppedFormContainer<TModel>;
      const steppedError = err;
      const stepIndex = steppedForm.steps.findIndex((step) =>
        step.fields.some((f) => f.name === steppedError.name),
      );

      if (stepIndex !== -1) {
        steppedForm.currentStep.set(stepIndex);
        effect(
          () => {
            const field = steppedForm.steps[stepIndex].getField(
              steppedError.name,
            );

            field.focus.set(true);
          },
          { injector: this.injector },
        );
      }
    } else {
      this.form().getField(err.name)?.focus.set(true);
    }
  }
}
