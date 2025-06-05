import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  FormFieldType,
  FormOption,
  SignalFormBuilder,
  SignalFormContainer,
  SignalFormFieldsComponent,
  SignalFormSaveButtonComponent,
} from 'signal-template-forms';

export interface User {
  username: string | null;
  password: string | null;
  age: number | null;
  address: {
    line1: string | null;
    line2: string | null;
    county: string | null;
    country: FormOption | null;
    postcode: string | null;
  };
  gender: FormOption<string> | null;
  favouriteFood: string | null;
}

type UserP1 = Pick<User, 'address'>;
type UserP2 = Omit<User, 'address'>;

@Component({
  selector: 'example-signal-form-rows',
  standalone: true,
  imports: [SignalFormFieldsComponent, SignalFormSaveButtonComponent],
  templateUrl: './example-signal-form-rows.component.html',
  styleUrl: './example-signal-form-rows.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleSignalFormRowsComponent implements OnInit {
  public fieldsA!: SignalFormContainer<UserP1>;
  public fieldsB!: SignalFormContainer<UserP2>;

  constructor() {}

  public ngOnInit(): void {
    const userModelA: UserP1 = {
      address: {
        line1: null,
        line2: null,
        postcode: null,
        county: null,
        country: null,
      },
    };

    const userModelB: UserP2 = {
      age: null,
      gender: null,
      password: null,
      username: null,
      favouriteFood: null,
    };

    this.fieldsA = SignalFormBuilder.createForm({
      title: 'section A',
      model: userModelA,
      fields: [
        {
          name: 'address',
          heading: 'testing',
          subheading: 'testing just fields',
          fields: [
            {
              name: 'line1',
              label: 'line 1',
              type: FormFieldType.TEXT,
              config: {
                placeholder: 'First Address Line',
              },
            },
            {
              name: 'line2',
              label: 'line 2',
              type: FormFieldType.TEXT,
              config: {
                placeholder: 'Second Address Line',
              },
            },
            {
              name: 'postcode',
              label: 'postcode',
              type: FormFieldType.TEXT,
              config: {
                placeholder: 'PostCode / Zip Code',
              },
            },
          ],
        },
      ],
      config: {
        view: 'collapsable',
        layout: 'flex',
      },
    });

    this.fieldsB = SignalFormBuilder.createForm({
      model: userModelB,
      fields: [
        {
          name: 'age',
          type: FormFieldType.NUMBER,
          label: 'Age',
          validators: [
            (val: number | null, form: SignalFormContainer<UserP2>) => {
              const isUnder18 = !!val && val < 18;
              const genderValue = form.getField('gender').value();
              const isFemale = !!genderValue && genderValue.value === 'Female';
              const alsoHasPostcode = !!this.fieldsA.getField('address').value()
                .postcode;

              return isUnder18 && isFemale && alsoHasPostcode
                ? 'age is too low'
                : null;
            },
          ],
        },
        {
          name: 'gender',
          type: FormFieldType.SELECT,
          label: 'Gender',
          options: [
            {
              label: 'Male',
              value: 'Male',
            },
            {
              label: 'Female',
              value: 'Female',
            },
          ],
        },
        { name: 'password', type: FormFieldType.PASSWORD, label: 'password' },
        { name: 'username', type: FormFieldType.TEXT, label: 'username' },
        {
          name: 'favouriteFood',
          type: FormFieldType.TEXT,
          label: 'favouriteFood',
        },
      ],
    });
  }

  private formatAndSave(value: User): void {
    console.log(this.fieldsA.getField('address').form.parentForm());
  }
}
