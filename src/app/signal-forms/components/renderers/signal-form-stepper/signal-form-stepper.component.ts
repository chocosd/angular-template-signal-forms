import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SignalSteppedFormContainer } from '@models/signal-form.model';
import { SignalFormErrorSummaryComponent } from '@renderers/form-field-error-summary/signal-form-error-summary.component';
import { SignalFormFieldsComponent } from '@renderers/signal-form-fields/signal-form-fields.component';
import { SignalFormStepperNavComponent } from './signal-form-stepper-nav/signal-form-stepper-nav.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'signal-form-stepper',
  imports: [
    SignalFormFieldsComponent,
    SignalFormStepperNavComponent,
    SignalFormErrorSummaryComponent,
  ],
  templateUrl: './signal-form-stepper.component.html',
  styleUrl: './signal-form-stepper.component.scss',
  host: {
    '[class.signal-form-container]': 'true',
  },
})
export class SignalFormStepperComponent<TModel> {
  public form = input.required<SignalSteppedFormContainer<TModel>>();

  protected next() {
    if (
      this.form().validateStep() &&
      this.form().currentStep() < this.form().steps.length - 1
    ) {
      this.form().currentStep.set(this.form().currentStep() + 1);
    }
  }

  protected previous() {
    this.form().currentStep.set(this.form().currentStep() - 1);
  }

  protected save() {
    this.form().save();
  }
}
