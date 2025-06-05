import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
} from '@angular/core';
import { FormStatus } from '../../../enums/form-status.enum';
import { type SignalSteppedFormContainer } from '../../../models/signal-form.model';
import { SignalFormErrorSummaryComponent } from '../form-field-error-summary/signal-form-error-summary.component';
import { SignalFormFieldsComponent } from '../signal-form-fields/signal-form-fields.component';
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
  public onSave = output<TModel>();
  public afterSaveCompletes = output<void>();

  protected readonly saveDisabled = computed(
    () => !(this.form().anyDirty() && this.form().anyTouched()),
  );

  protected submitButtonText = computed(() => {
    const status = this.form().status();
    switch (status) {
      case FormStatus.Submitting:
        return 'Saving...';
      case FormStatus.Success:
        return 'Saved successfully';
      default:
        return 'Submit';
    }
  });

  protected submitButtonClass = computed(() => {
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

  constructor() {
    effect(() => {
      if (this.form().hasSaved()) {
        this.afterSaveCompletes.emit();
      }
    });
  }

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

    this.onSave.emit(this.form().value());
  }
}
