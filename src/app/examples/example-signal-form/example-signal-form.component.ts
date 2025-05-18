import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { FormFieldType } from '@enums/form-field-type.enum';
import { SignalFormContainer } from '@models/signal-form.model';
import { SignalFormComponent } from '@renderers/signal-form/signal-form.component';
import { TestApiService } from '@services/test-http.service';
import { SignalValidators } from '@validators/signal-validators';
import { OnlyPositiveValidator } from 'app/app.component';
import { FormBuilder } from 'app/signal-forms/helpers/form-builder';
import { aboutForm } from '../consts/about-form.const';
import { addressForm } from '../consts/address-form.const';
import { model } from '../consts/form.const';
import { Basket } from '../models/example.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SignalFormComponent],
  selector: 'example-signal-form',
  standalone: true,
  styleUrl: './example-signal-form.component.scss',
  templateUrl: './example-signal-form.component.html',
})
export class ExampleSignalFormComponent implements OnInit {
  public form!: SignalFormContainer<Basket>;
  private readonly testApiService = inject(TestApiService);

  public ngOnInit(): void {
    this.form = FormBuilder.createForm<Basket>({
      title: 'Test Form',
      model,
      fields: [
        addressForm(this.testApiService),
        aboutForm,
        {
          name: 'apples',
          label: 'apples',
          type: FormFieldType.NUMBER,
          config: {},
          validators: [(x) => (!!x && x < 0 ? 'only positive value' : null)],
        },
        {
          name: 'applePrice',
          label: 'Price per apple',
          type: FormFieldType.NUMBER,
          validators: [OnlyPositiveValidator('applePrice')],
        },
        {
          name: 'appleTotal',
          label: 'Total Apple Price',
          type: FormFieldType.NUMBER,
          disabled: (form) => !!form.getField('apples').error(),
          computedValue: (form) => {
            const apples = form.getField('apples').value();
            const price = form.getField('applePrice').value();

            return (apples ?? 0) * price;
          },
          validators: [OnlyPositiveValidator('appleTotal')],
        },
        {
          name: 'pears',
          label: 'Number of Pears',
          type: FormFieldType.NUMBER,
        },
        {
          name: 'pearPrice',
          label: 'Price per pear',
          type: FormFieldType.NUMBER,
          validators: [OnlyPositiveValidator('pearPrice')],
        },
        {
          name: 'pearTotal',
          label: 'Total Pear Price',
          type: FormFieldType.NUMBER,
          computedValue: (form) => {
            const pears = form.getField('pears').value();
            const price = form.getField('pearPrice').value();
            return pears * price;
          },
          validators: [OnlyPositiveValidator('pearTotal')],
        },
        {
          name: 'isOrganic',
          label: 'is Organic',
          type: FormFieldType.CHECKBOX,
          options: [],
        },
        {
          name: 'total',
          label: 'Total Price',
          type: FormFieldType.NUMBER,
          computedValue: (form) =>
            form.getField('appleTotal').value() +
            form.getField('pearTotal').value(),
          validators: [
            SignalValidators.hasValue('applePrice'),
            SignalValidators.hasValue('pearPrice'),
            SignalValidators.min(100),
          ],
        },
      ],
      onSave: (value) => this.save(value),
      config: {
        layout: 'grid-area',
        gridArea: [
          ['address', 'address', 'address'],
          ['about', 'about', 'about'],
          ['apples', 'applePrice', 'appleTotal'],
          ['pears', 'pearPrice', 'pearTotal'],
          ['isOrganic', 'isOrganic', 'isOrganic'],
          ['total', 'total', 'total'],
        ],
      },
    });
  }

  protected save(e: Basket) {
    console.log(e);
    console.log('value', this.form.value());
  }

  protected updateForm() {
    this.form.patchValue({
      apples: 50,
      pears: 50,
      about: {
        beastMode: true,
        brightness: 100,
        bannerColor: '#00aeff',
      },
    });
  }
}
