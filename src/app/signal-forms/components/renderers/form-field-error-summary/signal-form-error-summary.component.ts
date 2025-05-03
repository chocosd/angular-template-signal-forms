import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { SignalFormContainer } from '../../../models/signal-form.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'signal-form-error-summary',
  standalone: true,
  templateUrl: './form-error-summary.component.html',
  styleUrls: ['./form-error-summary.component.scss'],
})
export class SignalFormErrorSummaryComponent<TModel> {
  form = input.required<SignalFormContainer<TModel>>();

  private currentIndex = signal(0);

  public errors = computed(() => this.form().getErrors());

  public currentError = computed(() => {
    const all = this.errors();
    return all.length ? all[this.currentIndex() % all.length] : null;
  });

  focusNext(): void {
    if (!this.errors().length) return;

    this.currentIndex.update((i) => (i + 1) % this.errors().length);
    this.focusCurrent();
  }

  focusPrevious(): void {
    const errs = this.errors();
    if (!errs.length) return;

    this.currentIndex.update((i) => (i - 1 + errs.length) % errs.length);
    this.focusCurrent();
  }

  private focusCurrent(): void {
    const err = this.currentError();
    if (err) {
      this.form().getField(err.name).focus.set(true);
    }
  }
}
