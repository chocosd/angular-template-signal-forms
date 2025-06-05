import {
  ConversionUtils,
  FormFieldType,
  NumberInputType,
  type SignalFormFieldBuilderInput,
} from 'signal-template-forms';
import { type Basket } from '../models/example.model';

export const aboutForm: SignalFormFieldBuilderInput<Basket> = {
  heading: 'About you',
  subheading: 'a few small things about you',
  name: 'about',
  fields: [
    {
      name: 'profilePicture',
      type: FormFieldType.FILE,
      label: 'Profile Picture',
      config: {
        maxSizeMb: 5,
      },
    },
    {
      name: 'personal',
      heading: 'Personal Details',
      subheading: 'Tell us about yourself',
      fields: [
        {
          name: 'age',
          type: FormFieldType.NUMBER,
          label: 'Age',
          config: {
            inputType: NumberInputType.INTEGER,
            min: 13,
            max: 120,
            hint: 'You must be at least 13 years old',
          },
          validators: [
            (value: number) => (!value ? 'Age is required' : null),
            (value: number) =>
              value < 13 ? 'You must be at least 13 years old' : null,
          ],
        },
        {
          name: 'income',
          type: FormFieldType.NUMBER,
          label: 'Annual Income',
          config: {
            inputType: NumberInputType.CURRENCY,
            currencyCode: 'USD',
            locale: 'en-US',
            placeholder: 'Enter your annual income',
          },
        },
        {
          name: 'weight',
          type: FormFieldType.NUMBER,
          label: 'Weight',
          config: {
            inputType: NumberInputType.UNIT_CONVERSION,
            unitConversions: {
              unitConversions: ConversionUtils.weight,
              defaultUnit: 'kg',
              unitPosition: 'suffix',
              parser: (value) => value.toFixed(1),
              precision: 2,
            },
            hint: 'Enter your weight - units will auto-convert',
          },
        },
        {
          name: 'height',
          type: FormFieldType.NUMBER,
          label: 'Height',
          config: {
            inputType: NumberInputType.UNIT_CONVERSION,
            unitConversions: {
              unitConversions: ConversionUtils.length,
              defaultUnit: 'cm',
              unitPosition: 'suffix',
              precision: 2,
            },
          },
        },
        {
          name: 'bioDescription',
          type: FormFieldType.TEXTAREA,
          label: 'Bio Description',
          config: {
            wordCount: true,
            placeholder: 'Tell us about yourself...',
            minRows: 4,
            maxRows: 8,
          },
          validators: [
            (value: string) => {
              if (!value) {
                return null;
              }
              if (value.length > 500)
                return 'Bio must be less than 500 characters';
              return null;
            },
          ],
        },
      ],
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
          validators: [
            (value: string) => (!value ? 'Email is required' : null),
            (value: string) => {
              if (!value) {
                return null;
              }
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              return !emailRegex.test(value)
                ? 'Please enter a valid email address'
                : null;
            },
          ],
          config: {
            validation: {
              trigger: 'blur',
              debounceMs: 500,
            },
            wordCount: true,
          },
          validationConfig: {
            validateAsyncOnInit: false,
          },
        },
        {
          name: 'phone',
          type: FormFieldType.TEXT,
          label: 'Phone',
          validators: [
            (value: number) => (!value ? 'Phone number is required' : null),
            (value: number) => {
              if (!value) {
                return null;
              }
              const valueStr = value.toString();
              const digitsOnly = valueStr.replace(/\D/g, '');
              if (digitsOnly.length !== 11) {
                return 'Phone number must be exactly 11 digits long';
              }
              return null;
            },
            (value: number) => {
              if (!value) {
                return null;
              }
              const valueStr = value.toString();
              const digitsOnly = valueStr.replace(/\D/g, '');
              if (!digitsOnly.startsWith('0')) {
                return 'UK phone numbers should start with 0';
              }
              return null;
            },
          ],
          config: {
            validation: {
              trigger: 'change',
              debounceMs: 300,
            },
          },
        },
        {
          name: 'name',
          type: FormFieldType.TEXT,
          label: 'Name',
          validators: [
            (value: string) => (!value ? 'Name is required' : null),
            (value: string) => {
              if (!value) {
                return null;
              }
              if (value.length < 2) {
                return 'Name must be at least 2 characters long';
              }
              if (value.length > 50) {
                return 'Name must be less than 50 characters';
              }
              return null;
            },
            (value: string) => {
              if (!value) {
                return null;
              }
              const nameRegex = /^[a-zA-Z\s\-']+$/;
              return !nameRegex.test(value)
                ? 'Name can only contain letters, spaces, hyphens, and apostrophes'
                : null;
            },
          ],
          config: {
            validation: {
              trigger: 'submit',
            },
            wordCount: true,
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
      ['personal', 'personal', 'personal'],
    ],
  },
};
