import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormFieldType,
  SignalFormBuilder,
  SignalFormContainer,
  SignalFormStepperComponent,
  SignalSteppedFormContainer,
  SignalValidators,
  withSignalValidation,
} from 'signal-template-forms';
import { model } from '../consts/form.const';
import { type Basket } from '../models/example.model';

@Component({
  selector: 'example-signal-form-stepper',
  standalone: true,
  imports: [SignalFormStepperComponent],
  templateUrl: './example-signal-form-stepper.component.html',
  styleUrl: './example-signal-form-stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleSignalFormStepperComponent implements OnInit {
  public steppedForm!: SignalSteppedFormContainer<Basket>;
  public showMessage = signal(false);

  constructor() {}

  public ngOnInit(): void {
    this.steppedForm = SignalFormBuilder.createSteppedForm({
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
                withSignalValidation(
                  () => this.steppedForm.getField('pearPrice')?.value,
                  (
                    applePrice: number,
                    pearPrice: number | undefined,
                    form: SignalFormContainer<Basket>,
                  ) => {
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
      onSave: (value: Basket) => this.handleSave(value),
      config: {
        canSkipIncompleteSteps: true,
        disableUponComplete: true,
      },
    });
  }

  protected handleAfterSaveHasFinished(): void {
    this.showMessage.set(true);
  }

  private handleSave(value: Basket): void {
    console.log(value);
  }
}
