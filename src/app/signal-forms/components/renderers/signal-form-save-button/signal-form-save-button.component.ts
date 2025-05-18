import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { type SignalFormContainer } from '@models/signal-form.model';

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

  public save(): void {
    if (!this.form().validateForm()) {
      return;
    }

    this.form().save();
    this.onSave.emit(this.form().getValue());
  }
}
