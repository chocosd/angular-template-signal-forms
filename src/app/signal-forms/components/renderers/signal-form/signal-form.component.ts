import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  input,
  output,
} from '@angular/core';
import { ErrorMessage, SignalFormContainer } from '@models/signal-form.model';
import { HasUnsavedChanges } from '../../../services/unsaved-changes.guard';
import { SignalFormErrorSummaryComponent } from '../form-field-error-summary/signal-form-error-summary.component';
import { SignalFormFieldsComponent } from '../signal-form-fields/signal-form-fields.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'signal-form',
  imports: [SignalFormFieldsComponent, SignalFormErrorSummaryComponent],
  standalone: true,
  templateUrl: './signal-form.component.html',
  styleUrl: './signal-form.component.scss',
})
export class SignalFormComponent<TModel> implements HasUnsavedChanges {
  public form = input.required<SignalFormContainer<TModel>>();
  public submitButtonText = input<string>('Save');

  public formSubmit = output<SignalFormContainer<TModel>>();

  protected disabled = computed(() => {
    const errors = this.form().getErrors();
    const hasErrors = errors.length > 0;
    const allErrorsAreSubmitOnly = this.areAllErrorsSubmitOnly();
    return hasErrors && !allErrorsAreSubmitOnly;
  });

  public hasUnsavedChanges(): boolean {
    return this.form().anyDirty();
  }

  @HostListener('window:beforeunload', ['$event'])
  public onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
    }
  }

  public submitForm(): void {
    const isValid = this.form().validateForm();

    if (isValid) {
      this.formSubmit.emit(this.form());
    }
  }

  private areAllErrorsSubmitOnly(): boolean {
    const errors = this.form().getErrors();
    if (errors.length === 0) return true;

    return errors.every((error: ErrorMessage<TModel>) => {
      if (error.field) {
        return error.field.validationConfig?.trigger === 'submit';
      }
      return false;
    });
  }
}
