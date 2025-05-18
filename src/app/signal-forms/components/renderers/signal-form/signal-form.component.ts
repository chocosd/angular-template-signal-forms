import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { SignalFormHostDirective } from '@base/host-directive/signal-form-host.directive';
import { type SignalFormContainer } from '@models/signal-form.model';
import { SignalFormErrorSummaryComponent } from '../form-field-error-summary/signal-form-error-summary.component';
import { SignalFormFieldsComponent } from '../signal-form-fields/signal-form-fields.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-signal-form',
  imports: [SignalFormFieldsComponent, SignalFormErrorSummaryComponent],
  standalone: true,
  styleUrl: './signal-form.component.scss',
  templateUrl: './signal-form.component.html',
  hostDirectives: [SignalFormHostDirective],
  host: {
    '[class.signal-form-container]': 'true',
  },
})
export class SignalFormComponent<TModel> {
  public form = input.required<SignalFormContainer<TModel>>();
  public submitButtonText = input<string>('Save');
  public onSave = output<TModel>();

  protected readonly disabled = computed(() => {
    const anyTouched = this.form().anyTouched();
    const anyDirty = this.form().anyDirty();

    return !(anyTouched && anyDirty);
  });

  protected submitForm(): void {
    this.form().save();
    this.onSave.emit(this.form().getValue());
  }
}
