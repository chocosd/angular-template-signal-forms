import { inject } from '@angular/core';
import { FormFieldType } from '@enums/form-field-type.enum';
import {
  FormOption,
  SignalFormFieldBuilderInput,
} from '@models/signal-form.model';
import { TestApiService } from '@services/test-http.service';
import { map } from 'rxjs';
import { Basket } from '../models/example.model';
import { pokemonList } from './pokemon-list.const';

export const addressForm = (
  testApiService = inject(TestApiService),
): SignalFormFieldBuilderInput<Basket> => ({
  name: 'address',
  heading: 'Delivery Address',
  subheading: 'Where should we send your basket?',
  hidden: (form) => form.getField('total').value() < 100,
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
      validators: [
        (val, form) => (!val.length ? 'postcode is required' : null),
      ],
    },
    {
      name: 'country',
      label: 'Select Country',
      type: FormFieldType.AUTOCOMPLETE,
      loadOptions: (search: string) =>
        testApiService.getCountry(search).pipe(
          map((countries) =>
            countries.map((country) => ({
              label: country.name.common,
              value: country.cca2,
            })),
          ),
        ),
      config: {
        debounceMs: 200,
        minChars: 1,
      },
    },
    {
      name: 'favouritePokemonTypes',
      label: 'Favourite Pokemon Types',
      type: FormFieldType.MULTISELECT,
      options: [
        {
          label: 'Normal',
          value: 'normal',
        },
        {
          label: 'fire',
          value: 'fire',
        },
        {
          label: 'Water',
          value: 'water',
        },
        {
          label: 'grass',
          value: 'grass',
        },
        {
          label: 'Electric',
          value: 'electric',
        },
        {
          label: 'Ice',
          value: 'ice',
        },
        {
          label: 'Fighting',
          value: 'fighting',
        },
        {
          label: 'poison',
          value: 'poison',
        },
        {
          label: 'Ground',
          value: 'ground',
        },
        {
          label: 'Flying',
          value: 'flying',
        },
        {
          label: 'Psychic',
          value: 'psychic',
        },
        {
          label: 'Bug',
          value: 'bug',
        },
        {
          label: 'Rock',
          value: 'rock',
        },
        {
          label: 'Ghost',
          value: 'ghost',
        },
        {
          label: 'Dragon',
          value: 'dragon',
        },
        {
          label: 'Dark',
          value: 'dark',
        },
        {
          label: 'Steel',
          value: 'steel',
        },
        {
          label: 'Fairy',
          value: 'fairy',
        },
      ],
    },
    {
      name: 'favouritePokemon',
      label: 'Favourite Pokemon',
      type: FormFieldType.SELECT,
      options: pokemonList,
      dynamicOptions: (form, options) => {
        const selectedTypes = form
          .getField('favouritePokemonTypes')
          .value() as FormOption[];

        if (!Array.isArray(selectedTypes) || selectedTypes.length === 0) {
          return options;
        }

        const selectedTypeValues = selectedTypes.map((type) =>
          String(type.value).toLowerCase(),
        );

        return (options as typeof pokemonList).filter((opt) => {
          const types = opt.value.typings.map((t: string) => t.toLowerCase());
          return selectedTypeValues.every((selected) =>
            types.includes(selected),
          );
        });
      },
    },
    {
      name: 'instructions',
      label: 'Delivery instructions',
      type: FormFieldType.TEXTAREA,
      config: {
        placeholder: 'any delivery instructions we should know about?',
      },
    },
    {
      name: 'expectedDate',
      label: 'expected date',
      type: FormFieldType.DATETIME,
    },
    {
      name: 'postTo',
      label: 'post to',
      type: FormFieldType.MULTISELECT,
      options: [
        {
          value: 'CAN',
          label: 'Canada',
        },
        {
          value: 'RUS',
          label: 'Russia',
        },
        {
          value: 'AUS',
          label: 'Australia',
        },
      ],
    },
    {
      name: 'priority',
      label: 'Priority',
      type: FormFieldType.RADIO,
      options: [
        {
          label: 'High',
          value: 'HIGH',
        },
        {
          label: 'Medium',
          value: 'MEDIUM',
        },
        {
          label: 'Low',
          value: 'LOW',
        },
      ],
    },
  ],
  config: {
    view: 'collapsable',
    layout: 'flex',
  },
});
