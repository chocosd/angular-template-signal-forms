import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignalFormComponent } from './signal-forms/components/renderers/signal-form/signal-form.component';
import { FormFieldType } from './signal-forms/enums/form-field-type.enum';
import { FormBuilder } from './signal-forms/helpers/form-builder';
import { SignalFormContainer } from './signal-forms/models/signal-form.model';

export type Basket = {
  apples: number;
  pears: number;
  applePrice: number;
  pearPrice: number;
  appleTotal: number;
  pearTotal: number;
  isOrganic: boolean;
  total: number;
};

export const OnlyPositiveValidator = (name: string) => (x: number) =>
  x < 0 ? `${name} only positive prices` : null;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, SignalFormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  public title = 'signal-template-forms';
  public form!: SignalFormContainer<Basket>;

  public ngOnInit(): void {
    const model = {
      apples: 2,
      pears: 2,
      applePrice: 0.5,
      pearPrice: 0.7,
      appleTotal: 1,
      pearTotal: 1.4,
      isOrganic: false,
      total: 2.4,
    };

    this.form = FormBuilder.createForm<Basket>({
      title: 'Test Form',
      model,
      fields: [
        {
          name: 'apples',
          label: 'apples',
          type: FormFieldType.NUMBER,
          config: {},
          disabled: (form) => form.getField('pears').touched(),
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
          computedValue: (form) => {
            const apples = form.getField('apples').value();
            const price = form.getField('applePrice').value();
            return apples * price;
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
        },
        {
          name: 'total',
          label: 'Total Price',
          type: FormFieldType.NUMBER,
          computedValue: (form) => {
            const appleTotal = form.getField('appleTotal').value();
            const pearTotal = form.getField('pearTotal').value();
            return appleTotal + pearTotal;
          },
          validators: [OnlyPositiveValidator('total')],
        },
      ],
    });
  }

  protected save(e: Basket) {
    console.log(e);
    console.log('raw value', this.form.rawValue());
    console.log('value', this.form.value());
  }
}
