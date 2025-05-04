import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignalFormComponent } from './signal-forms/components/renderers/signal-form/signal-form.component';
import { FormFieldType } from './signal-forms/enums/form-field-type.enum';
import { FormBuilder } from './signal-forms/helpers/form-builder';
import {
  SignalFormContainer,
  SignalFormFieldBuilderInput,
} from './signal-forms/models/signal-form.model';

export type Basket = {
  apples: number;
  pears: number;
  address: {
    line1: string;
    postcode: string;
    country: string;
  };
  applePrice: number;
  pearPrice: number;
  appleTotal: number;
  pearTotal: number;
  isOrganic: boolean;
  total: number;
};

export const OnlyPositiveValidator = (name: string) => (x: number) =>
  x < 0 ? `${name} only positive prices` : null;

const addressForm: SignalFormFieldBuilderInput<Basket> = {
  name: 'address',
  heading: 'address',
  subheading: 'information about the address',
  hide: (form) => form.getField('apples').value() > 4,
  fields: [
    {
      name: 'line1',
      label: 'line 1',
      type: FormFieldType.TEXT,
      validators: [
        (x, form) =>
          !x.length && form.getField('postcode')?.value().length < 5
            ? 'invalid address'
            : null,
      ],
    },
    {
      name: 'postcode',
      label: 'postcode',
      type: FormFieldType.TEXT,
    },
    {
      name: 'country',
      label: 'Select Country',
      type: FormFieldType.AUTOCOMPLETE,
      loadOptions: (search: string) =>
        fetch(`https://restcountries.com/v3.1/name/${search}`)
          .then((res) => res.json())
          .then((results) => {
            if (!results.length) {
              return [];
            }
            return results.map((country: any) => ({
              label: country.name.common,
              value: country.cca2,
            }));
          }),
      config: {
        debounceMs: 300,
        minChars: 2,
      },
    },
  ],
};

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
      address: {
        line1: '46 newtown',
        postcode: 'sp3 6ny',
        country: 'russia',
      },
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
        addressForm,
        {
          name: 'apples',
          label: 'apples',
          type: FormFieldType.NUMBER,
          config: {},
          validators: [(x) => (x < 0 ? 'only positive value' : null)],
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
          options: [],
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
