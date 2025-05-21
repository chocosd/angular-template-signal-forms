import { FormFieldType } from '@enums/form-field-type.enum';
import { type SignalFormFieldBuilderInput } from '@models/signal-form.model';
import { type Basket } from '../models/example.model';

export const aboutForm: SignalFormFieldBuilderInput<Basket> = {
  heading: 'About you',
  subheading: 'a few small things about you',
  name: 'about',
  fields: [
    {
      label: 'Profile Picture',
      name: 'profilePicture',
      type: FormFieldType.FILE,
      config: {
        maxSizeMb: 5,
      },
    },
    {
      name: 'contacts',
      type: FormFieldType.REPEATABLE_GROUP,
      heading: 'Contact Info',
      fields: [
        {
          name: 'email',
          type: FormFieldType.TEXT,
          label: 'Email',
        },
        {
          name: 'phone',
          type: FormFieldType.TEXT,
          label: 'Phone',
        },
        {
          name: 'name',
          type: FormFieldType.TEXT,
          label: 'Name',
        },
      ],
    },
    {
      name: 'bannerColor',
      label: 'Banner Color',
      type: FormFieldType.COLOR,
      config: {
        view: 'swatch',
      },
    },
    {
      name: 'phoneNumber',
      label: 'Phone Number',
      type: FormFieldType.MASKED,
      config: {
        mask: '(999) 999-9999',
        placeholderChar: '_',
        hint: 'Enter a 10-digit phone number',
      },
      validators: [(val) => (!val ? 'this is required' : null)],
    },
    {
      name: 'features',
      label: 'Enable Features',
      type: FormFieldType.CHIPLIST,
      options: [
        { label: 'Feature A', value: 'featureA' },
        { label: 'Feature B', value: 'featureB' },
        { label: 'Feature C', value: 'featureC' },
      ],
    },
    {
      name: 'beastMode',
      label: 'Beast Mode',
      type: FormFieldType.SWITCH,
    },
    {
      name: 'brightness',
      label: 'Brightness',
      type: FormFieldType.SLIDER,
      disabled: true,
    },
    {
      name: 'rating',
      label: 'rating',
      type: FormFieldType.RATING,
    },
  ],
  config: {
    view: 'collapsable',
    layout: 'grid-area',
    gridArea: [
      ['profilePicture', 'profilePicture', 'beastMode'],
      ['profilePicture', 'profilePicture', '.'],
      ['profilePicture', 'profilePicture', 'bannerColor'],
      ['profilePicture', 'profilePicture', '.'],
      ['features', 'phoneNumber', 'phoneNumber'],
      ['features', 'rating', 'brightness'],
      ['contacts', 'contacts', 'contacts'],
    ],
  },
};
