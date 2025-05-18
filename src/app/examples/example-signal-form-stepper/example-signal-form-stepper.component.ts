import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormFieldType } from '@enums/form-field-type.enum';
import { type SignalSteppedFormContainer } from '@models/signal-form.model';
import { SignalFormStepperComponent } from '@renderers/signal-form-stepper/signal-form-stepper.component';
import { SignalValidators } from '@validators/signal-validators';
import { withOptionalSignalValidation } from '@validators/validator-fns';
import { FormBuilder } from 'app/signal-forms/helpers/form-builder';
import { model } from '../consts/form.const';
import { type Basket } from '../models/example.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SignalFormStepperComponent],
  selector: 'example-signal-form-stepper',
  standalone: true,
  styleUrl: './example-signal-form-stepper.component.scss',
  templateUrl: './example-signal-form-stepper.component.html',
})
export class ExampleSignalFormStepperComponent implements OnInit {
  public steppedForm!: SignalSteppedFormContainer<Basket>;

  public ngOnInit(): void {
    this.steppedForm = FormBuilder.createSteppedForm({
      model,
      steps: [
        {
          fields: [
            {
              name: 'applePrice',
              type: FormFieldType.NUMBER,
              label: 'apple price',
              validators: [
                SignalValidators.required(),
                withOptionalSignalValidation(
                  () => this.steppedForm.getField('pearPrice')?.value,
                  (applePrice, pearPrice, form) => {
                    if (
                      applePrice < 0 &&
                      (pearPrice ?? 0) < 20 &&
                      form.status() === 'Idle'
                    ) {
                      return 'Invalid unless pears are expensive';
                    }
                    return null;
                  },
                ),
              ],
            },
            {
              name: 'apples',
              type: FormFieldType.NUMBER,
              label: 'apples',
              validators: [
                SignalValidators.min(1, 'Must be higher than 1'),
                SignalValidators.required(),
              ],
            },
            {
              name: 'appleTotal',
              type: FormFieldType.NUMBER,
              label: 'apples total',
            },
          ],
        },
        {
          fields: [
            {
              name: 'pearPrice',
              type: FormFieldType.NUMBER,
              label: 'pear price',
              validators: [
                SignalValidators.min(1, 'Must be higher than 1'),
                SignalValidators.required(),
              ],
            },
            {
              name: 'pears',
              type: FormFieldType.NUMBER,
              label: 'pears',
              validators: [SignalValidators.required()],
            },
            {
              name: 'pearTotal',
              type: FormFieldType.NUMBER,
              label: 'pears total',
            },
          ],
        },
      ],
      onSave: console.log,
      config: {
        canSkipIncompleteSteps: false,
      },
    });
  }
}
