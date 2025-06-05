import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  input,
  output,
} from '@angular/core';
import { FormStatus } from '../../../enums/form-status.enum';
import { type SignalFormContainer } from '../../../models/signal-form.model';
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

  protected disabled = computed(() => this.form().saveButtonDisabled());

  protected buttonText = computed(() => {
    const status = this.form().status();
    switch (status) {
      case FormStatus.Submitting:
        return 'Saving...';
      case FormStatus.Success:
        return 'Saved successfully';
      default:
        return this.submitButtonText();
    }
  });

  protected buttonClass = computed(() => {
    const status = this.form().status();
    const classes = ['form-button'];

    if (status === FormStatus.Submitting) {
      classes.push('saving');
    } else if (status === FormStatus.Success) {
      classes.push('success');
    } else if (this.form().hasSaved()) {
      classes.push('saved');
    }

    return classes.join(' ');
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
      this.form().save();
      this.formSubmit.emit(this.form());
    }
  }
}
