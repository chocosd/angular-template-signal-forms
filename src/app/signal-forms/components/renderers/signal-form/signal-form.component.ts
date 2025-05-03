import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { Basket } from '../../../../app.component';
import { SignalFormContainer } from '../../../models/signal-form.model';
import { SignalFormErrorSummaryComponent } from '../form-field-error-summary/signal-form-error-summary.component';
import { SignalFormFieldsComponent } from '../signal-form-fields/signal-form-fields.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-signal-form',
  imports: [SignalFormFieldsComponent, SignalFormErrorSummaryComponent],
  standalone: true,
  styleUrl: './signal-form.component.scss',
  templateUrl: './signal-form.component.html',
})
export class SignalFormComponent<TModel extends Basket> {
  public form = input.required<SignalFormContainer<TModel>>();
  submitButtonText = input<string>('Save');
  onSave = output<TModel>();

  protected readonly disabled = computed(() => {
    const anyTouched = this.form().anyTouched();
    const anyDirty = this.form().anyDirty();

    return !(anyTouched && anyDirty);
  });

  submitForm(): void {
    this.form().save();
    this.onSave.emit(this.form().getValue());
  }
}
