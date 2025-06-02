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
          config: {
            placeholder: 'Enter your email',
            validation: {
              trigger: 'blur', // Only validate on blur, not on every keystroke
              debounceMs: 500,
            },
          },
          validationConfig: {
            validateAsyncOnInit: false, // Don't validate immediately on load
          },
        },
        {
          name: 'phone',
          type: FormFieldType.TEXT,
          label: 'Phone',
          config: {
            validation: {
              trigger: 'change',
              debounceMs: 800, // Wait 800ms after user stops typing
            },
          },
        },
        {
          name: 'name',
          type: FormFieldType.TEXT,
          label: 'Name',
          config: {
            validation: {
              trigger: 'submit', // Only validate when form is submitted
            },
          },
        },
      ],
    },
    {
      name: 'preferences',
      heading: 'User Preferences',
      subheading: 'Configure your app preferences',
      fields: [
        {
          name: 'theme',
          label: 'Theme',
          type: FormFieldType.SELECT,
          options: [
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
            { label: 'Auto', value: 'auto' },
          ],
        },
        {
          name: 'notifications',
          heading: 'Notification Settings',
          subheading: 'Choose how you want to be notified',
          fields: [
            {
              name: 'email',
              label: 'Email Notifications',
              type: FormFieldType.SWITCH,
            },
            {
              name: 'sms',
              label: 'SMS Notifications',
              type: FormFieldType.SWITCH,
            },
            {
              name: 'push',
              label: 'Push Notifications',
              type: FormFieldType.SWITCH,
            },
          ],
        },
        {
          name: 'privacy',
          heading: 'Privacy Settings',
          subheading: 'Control your privacy preferences',
          fields: [
            {
              name: 'profileVisible',
              label: 'Profile Visible to Others',
              type: FormFieldType.SWITCH,
            },
            {
              name: 'dataSharing',
              label: 'Allow Data Sharing',
              type: FormFieldType.SWITCH,
            },
          ],
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
      ['features', 'features', 'features'],
      ['rating', 'brightness', '.'],
      ['contacts', 'contacts', 'contacts'],
      ['preferences', 'preferences', 'preferences'],
    ],
  },
};
