import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { FormStatus } from '../../../enums/form-status.enum';
import { type SignalFormContainer } from '../../../models/signal-form.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'signal-form-save-button',
  standalone: true,
  templateUrl: './signal-form-save-button.component.html',
  styleUrl: './signal-form-save-button.component.scss',
})
export class SignalFormSaveButtonComponent<TModel> {
  public form = input.required<SignalFormContainer<TModel>>();
  public submitButtonText = input<string>('Save');
  public showReset = input<boolean>(false);

  public onSave = output<TModel>();

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

  protected isDisabled = computed(() => {
    const status = this.form().status();
    return !this.form().anyTouched() || status === FormStatus.Submitting;
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

  public save(): void {
    if (!this.form().validateForm()) {
      return;
    }

    this.form().save();
    this.onSave.emit(this.form().getValue());
  }
}
